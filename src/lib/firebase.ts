import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAKJmOrs0u9mhsbiH0vKMBxs23Wogo9ZiY",
  authDomain: "navyata-track.firebaseapp.com",
  projectId: "navyata-track",
  storageBucket: "navyata-track.firebasestorage.app",
  messagingSenderId: "818357495577",
  appId: "1:818357495577:web:ed0a076d92aa9b3ae38788"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
