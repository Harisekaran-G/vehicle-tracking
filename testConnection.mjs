import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

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

try {
  console.log("Initializing Firebase with real credentials...");
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  
  console.log("Connecting active listener to Realtime Database...");
  const connectedRef = ref(database, '.info/connected');
  
  const unsubscribe = onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log("SUCCESS ✅: Connection to Firebase Cloud established!");
      unsubscribe();
      process.exit(0);
    } else {
      console.log("...attempting connection handshakes");
    }
  });

  // Failsafe timeout
  setTimeout(() => {
    console.error("Connection timed out after 10 seconds. Check permissions/keys.");
    process.exit(1);
  }, 10000);

} catch (error) {
  console.error("Initialization failed:", error.message);
  process.exit(1);
}
