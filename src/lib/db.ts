import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
  UserCredential,
  setPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  getDoc
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Configure authentication persistence
setPersistence(auth, browserLocalPersistence);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithGithub = () => signInWithPopup(auth, githubProvider);
export const signInWithTwitter = () => signInWithPopup(auth, twitterProvider);
export const signInWithMicrosoft = () => signInWithPopup(auth, microsoftProvider);
export const signInWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);
export const signUpWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    createdAt: serverTimestamp(),
    plan: 'default',
    isAdmin: false
  });
  return userCredential;
};
export const logOut = () => signOut(auth);

// User types
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: string;
  isAdmin: boolean;
  createdAt: Date;
  inviteCount: number;
}

// Image types
export interface ImageData {
  id: string;
  uid: string;
  name: string;
  url: string;
  contentType: string;
  size: number;
  formattedSize: string;
  formattedTimestamp: string;
  createdAt: Date;
  uploadNumber: number;
  storagePath?: string;
}

// Constants
export const USER_PLANS = {
  DEFAULT: 'default',
  PREMIUM: 'premium',
  ADMIN: 'admin'
} as const;

// Admin emails (move to environment variables in production)
export const ADMIN_EMAILS = [
  import.meta.env.VITE_ADMIN_EMAIL_1,
  import.meta.env.VITE_ADMIN_EMAIL_2
].filter(Boolean).map(email => email?.toLowerCase());

export const isAdmin = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}; 
