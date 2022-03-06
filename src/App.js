import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { API, Storage } from 'aws-amplify';
// import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
// <AmplifySignOut />
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const Home = () => {
    const { user, signOut } = useAuthenticator((context) => [context.user]);

    return (
        <>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1>We now have Auth!</h1>
                    <h2>Welcome, {user.username}!</h2>
                    <button onClick={signOut}>Sign Out</button>
                </header>
            </div>
        </>
    );
};

const Login = () => <Authenticator />;

const initialFormState = { name: '', description: '' }

function App() {
    const { route } = useAuthenticator((context) => [context.route]);

    // Add GraphQL Data
    const [notes, setNotes] = useState([]);
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchNotes();
    }, []);

    async function fetchNotes() {
        const apiData = await API.graphql({ query: listNotes });
        const notesFromAPI = apiData.data.listNotes.items;
        await Promise.all(notesFromAPI.map(async note => {
            if (note.image) {
                const image = await Storage.get(note.image);
                note.image = image;
            }
            return note;
        }))
        setNotes(apiData.data.listNotes.items);
    }

    async function createNote() {
        if (!formData.name || !formData.description) return;
        await API.graphql({ query: createNoteMutation, variables: { input: formData } });
        if (formData.image) {
            const image = await Storage.get(formData.image);
            formData.image = image;
        }
        setNotes([ ...notes, formData ]);
        setFormData(initialFormState);
    }

    async function deleteNote({ id }) {
        const newNotesArray = notes.filter(note => note.id !== id);
        setNotes(newNotesArray);
        await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
    }

    async function onChange(e) {
        if (!e.target.files[0]) return
        const file = e.target.files[0];
        setFormData({ ...formData, image: file.name });
        await Storage.put(file.name, file);
        fetchNotes();
    }
    // End GraphQL Data

    // return route === 'authenticated' ? <Home /> : <Login />;
    if (route === 'authenticated'){
        return (
            <div className="App">
                <h1>My Notes App</h1>
                <input
                    onChange={e => setFormData({ ...formData, 'name': e.target.value})}
                    placeholder="Note name"
                    value={formData.name}
                />
                <input
                    onChange={e => setFormData({ ...formData, 'description': e.target.value})}
                    placeholder="Note description"
                    value={formData.description}
                />
                <input
                    type="file"
                    onChange={onChange}
                />
                <button onClick={createNote}>Create Note</button>
                <div style={{marginBottom: 30}}>
                    {
                        notes.map(note => (
                            <div key={note.id || note.name}>
                                <h2>{note.name}</h2>
                                <p>{note.description}</p>
                                <button onClick={() => deleteNote(note)}>Delete note</button>
                                {
                                    note.image && <img src={note.image} style={{width: 400}} />
                                }
                            </div>
                        ))
                    }
                </div>
                <Home />
            </div>
        )
    } else {
        return <Login />
    }
}
// export default App;
// export default withAuthenticator(App);
/* return (
    <div className="App">
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>We now have Auth!</h1>
        </header>
    </div>;
); */

export default function AppWithProvider() {
    return (
        <Authenticator.Provider>
            <App/>
        </Authenticator.Provider>
    );
}