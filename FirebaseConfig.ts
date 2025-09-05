// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// This is for async storage
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGbwlMapnWfhptPZ1HwztY-EtPQhlo8rg",
  authDomain: "soulability-prototype.firebaseapp.com",
  projectId: "soulability-prototype",
  storageBucket: "soulability-prototype.firebasestorage.app",
  messagingSenderId: "1059258118121",
  appId: "1:1059258118121:web:4e099e262532e87a216578",
  measurementId: "G-24FR52D13K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
// Initialize Firebase Authentication and get a reference to the service
export const db =  getFirestore(app);
// export const auth = getAuth(app);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
