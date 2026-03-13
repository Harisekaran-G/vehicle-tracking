import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB4XoYKxoldCkDNr7UKu_9LBqs6lXGSi1E",
  authDomain: "vehicle-tracking-system-76e45.firebaseapp.com",
  databaseURL: "https://vehicle-tracking-system-76e45-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vehicle-tracking-system-76e45",
  storageBucket: "vehicle-tracking-system-76e45.firebasestorage.app",
  messagingSenderId: "83295810903",
  appId: "1:83295810903:web:0cc85b13d46bd60b43ba12",
  measurementId: "G-9XXS96K8ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and Authentication
export const database = getDatabase(app);
export const auth = getAuth(app);
