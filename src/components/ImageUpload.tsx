import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link2, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { USER_PLANS } from '../lib/firebase';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export const ImageUpload = ({ onUpload }: ImageUploadProps) => {
  const { user, isAdmin } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Get the max file size based on user plan or admin status
  const getUserPlanMaxSize = () => {
    if (isAdmin) {
      return Number.MAX_SAFE_INTEGER; // No limit for admins
    }
    return 20 * 1024 * 1024; // Default to 20MB for regular users
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload images');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = 'upload-progress';
    toast.loading('Starting upload...', { id: toastId });
    
    try {
      // Initial progress for starting the upload
      setUploadProgress(5);
      
      // Small delay to show initial progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Progress for processing
      setUploadProgress(15);
      
      // Upload the file
      const result = await onUpload(file);
      
      // Show quick progress to completion
      setUploadProgress(70);
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(100);
      
      toast.success('Upload completed successfully!', { id: toastId });
      
      // Reset after success
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
      
      return result;
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to upload file. Please try again.';
      
      if (error.message?.includes('size exceeds')) {
        errorMessage = error.message;
      } else if (error.message?.includes('permission')) {
        errorMessage = 'You do not have permission to upload files.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'Storage quota exceeded. Please upgrade your plan.';
      }
      
      toast.error(errorMessage, { id: toastId });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleUpload(file);
    }
  }, [user, isAdmin]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: isAdmin ? undefined : { 'image/*': [] },
    maxFiles: 1,
    disabled: isUploading,
    maxSize: isAdmin ? undefined : getUserPlanMaxSize()
  });

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    
    // URL validation
    try {
      new URL(urlInput);
      toast.error('URL upload is not available in this version');
    } catch (error) {
      toast.error('Please enter a valid URL');
    }
  };

  const PlanInfoBadge = () => {
    if (isAdmin) {
      return (
        <div className="mt-6 p-3 bg-green-900/30 border border-green-900/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Admin Privileges:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Unlimited file size</li>
                <li>• All file types supported</li>
                <li>• Priority upload processing</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-6 p-3 bg-white/10 border border-white/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Upload limits per plan:</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Free plan: No uploads</li>
              <li>• Photos plan: Up to 20MB per file</li>
              <li>• Premium plan: Up to 50MB per file</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white text-center mb-8">Upload Your Images</h1>
      
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleUrlSubmit} className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Link2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Paste image URL, or paste anywhere on page</span>
          </div>
          <div className="flex">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-l-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isUploading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-r-lg transition-colors disabled:opacity-50"
              disabled={!urlInput || isUploading}
            >
              Upload
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Pro tip: You can press Ctrl+V (or Cmd+V on Mac) anywhere on this page to paste an image URL, or an image from your clipboard.
          </p>
        </form>

        <div className="text-center text-sm text-gray-500 my-4">OR</div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isUploading ? 'opacity-70 pointer-events-none' : ''
          } ${
            isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-white/20 hover:border-blue-500 hover:bg-white/5'
          }`}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
              <p className="text-sm text-gray-300 mb-1">Uploading... {uploadProgress}%</p>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${
                isDragActive ? 'text-blue-500' : 'text-gray-600'
              }`} />
              <p className="text-sm text-gray-300 mb-1">
                {isDragActive
                  ? "Drop your image here..."
                  : "Drag 'n' drop an image here, or click to select"}
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF, WEBP
              </p>
            </>
          )}
        </div>
        
        <PlanInfoBadge />
      </div>
    </div>
  );
}