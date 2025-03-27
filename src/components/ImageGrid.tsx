import React, { useState } from 'react';
import { 
  Trash2, 
  Share2, 
  Link, 
  Download, 
  ExternalLink,
  Image as ImageIcon,
  X,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { FirestoreImage } from '../lib/firebase';

interface ImageGridProps {
  images: FirestoreImage[];
  onDelete: (id: string) => void;
  onShare: (url: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onDelete, onShare }) => {
  const [selectedImage, setSelectedImage] = useState<FirestoreImage | null>(null);
  
  if (!images || images.length === 0) {
    return null;
  }
  
  // Format bytes to human readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Format date to readable format
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Handle downloading an image
  const handleDownload = (image: FirestoreImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Close the modal when clicking on the backdrop
  const closeModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedImage(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Your Images</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="bg-[#0A1425] border border-[#1E293B] rounded-lg overflow-hidden group hover:border-blue-500/50 transition-colors"
          >
            <div 
              className="aspect-square relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img 
                src={image.url} 
                alt={image.fileName} 
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="p-3 flex flex-col">
              <p className="text-sm font-medium text-gray-300 truncate">{image.fileName}</p>
              <p className="text-xs text-gray-500 mt-1">{formatBytes(image.size)}</p>
              
              <div className="flex justify-between items-center mt-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id);
                  }} 
                  className="p-1.5 rounded-md hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <div className="flex space-x-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(image.url);
                    }} 
                    className="p-1.5 rounded-md hover:bg-blue-900/30 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Copy URL"
                  >
                    <Link className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image);
                    }} 
                    className="p-1.5 rounded-md hover:bg-blue-900/30 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="bg-[#0A1425] border border-[#1E293B] rounded-lg max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-3 border-b border-[#1E293B] flex justify-between items-center">
              <h3 className="text-sm font-medium">{selectedImage.fileName}</h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-1 hover:bg-[#1E293B] rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-auto max-h-full">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.fileName} 
                className="max-w-full h-auto"
              />
            </div>
            
            <div className="p-3 border-t border-[#1E293B] flex justify-between items-center">
              <div className="text-xs text-gray-400">
                <p>Uploaded on {formatDate(selectedImage.createdAt)}</p>
                <p className="mt-1">{formatBytes(selectedImage.size)} • {selectedImage.contentType}</p>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(selectedImage.url);
                  }} 
                  className="px-3 py-1.5 text-xs rounded-md bg-blue-600/40 hover:bg-blue-600/60 text-blue-100 flex items-center transition-colors"
                >
                  <Link className="h-3.5 w-3.5 mr-2" />
                  Copy URL
                </button>
                
                <a 
                  href={selectedImage.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs rounded-md bg-blue-600/40 hover:bg-blue-600/60 text-blue-100 flex items-center transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Open
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};