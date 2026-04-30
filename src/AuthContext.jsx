import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db,
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  doc, getDoc, setDoc, updateDoc
} from './firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("🔐 Auth State Changed:", currentUser ? `User: ${currentUser.email}` : "No User");
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch additional user data from Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          console.log("📄 User Data Loaded:", data);
        } else {
          // Create initial user doc if it doesn't exist
          const initialData = { 
            isPaid: false, 
            createdAt: new Date().toISOString(),
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          };
          await setDoc(userRef, initialData);
          setUserData(initialData);
          console.log("🆕 New User Document Created");
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("🌐 Google Login Success:", result.user.displayName);
      return result;
    } catch (error) {
      console.error("🌐 Google Login Error:", error);
      throw error;
    }
  };

  const registerWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const upgradeUser = async () => {
    if (user) {
      await updateDoc(doc(db, "users", user.uid), { isPaid: true });
      setUserData(prev => ({ ...prev, isPaid: true }));
    }
    setTestMode(true); 
  };

  // User is premium if Firestore says so OR if testMode is on
  const isPremium = Boolean(testMode || (userData && userData.isPaid)); 

  const value = {
    user,
    userData,
    loading,
    testMode,
    setTestMode,
    isPremium,
    upgradeUser,
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
