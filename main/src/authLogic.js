import { getAuth, GoogleAuthProvider, signInWithPopup, signOut} from 'firebase/auth';
import { auth } from './firebase'; // Import your Firebase instance

const provider = new GoogleAuthProvider(); // Initialize Google provider

export const signInWithGoogle = async (updateUser) => {
    try {
        const result = await signInWithPopup(auth, provider); // Popup for sign-in
        const user = result.user; // Access user info
        console.log('Google Sign-In successful:', user);
        if (updateUser) {
            updateUser(user); // Update the user state
        }
    } catch (error) {
        console.error('Error during Google Sign-In:', error.message);
    }
};


// To be implemented
export const logOut = async () => {
    try{
        await signOut(auth);

        console.log('User signed out successfully');
    }
    catch(error){
        console.error('Error during Sign-Out:', error.message);
    }
};
