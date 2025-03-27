import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { GoogleLogo, GitHubLogo, MicrosoftLogo, TwitterLogo } from './icons/SocialIcons';
import { Ticket, ZapIcon } from 'lucide-react';

interface WelcomeScreenProps {
  onRedeemCode: () => void;
  onGetAccess: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onRedeemCode, onGetAccess, onSignIn }: WelcomeScreenProps) {
  const [signingIn, setSigningIn] = useState(false);
  const { loginWithGoogle, loginWithGithub, loginWithMicrosoft } = useAuth();
  
  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setSigningIn(false);
    }
  };
  
  const handleGithubSignIn = async () => {
    setSigningIn(true);
    try {
      await loginWithGithub();
    } catch (error) {
      console.error('GitHub sign in error:', error);
    } finally {
      setSigningIn(false);
    }
  };
  
  const handleMicrosoftSignIn = async () => {
    setSigningIn(true);
    try {
      await loginWithMicrosoft();
    } catch (error) {
      console.error('Microsoft sign in error:', error);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('/bg-pattern.png')] bg-cover bg-center">
      <div className="w-full max-w-md bg-[#111827] border border-[#1E293B] rounded-xl shadow-2xl p-6 mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Logo" width={60} height={60} className="w-[60px] h-[60px]" />
          </div>
          <h1 className="text-2xl font-bold text-white">ImageVault</h1>
          <p className="text-gray-400 mt-2">Securely store and share your images</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-3">
            <Button 
              variant="outline" 
              className="bg-[#1E293B]/30 hover:bg-[#1E293B] border-[#1E293B] text-white flex items-center justify-center"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
            >
              <GoogleLogo className="w-5 h-5 mr-2" />
              Sign in with Google
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-[#1E293B]/30 hover:bg-[#1E293B] border-[#1E293B] text-white flex items-center justify-center"
              onClick={handleGithubSignIn}
              disabled={signingIn}
            >
              <GitHubLogo className="w-5 h-5 mr-2" />
              Sign in with GitHub
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-[#1E293B]/30 hover:bg-[#1E293B] border-[#1E293B] text-white flex items-center justify-center"
              onClick={handleMicrosoftSignIn}
              disabled={signingIn}
            >
              <MicrosoftLogo className="w-5 h-5 mr-2" />
              Sign in with Microsoft
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-4 mt-8">
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white flex items-center"
              onClick={onRedeemCode}
            >
              <Ticket className="w-4 h-4 mr-1" />
              Redeem Code
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-blue-400 hover:text-blue-300 flex items-center"
              onClick={onGetAccess}
            >
              <ZapIcon className="w-4 h-4 mr-1" />
              Get Access
            </Button>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-center text-gray-500">
          By signing in, you agree to our <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a> and <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
} 