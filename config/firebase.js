import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDIjFSNMibnu0g28D0CMgWQSKjR6Wfzxf0",
  authDomain: "chat-app-949d2.firebaseapp.com",
  databaseURL: "https://chat-app-949d2-default-rtdb.firebaseio.com",
  projectId: "chat-app-949d2",
  storageBucket: "chat-app-949d2.appspot.com",
  messagingSenderId: "457458352476",
  appId: "1:457458352476:web:72044dc1e51c2ed7f00199"
};
// initialize firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
