import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, updateDoc, arrayUnion, query, where, getDocs, setDoc  } from "firebase/firestore";
import { 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA1zyiJIwM_co-vDXibtpA5OX-kXfXqzQk",
  authDomain: "quickmed-e6f22.firebaseapp.com",
  projectId: "quickmed-e6f22",
  storageBucket: "quickmed-e6f22.firebasestorage.app",
  messagingSenderId: "734596121451",
  appId: "1:734596121451:web:fa62bee42d51a39246422e",
  measurementId: "G-2BN0XLY3E1"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export {
  collection,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  setDoc
};
