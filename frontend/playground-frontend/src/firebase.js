import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMJgYSG_TW7CT_krdWaFUBLxU4yRINxX8",
  authDomain: "deep-learning-playground-8d2ce.firebaseapp.com",
  projectId: "deep-learning-playground-8d2ce",
  storageBucket: "deep-learning-playground-8d2ce.appspot.com",
  messagingSenderId: "771338023154",
  appId: "1:771338023154:web:8ab6e73fc9c646426a606b",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = getAuth();

export { app, auth };
