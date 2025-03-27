import React, { useState } from 'react';
import { X, AlertCircle, Mail, Key, Loader2, Google } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, loginWithMicrosoft, loginWithEmail, signupWithEmail } = useAuth();
  
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      onClose();
      toast.success('Successfully signed in with Google');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithMicrosoft();
      onClose();
      toast.success('Successfully signed in with Microsoft');
    } catch (error: any) {
      console.error('Microsoft sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Microsoft');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isSignUp) {
        await signupWithEmail(email, password);
        toast.success('Account created successfully');
      } else {
        await loginWithEmail(email, password);
        toast.success('Signed in successfully');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0A1425] border border-[#1E293B] rounded-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-[#1E293B]">
          <h2 className="text-lg font-medium text-white">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          {/* Invite-only message */}
          <div className="mb-5 p-3 bg-blue-900/20 border border-blue-800/40 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200">
              This platform is invite-only. If you've received an invitation code, please use it when signing up.
            </p>
          </div>
          
          {/* Social sign-in buttons */}
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 border border-[#1E293B] rounded-md flex items-center justify-center space-x-2 hover:bg-[#1E293B]/60 transition-colors"
            >
              <Google className="w-5 h-5 text-red-400" />
              <span>Continue with Google</span>
            </button>
            
            <button
              type="button"
              onClick={handleMicrosoftSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 border border-[#1E293B] rounded-md flex items-center justify-center space-x-2 hover:bg-[#1E293B]/60 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" className="mr-2">
                <path fill="#f25022" d="M1 1h9v9H1z" />
                <path fill="#00a4ef" d="M1 12h9v9H1z" />
                <path fill="#7fba00" d="M12 1h9v9h-9z" />
                <path fill="#ffb900" d="M12 12h9v9h-9z" />
              </svg>
              <span>Continue with Microsoft</span>
            </button>
          </div>
          
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E293B]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#0A1425] text-gray-400">Or continue with email</span>
            </div>
          </div>
          
          {/* Email/password form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full py-2 pl-10 pr-3 bg-[#142036] border border-[#1E293B] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2 pl-10 pr-3 bg-[#142036] border border-[#1E293B] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-5 text-center">
            <p className="text-sm text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-1 text-blue-400 hover:text-blue-300 focus:outline-none"
              >
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};