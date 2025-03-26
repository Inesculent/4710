import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
    apiKey: "AIzaSyAdz0amfkC4r3vZ1aeUMEf_94WlL0xovBk",
    authDomain: "project-4144665016839411846.firebaseapp.com",
    projectId: "project-4144665016839411846",
    storageBucket: "project-4144665016839411846.firebasestorage.app",
    messagingSenderId: "801469891635",
    appId: "1:801469891635:web:10ff87668392456d910f46",
    measurementId: "G-L53T3QYGCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();


export default app;