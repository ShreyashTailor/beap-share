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
  UserCredential
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
  getDoc,
  DocumentData
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { toast } from 'react-hot-toast';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Admin configuration
const ADMIN_EMAILS = [
  'shreyashop007@proton.me',
  'shreyasho007@proton.me'
].map(email => email.toLowerCase());

export const isAdmin = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Helper function to compress image
const compressImage = (file: File, maxSizeMB: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      let maxDimension = 1280; // Default max width/height reduced
      
      // For very large images, use more aggressive resizing
      if (file.size > 2000000) { // If larger than 2MB
        maxDimension = 1024; // Reduce to 1024px
      }
      if (file.size > 5000000) { // If larger than 5MB
        maxDimension = 800; // Reduce to 800px
      }
      if (file.size > 10000000) { // If larger than 10MB
        maxDimension = 640; // Reduce to 640px
      }
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Adjust quality based on file size
      let quality = 0.6; // Default quality reduced
      if (file.size > 2000000) {
        quality = 0.4; // 40% quality for files > 2MB
      }
      if (file.size > 5000000) {
        quality = 0.3; // 30% quality for files > 5MB
      }
      if (file.size > 10000000) {
        quality = 0.2; // 20% quality for files > 10MB
      }
      
      // Convert to blob with quality adjustment
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not compress image'));
          return;
        }
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => reject(new Error('Could not load image'));
  });
};

// Simple upload function that stores in Firestore
export const uploadImage = async (
  file: File, 
  user: { uid: string },
  onProgress?: (progress: number) => void
): Promise<ImageData | null> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    // Set initial progress
    if (onProgress) {
      onProgress(0);
    }

    // Compress image if it's large
    let processedFile = file;
    if (file.size > 500000) { // If larger than 500KB
      processedFile = await compressImage(file, 0.9);
      if (onProgress) onProgress(20);
    }

    // Try more aggressive compression if still too large
    if (processedFile.size > 900000) {
      processedFile = await compressImage(processedFile, 0.5);
      if (onProgress) onProgress(30);
    }

    // Read file as base64
    const base64Data = await readFileAsBase64(processedFile);
    if (onProgress) onProgress(40);
    
    // Check if base64 data is too large
    if (base64Data.length > 1000000) { // Increased to ~1MB
      throw new Error('Image is too large. Please try a smaller image or reduce its quality.');
    }
    
    const timestamp = new Date();
    const formattedSize = formatBytes(processedFile.size);
    const formattedTimestamp = formatTimestamp(timestamp);

    // Create image document in Firestore
    const imageData = {
      userId: user.uid,
      fileName: file.name,
      url: base64Data,
      contentType: processedFile.type,
      size: processedFile.size,
      formattedSize,
      formattedTimestamp,
      createdAt: serverTimestamp()
    };

    if (onProgress) onProgress(60);

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'images'), imageData);

    // Update progress to complete
    if (onProgress) {
      onProgress(100);
    }

    return {
      id: docRef.id,
      uid: user.uid,
      name: file.name,
      url: base64Data,
      contentType: processedFile.type,
      size: processedFile.size,
      formattedSize,
      formattedTimestamp,
      createdAt: timestamp,
      uploadNumber: 1
    };
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

// Get image by ID
export const getImageById = async (imageId: string): Promise<ImageData | null> => {
  try {
    const imageDoc = await getDoc(doc(db, 'images', imageId));
    
    if (!imageDoc.exists()) {
      return null;
    }

    const data = imageDoc.data();
    return {
      id: imageDoc.id,
      uid: data.userId,
      name: data.fileName,
      url: data.url,
      contentType: data.contentType,
      size: data.size,
      formattedSize: data.formattedSize,
      formattedTimestamp: data.formattedTimestamp,
      createdAt: data.createdAt?.toDate() || new Date(),
      uploadNumber: data.uploadNumber || 1
    };
  } catch (error) {
    console.error('Error getting image:', error);
    return null;
  }
};

// Delete image
export const deleteImage = async (imageId: string, userId: string): Promise<void> => {
  try {
    const imageDoc = await getDoc(doc(db, 'images', imageId));
    if (!imageDoc.exists()) {
      throw new Error('Image not found');
    }

    const imageData = imageDoc.data();
    if (imageData.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'images', imageId));
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Get user images
export const getUserImages = async (userId: string): Promise<ImageData[]> => {
  try {
    const imagesQuery = query(
      collection(db, 'images'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(imagesQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data.userId,
        name: data.fileName,
        url: data.url,
        contentType: data.contentType,
        size: data.size,
        formattedSize: data.formattedSize,
        formattedTimestamp: data.formattedTimestamp,
        createdAt: data.createdAt?.toDate() || new Date(),
        uploadNumber: data.uploadNumber || 1
      };
    });
  } catch (error) {
    console.error('Error getting user images:', error);
    throw error;
  }
};

// Helper function to read file as base64
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Helper function to format timestamp
const formatTimestamp = (date: Date): string => {
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' am';
};

// Image interface
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
}

// Auth functions
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signInWithGithub = async () => {
  try {
    return await signInWithPopup(auth, new GithubAuthProvider());
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    throw error;
  }
};

export const signInWithTwitter = async () => {
  try {
    return await signInWithPopup(auth, new TwitterAuthProvider());
  } catch (error) {
    console.error('Twitter sign-in error:', error);
    throw error;
  }
};

export const signInWithMicrosoft = async () => {
  try {
    return await signInWithPopup(auth, new OAuthProvider('microsoft.com'));
  } catch (error) {
    console.error('Microsoft sign-in error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

export const logOut = () => signOut(auth);

// User plans
export const USER_PLANS = {
  DEFAULT: 'default',
  PREMIUM: 'premium',
  ADMIN: 'admin'
};

// User interface
export interface UserData {
  id: string;
  source: string;
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  plan?: string;
  isAdmin?: boolean;
  createdAt?: any;
  inviteCount?: number;
  usedInvites?: number;
}

// Get user data
export const getUserData = async (email: string) => {
  try {
    if (!email) return null;
    
    // Check if admin
    if (isAdmin(email)) {
      return { 
        isAdmin: true, 
        plan: USER_PLANS.PREMIUM,
        inviteCount: 999,
        usedInvites: 0
      };
    }
    
    // Get user data from invites collection
    const invitesRef = collection(db, 'invites');
    const q = query(invitesRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return {
        isAdmin: userData.isAdmin || false,
        plan: userData.plan || USER_PLANS.DEFAULT,
        inviteCount: userData.inviteCount || 0,
        usedInvites: userData.usedInvites || 0
      };
    }
    
    return { 
      isAdmin: false, 
      plan: USER_PLANS.DEFAULT,
      inviteCount: 0,
      usedInvites: 0
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return { 
      isAdmin: false, 
      plan: USER_PLANS.DEFAULT,
      inviteCount: 0,
      usedInvites: 0
    };
  }
};

// Sign up with email
export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create user data in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email: userCredential.user.email || '',
    displayName: userCredential.user.displayName || '',
    photoURL: userCredential.user.photoURL || '',
    plan: USER_PLANS.DEFAULT,
    isAdmin: isAdmin(email),
    createdAt: serverTimestamp()
  });

  return userCredential;
};

// Get all users data
export const getAllUsersData = async (): Promise<UserData[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser?.email || !isAdmin(currentUser.email)) {
      throw new Error('Unauthorized access');
    }

    const usersRef = collection(db, 'users');
    const invitesRef = collection(db, 'invites');
    
    // Get all users from both collections
    const [usersSnapshot, invitesSnapshot] = await Promise.all([
      getDocs(usersRef),
      getDocs(invitesRef)
    ]);

    const users = usersSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      source: 'users'
    } as UserData));

    const invites = invitesSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      source: 'invites'
    } as UserData));

    // Combine and sort by creation date
    return [...users, ...invites].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error getting users data:', error);
    throw error;
  }
};

// Get storage stats
export const getStorageStats = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser?.email || !isAdmin(currentUser.email)) {
      throw new Error('Unauthorized access');
    }

    const imagesRef = collection(db, 'images');
    const snapshot = await getDocs(imagesRef);
    
    let totalSize = 0;
    const fileCount = snapshot.size;

    snapshot.forEach(doc => {
      totalSize += doc.data().size || 0;
    });

    return { totalSize, fileCount };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw error;
  }
};
