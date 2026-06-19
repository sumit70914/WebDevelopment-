import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeO_naA3LWZNVLF-87SoEJfWjvTgBLspY",
  authDomain: "webdevelopment-9c914.firebaseapp.com",
  projectId: "webdevelopment-9c914",
  storageBucket: "webdevelopment-9c914.firebasestorage.app",
  messagingSenderId: "876620840014",
  appId: "1:876620840014:web:a5ac4150e9d6af3b73571f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

