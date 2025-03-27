import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  auth, 
  signInWithGoogle, 
  signInWithMicrosoft, 
  signInWithEmail, 
  signUpWithEmail, 
  logout, 
  USER_PLANS,
  getUserData,
  UserData
} from '../lib/firebase';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  plan: string;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, inviteCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithGoogle();
      
      // User data is loaded automatically via the auth listener
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign-in');
      throw err;
    }
  };

  const handleSignInWithMicrosoft = async () => {
    try {
      setError(null);
      const result = await signInWithMicrosoft();
      
      // User data is loaded automatically via the auth listener
    } catch (err: any) {
      setError(err.message || 'An error occurred during Microsoft sign-in');
      throw err;
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmail(email, password);
      
      // User data is loaded automatically via the auth listener
    } catch (err: any) {
      setError(err.message || 'An error occurred during email sign-in');
      throw err;
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string, inviteCode?: string) => {
    try {
      setError(null);
      const result = await signUpWithEmail(email, password, inviteCode);
      
      // User data is loaded automatically via the auth listener
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign-up');
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      setError(null);
      await logout();
      setUser(null);
      setUserData(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
      throw err;
    }
  };

  const value = {
    user,
    userData,
    isAdmin: userData?.isAdmin || false,
    plan: userData?.plan || USER_PLANS.DEFAULT,
    loading,
    error,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithMicrosoft: handleSignInWithMicrosoft,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 