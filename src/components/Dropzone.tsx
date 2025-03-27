import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Image as ImageIcon, FileWarning } from 'lucide-react';
import { Button } from './ui/button';

interface DropzoneProps {
  onImageUpload: (file: File) => Promise<void>;
}

export function Dropzone({ onImageUpload }: DropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Check if it's an image
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      // Check file size (max 20MB)
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError('Image size must be less than 20MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await onImageUpload(file);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCancel = () => {
    setFile(null);
    setError(null);
  };
  
  return (
    <div className="w-full rounded-xl bg-[#111827]/80 border border-[#1E293B] p-4">
      <h2 className="text-lg font-semibold mb-2 text-white">Upload Image</h2>
      
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-700 hover:border-blue-500/50 hover:bg-[#1E293B]/30'
          }`}
        >
          <input {...getInputProps()} />
          
          <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
          
          <p className="text-center text-gray-400">
            {isDragActive 
              ? 'Drop the image here...' 
              : 'Drag & drop an image here, or click to select'
            }
          </p>
          
          <p className="text-sm text-gray-500 mt-2 text-center">
            Supports: JPG, PNG, GIF, WebP (max 20MB)
          </p>
          
          {error && (
            <div className="mt-4 text-red-500 flex items-center">
              <FileWarning className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#1E293B] rounded-md flex items-center justify-center mr-3">
                <ImageIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white truncate max-w-[250px]">
                  {file.name}
                </p>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="border-gray-700 hover:bg-[#1E293B] hover:text-white"
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              
              <Button 
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 mr-1" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-red-500 text-sm flex items-center">
              <FileWarning className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 