// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDS6T7KcU-xPaCzfdzhrlqRlFqIZYLEF6w",
  authDomain: "lab4-3998b.firebaseapp.com",
  projectId: "lab4-3998b",
  storageBucket: "lab4-3998b.firebasestorage.com", // Зверніть увагу: appspot.com
  messagingSenderId: "180370247986",
  appId: "1:180370247986:web:fe23ec7088e7d6643f472b",
  measurementId: "G-8JY735QTXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);  // Ініціалізація автентифікації
const db = getFirestore(app);

// Експортуємо auth (разом з іншими об'єктами, якщо потрібно)
export { auth, analytics, db }