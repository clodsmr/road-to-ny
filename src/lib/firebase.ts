// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// La tua config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD8d49Jfq8netKWIcdhKv_MQTakO1OayCc",
  authDomain: "road-to-ny.firebaseapp.com",
  projectId: "road-to-ny",
  storageBucket: "road-to-ny.firebasestorage.app",
  messagingSenderId: "530090129839",
  appId: "1:530090129839:web:c7fd3e0c8f64ac55ec575a",
  measurementId: "G-S8Y048NYJT",
};

// Se Firebase è già inizializzato (hot reload Next.js), riutilizza l’app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
