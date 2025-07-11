// Firebase configuration
// Replace with your actual config from Firebase Console

export const firebaseConfig = {
  apiKey: "AIzaSyAWHKoZXN8FpI2RrDfx4TMmb_GpfGFcg84",
  authDomain: "govt-billing-solution.firebaseapp.com",
  projectId: "govt-billing-solution",
  storageBucket: "govt-billing-solution.firebasestorage.app",
  messagingSenderId: "785051742507",
  appId: "1:785051742507:web:afdda02f1fcbff71a1d56e"
};

// Import Firebase SDK for web
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase for web
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Test Firebase App connection
import { FirebaseApp } from '@capacitor-firebase/app';

export const testFirebaseConnection = async () => {
  try {
    const name = await FirebaseApp.getName();
    const options = await FirebaseApp.getOptions();
    console.log('Firebase App Name:', name);
    console.log('Firebase App Options:', options);
    return { success: true, name, options };
  } catch (error) {
    console.error('Firebase connection error:', error);
    return { success: false, error };
  }
};
