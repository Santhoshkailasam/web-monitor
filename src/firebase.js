import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVijnCXA1IZph2MtuwaJNVH0BRkrgRnpk",
  authDomain: "village-connect-d610c.firebaseapp.com",
  projectId: "village-connect-d610c",
  storageBucket: "village-connect-d610c.firebasestorage.app",
  messagingSenderId: "889446275884",
  appId: "1:889446275884:web:79493f9d471f11f3aaea89",
  measurementId: "G-51H0MRH1M4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
};