import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDoXZAuRDFZS1SsL-Vr9HnRqhP_wTAXG9k",
  authDomain: "newa-7f20e.firebaseapp.com",
  projectId: "newa-7f20e",
  storageBucket: "newa-7f20e.appspot.com",
  messagingSenderId: "841815689922",
  appId: "1:841815689922:web:cfa85e8d26afd2b7c1095b",
  measurementId: "G-NR27JZGPB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);
export { app, auth, db, analytics, storage };