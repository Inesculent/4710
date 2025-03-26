import React from "react";
import './App.css';
import app from './firebase';
import { getAuth } from 'firebase/auth';
import Buttons from './signInWithGoogle';

const auth = getAuth(app);
const { GoogleSignInButton, GoogleSignOutButton } = Buttons;

function App() {
    return (
        <div className="App">
            <h1>Hello</h1>
        </div>
    );
}

export default App;
