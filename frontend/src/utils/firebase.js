// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6I3UABR6cANnOOyVIsICIcjI84giL1d8",
  authDomain: "project-register-932ea.firebaseapp.com",
  projectId: "project-register-932ea",
  storageBucket: "project-register-932ea.appspot.com",
  messagingSenderId: "1054001837515",
  appId: "1:1054001837515:web:48520ca80472a6341ef24e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
