import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';
import './index.css';
import { 
  uploadImage, 
  deleteImage,
  getUserImages,
  ImageData,
  UserData as FirebaseUserData,
  auth,
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithEmail,
  signUpWithEmail,
  logOut,
  getUserData as getFirebaseUserData,
  isAdmin as checkIsAdmin,
  getAllUsersData,
  getStorageStats
} from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import ShareModal from './components/ShareModal';

// Define interfaces
interface User {
  email: string;
  uid: string;
}

interface UserData {
  uid: string;
  email: string;
  createdAt: Date;
  isAdmin: boolean;
  plan: string;
  inviteCount: number;
  usedInvites: number;
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  
  // Properly typed user state
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add gallery view state
  const [isGalleryView, setIsGalleryView] = useState(false);

  // Add selected image state
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Add new state for admin settings
  const [showAdminSettings, setShowAdminSettings] = useState(false);

  // Add loading states
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);

  // Add upload progress state
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [adminData, setAdminData] = useState<{
    users: any[];
    storageStats: { totalSize: number; fileCount: number };
  }>({ users: [], storageStats: { totalSize: 0, fileCount: 0 }});

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userEmail = firebaseUser.email || '';
        setUser({
          email: userEmail,
          uid: firebaseUser.uid
        });
        
        // Get user data from Firestore and check admin status
        try {
          const userData = await getFirebaseUserData(userEmail);
          if (userData) {
            setUserData(userData as UserData);
            // Check both in Firestore and direct admin list
            setIsAdmin(userData.isAdmin || checkIsAdmin(userEmail));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Still check direct admin list even if Firestore fails
          setIsAdmin(checkIsAdmin(userEmail));
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user's images
  useEffect(() => {
    const loadUserImages = async () => {
      if (!user) return;
      
      setIsLoadingImages(true);
      try {
        const images = await getUserImages(user.uid);
        setUploadedImages(images);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load images');
      } finally {
        setIsLoadingImages(false);
      }
    };

    loadUserImages();
  }, [user]);

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      if (!isAdmin) return;
      
      setIsLoadingAdminData(true);
      try {
        const [users, stats] = await Promise.all([
          getAllUsersData(),
          getStorageStats()
        ]);
        
        setAdminData({
          users,
          storageStats: stats
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to load admin data');
      } finally {
        setIsLoadingAdminData(false);
      }
    };

    loadAdminData();
  }, [isAdmin]);

  // Update onDrop to handle uploads properly
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('Please sign in to upload images');
      return;
    }

    const uploadFile = async (file: File) => {
      const fileId = `${Date.now()}_${file.name}`;
      
      try {
        // Initialize progress for this file
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Upload the file
        const imageData = await uploadImage(file, user, (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        });
        
        if (imageData) {
          setUploadedImages(prev => [imageData, ...prev]);
          toast.success(`${file.name} uploaded successfully!`);
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(error.message || `Failed to upload ${file.name}`);
      } finally {
        // Clear progress for this file
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    };

    // Upload files sequentially to avoid overwhelming the connection
    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  // Update URL upload handler
  const handleUrlUpload = async () => {
    if (!user || !uploadUrl) {
      toast.error('Please sign in and provide a URL');
      return;
    }
    
    const fileId = `url_${Date.now()}`;
    
    try {
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // First try to fetch the image
      const response = await fetch(uploadUrl);
      if (!response.ok) throw new Error('Failed to fetch image from URL');
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }
      
      const blob = await response.blob();
      const fileName = uploadUrl.split('/').pop() || 'image.jpg';
      const file = new File([blob], fileName, { type: contentType });
      
      // Upload the file
      const imageData = await uploadImage(file, user, (progress) => {
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      });
      
      if (imageData) {
        setUploadedImages(prev => [imageData, ...prev]);
        setUploadUrl('');
        toast.success('Image uploaded successfully!');
      }
    } catch (error: any) {
      console.error('URL upload error:', error);
      toast.error(error.message || 'Failed to upload image from URL');
    } finally {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    if (!user) return;

    try {
      await deleteImage(imageId, user.uid);
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image');
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      setShowAuthModal(false);
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password);
      setShowAuthModal(false);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
      toast.success('Signed in with Google successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Microsoft sign in
  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithMicrosoft();
      setShowAuthModal(false);
      toast.success('Signed in with Microsoft successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Microsoft');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out');
    }
  };

  // Update the auth modal form to include invite code input when signing up
  const authForm = (
    <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
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

        {isSignUp && (
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-400 mb-1">
              Invite Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter your invite code"
                className="w-full py-2 pl-10 pr-3 bg-[#142036] border border-[#1E293B] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
            </>
          ) : (
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          )}
        </button>
      </div>
    </form>
  );

  // Add admin check for the current user
  const isCurrentUserAdmin = user?.email === 'shreyashop007@proton.me';

  // Update gallery navigation
  const toggleGalleryView = () => {
    setIsGalleryView(!isGalleryView);
  };

  // Add Discord share function
  const getShareUrl = (imageId: string) => {
    return `https://beap.studio/share/${imageId}`;
  };

  // Update admin settings panel to show real data
  const adminSettingsPanel = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAdminSettings(false)} />
        <div className="relative bg-[#0A1425] rounded-xl p-6 w-full max-w-4xl border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-white">Admin Settings</h2>
          <button
              onClick={() => setShowAdminSettings(false)}
              className="text-gray-400 hover:text-white transition-colors"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
          </div>

          {isLoadingAdminData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">User Management</h3>
                <div className="bg-[#142036] rounded-lg p-4 border border-gray-800">
                  <p className="text-sm text-gray-300">Total Users: {adminData.users.length}</p>
                  <p className="text-sm text-gray-300">Premium Users: {adminData.users.filter(u => u.plan === 'premium').length}</p>
                </div>
                <div className="bg-[#142036] rounded-lg p-4 border border-gray-800 max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-400">
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Plan</th>
                        <th className="pb-2">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {adminData.users.map((user, index) => (
                        <tr key={index} className="border-t border-gray-800">
                          <td className="py-2 text-gray-300">{user.email}</td>
                          <td className="py-2 text-gray-300">{user.plan}</td>
                          <td className="py-2 text-gray-300">
                            {user.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Storage Usage</h3>
                <div className="bg-[#142036] rounded-lg p-4 border border-gray-800">
                  <p className="text-sm text-gray-300">Total Storage: {formatBytes(adminData.storageStats.totalSize)}</p>
                  <p className="text-sm text-gray-300">Files Uploaded: {adminData.storageStats.fileCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Update the admin badge section in the header to include settings button
  const adminBadge = isAdmin && (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 px-2 py-1 bg-green-600/20 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.95-7 10.18-3.87-1.23-7-5.51-7-10.18V6.3l7-3.12z"/>
          <path d="M12 7L9 9.5l1 2.5-2 2h3l1 3 1-3h3l-2-2 1-2.5L12 7z"/>
        </svg>
        <span className="text-xs font-medium text-green-400">Admin</span>
      </div>
      <button
        onClick={() => setShowAdminSettings(true)}
        className="p-1 hover:bg-[#1E293B] rounded-full transition-colors"
        title="Admin Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );

  // Update the main content section to show loading state
  const renderContent = () => {
    if (!user) {
      return (
        <div className="text-center py-16 space-y-6">
          <div className="flex justify-center">
            <img src="/beap-share-logo.svg" alt="BeapShare" className="h-16 w-16" />
          </div>
          <h2 className="text-3xl font-medium tracking-tight">Welcome to BeapShare</h2>
          <p className="text-lg text-gray-400 mb-2">Sign in to start sharing your images</p>
          
          <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-5 rounded-xl border border-blue-800/40 mt-6">
            <div className="flex items-start space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <h3 className="font-medium text-blue-300 mb-1">Pre-Alpha Stage</h3>
                <p className="text-sm text-blue-200 opacity-80">
                  BeapShare is currently in pre-alpha. Bugs may occur, and if you encounter any issues, please report them to our Discord server.
                </p>
                <p className="text-sm text-blue-200 mt-2 opacity-80">
                  This platform will be invite-only after the pre-alpha stage. Contact us on Discord for more information.
                </p>
                <a 
                  href="https://discord.gg/sV2KBMqRHj" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center space-x-2 mt-3 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg text-white transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 71 55" fill="currentColor">
                    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                  </svg>
                  <span>Join our Discord</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isLoadingImages) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400">Loading your images...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {isGalleryView ? (
          uploadedImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="group relative bg-[#0A1425]/50 backdrop-blur-xl rounded-lg overflow-hidden border border-gray-800">
                  <img src={image.url} alt={image.name} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-4 space-y-2">
                      <button
                        onClick={() => {
                          setSelectedImage(image);
                          setShowShareModal(true);
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-[#0A1425]/80 backdrop-blur-sm">
                    <p className="text-sm text-gray-300 truncate">{image.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatBytes(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">No images uploaded yet.</p>
            </div>
          )
        ) : (
          <div className="bg-[#0A1425]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-medium mb-4">Upload Your Images</h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="Paste image URL, or paste anywhere on page"
                  className="w-full bg-[#142036] border border-[#1E293B] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleUrlUpload}
                  disabled={isLoading || !uploadUrl}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
              <p className="text-xs text-gray-500">Pro tip: You can press Ctrl+V (or Cmd+V on Mac) anywhere on this page to paste an image URL, or an image from your clipboard.</p>
            </div>
            
            <div className="mt-6">
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-[#1E293B] rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-300">Drag & drop an image here, or click to select</p>
                  <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, PNG, GIF, WEBP</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/40 rounded-lg">
              <h3 className="text-sm font-medium text-blue-400 mb-2">Upload limits per plan:</h3>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Standard plan: Up to 50MB per file</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Update progress display component
  const renderUploadProgress = () => {
    const uploads = Object.entries(uploadProgress);
    if (uploads.length === 0) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {uploads.map(([fileId, progress]) => (
          <div key={fileId} className="bg-[#0A1425] rounded-lg p-4 border border-gray-800 w-64 shadow-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Uploading...</span>
              <span className="text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-[#142036] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#0A1425',
            color: '#fff',
            border: '1px solid #1E293B',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#0A1425',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#0A1425',
            },
          },
        }}
      />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#0A1425]/80 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/beap-share-logo.svg" alt="BeapShare" className="h-8 w-8" />
            <span className="text-xl font-semibold">BeapShare</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">{user.email}</span>
                  {adminBadge}
                </div>
                <button
                  onClick={toggleGalleryView}
                  className="px-4 py-2 text-sm font-medium text-white hover:text-blue-400 transition-colors"
                >
                  {isGalleryView ? 'Upload' : 'Gallery'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1425]/30 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Plans</h3>
              <ul className="mt-4 space-y-2">
                <li className="text-sm text-gray-500 hover:text-white transition-colors">
                  <a href="#standard">Standard Plan</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Features</h3>
              <ul className="mt-4 space-y-2">
                <li className="text-sm text-gray-500 hover:text-white transition-colors">
                  <a href="#">Image Sharing</a>
                </li>
                <li className="text-sm text-gray-500 hover:text-white transition-colors">
                  <a href="#">Cloud Storage</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Support</h3>
              <ul className="mt-4 space-y-2">
                <li className="text-sm text-gray-500 hover:text-white transition-colors">
                  <a href="https://discord.gg/sV2KBMqRHj" target="_blank" rel="noopener noreferrer">Discord Community</a>
                </li>
                <li className="text-sm text-gray-500 hover:text-white transition-colors">
                  <a href="https://discord.gg/sV2KBMqRHj" target="_blank" rel="noopener noreferrer">Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li className="text-sm text-gray-500 hover:text-white transition-colors">
                  <a href="/privacy.html">Privacy Policy</a>
                </li>
                <li className="text-sm text-gray-500 hover:text-white transition-colors">
                  <a href="/terms.html">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-500 text-center">&copy; {new Date().getFullYear()} BeapShare. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Share Modal */}
      {selectedImage && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedImage(null);
          }}
          imageUrl={selectedImage.url}
          imageId={selectedImage.id}
        />
      )}

      {/* Auth Modal - Make it more compact */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
            <div className="relative bg-[#0A1425] rounded-xl p-6 w-full max-w-md border border-gray-800">
              <div className="flex justify-between items-center p-4 border-b border-[#1E293B]">
                <h2 className="text-lg font-medium text-white">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </h2>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-5">
                {/* Invite-only message */}
                <div className="mb-5 p-3 bg-blue-900/20 border border-blue-800/40 rounded-md flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
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
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-400">
                      <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                    </svg>
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
                {authForm}
                
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
        </div>
      )}

      {/* Add admin settings panel */}
      {showAdminSettings && adminSettingsPanel}

      {/* Add upload progress display */}
      {renderUploadProgress()}
    </div>
  );
}

export default App;
