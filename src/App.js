import React from 'react';
import logo from './logo.svg';
import './App.css';
// import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
// <AmplifySignOut />
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const Home = () => {
    const { user, signOut } = useAuthenticator((context) => [context.user]);

    return (
        <>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1>We now have Auth!</h1>
                </header>
            </div>
            <h2>Welcome, {user.username}!</h2>
            <button onClick={signOut}>Sign Out</button>
        </>
    );
};

const Login = () => <Authenticator />;

function App() {
    const { route } = useAuthenticator((context) => [context.route]);
    return route === 'authenticated' ? <Home /> : <Login />;
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
            <App></App>
        </Authenticator.Provider>
    );
}