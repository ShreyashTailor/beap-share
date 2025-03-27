import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  checkInvitation, 
  signInWithGoogle, 
  signInWithGithub, 
  signInWithTwitter, 
  signInWithMicrosoft, 
  signInWithEmail, 
  signUpWithEmail, 
  logOut,
  addUserToInvites,
  isAdmin,
  signInWithGoogleRedirect,
  signInWithGithubRedirect,
  signInWithTwitterRedirect,
  signInWithMicrosoftRedirect,
  debugAuth,
  USER_PLANS
} from '../lib/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isInvited: boolean;
  isAdmin: boolean;
  plan: string;
  setPlan: (plan: string) => void;
  setUser: (user: User | null) => void;
  setIsInvited: (invited: boolean) => void;
  setIsAdmin: (admin: boolean) => void;
  loginWithGoogle: () => Promise<any>;
  loginWithGithub: () => Promise<any>;
  loginWithMicrosoft: () => Promise<any>;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  registerWithEmail: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isInvited: false,
  isAdmin: false,
  plan: USER_PLANS.FREE,
  setPlan: () => {},
  setUser: () => {},
  setIsInvited: () => {},
  setIsAdmin: () => {},
  loginWithGoogle: async () => {},
  loginWithGithub: async () => {},
  loginWithMicrosoft: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInvited, setIsInvited] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [plan, setPlan] = useState(USER_PLANS.FREE);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      
      setUser(user);
      
      if (user?.email) {
        try {
          // Check if user is invited
          const invitationStatus = await checkInvitation(user.email);
          setIsInvited(invitationStatus.invited);
          setIsAdmin(invitationStatus.isAdmin);
          setPlan(invitationStatus.plan);
        } catch (error) {
          console.error('Error checking invitation:', error);
        }
      } else {
        setIsInvited(false);
        setIsAdmin(false);
        setPlan(USER_PLANS.FREE);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error);
    const errorMessage = error.message || 'Authentication failed';
    toast.error(errorMessage);
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      debugAuth();
      
      let result;
      
      try {
        // Try standard method first
        result = await signInWithGoogle();
      } catch (error) {
        console.log('Standard Google sign-in failed, trying alternative method...');
        // If it fails, try the alternative method
        result = await signInWithGoogleRedirect();
      }
      
      console.log('Google sign in successful:', result);
      
      // Add user to invites
      if (result?.user?.email) {
        await addUserToInvites(result.user.email);
      }
      
      return result;
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Google sign-in failed. Please try another method.');
      handleAuthError(error);
    }
  };

  const loginWithGithub = async () => {
    try {
      console.log('Attempting GitHub sign in...');
      debugAuth();
      
      let result;
      
      try {
        // Try standard method first
        result = await signInWithGithub();
      } catch (error) {
        console.log('Standard GitHub sign-in failed, trying alternative method...');
        // If it fails, try the alternative method
        result = await signInWithGithubRedirect();
      }
      
      console.log('GitHub sign in successful:', result);
      
      // Add user to invites
      if (result?.user?.email) {
        await addUserToInvites(result.user.email);
      } else {
        console.warn('GitHub auth succeeded but no email was returned');
        toast.warning('Sign in successful, but no email was provided by GitHub');
      }
      
      return result;
    } catch (error: any) {
      console.error('GitHub sign in error:', error);
      // Show specific error message for common GitHub auth issues
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error('An account already exists with the same email. Try a different sign-in method.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled. Please try again.');
      } else {
        toast.error('GitHub sign-in failed. Please try another method.');
      }
      handleAuthError(error);
    }
  };

  const loginWithMicrosoft = async () => {
    try {
      console.log('Attempting Microsoft sign in...');
      debugAuth();
      
      let result;
      
      try {
        // Try standard method first
        result = await signInWithMicrosoft();
      } catch (error) {
        console.log('Standard Microsoft sign-in failed, trying alternative method...');
        // If it fails, try the alternative method
        result = await signInWithMicrosoftRedirect();
      }
      
      console.log('Microsoft sign in successful:', result);
      
      // Add user to invites
      if (result?.user?.email) {
        await addUserToInvites(result.user.email);
      } else {
        console.warn('Microsoft auth succeeded but no email was returned');
        toast.warning('Sign in successful, but no email was provided by Microsoft');
      }
      
      return result;
    } catch (error: any) {
      console.error('Microsoft sign in error:', error);
      // Show specific error message for common Microsoft auth issues
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error('An account already exists with the same email. Try a different sign-in method.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled. Please try again.');
      } else {
        toast.error('Microsoft sign-in failed. Please try another method.');
      }
      handleAuthError(error);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      console.log('Attempting email sign in...');
      const result = await signInWithEmail(email, password);
      console.log('Email sign in successful');
      
      // Add user to invites
      await addUserToInvites(email);
      
      return result;
    } catch (error: any) {
      console.error('Email sign in error:', error);
      // Handle specific Firebase auth errors with user-friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many login attempts. Please try again later');
      } else {
        handleAuthError(error);
      }
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      console.log('Attempting email registration...');
      const result = await signUpWithEmail(email, password);
      console.log('Email registration successful');
      
      // Add user to invites
      await addUserToInvites(email);
      
      return result;
    } catch (error: any) {
      console.error('Email registration error:', error);
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Try signing in instead');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use a stronger password');
      } else {
        handleAuthError(error);
      }
    }
  };

  const logout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isInvited,
        isAdmin,
        plan,
        setPlan,
        setUser,
        setIsInvited,
        setIsAdmin,
        loginWithGoogle,
        loginWithGithub,
        loginWithMicrosoft,
        loginWithEmail,
        registerWithEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};