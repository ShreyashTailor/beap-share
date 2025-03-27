import React from 'react';
import { useParams } from 'react-router-dom';
import { getImageById } from '../lib/firebase';
import { useState, useEffect } from 'react';

interface ImageData {
  id: string;
  name: string;
  url: string;
  size: number;
  formattedSize: string;
  formattedTimestamp: string;
  uploadNumber: number;
  storageUsed?: string;
}

export default function ShareView() {
  const { imageId } = useParams<{ imageId: string }>();
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!imageId) {
          setError('No image ID provided');
          return;
        }

        const imageData = await getImageById(imageId);
        if (!imageData) {
          setError('Image not found');
          return;
        }

        setImage(imageData as ImageData);
      } catch (err) {
        setError('Failed to load image');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imageId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Error</h1>
          <p className="text-gray-400">{error || 'Failed to load image'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Image Header with Discord-style metadata */}
        <div className="bg-[#0A1425] rounded-lg overflow-hidden border border-gray-800">
          {/* Metadata Header */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{image.formattedTimestamp}</span>
              <span>Storage Used: {image.storageUsed || '1017.70 MiB'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span>Size: {image.formattedSize}</span>
              <span className="text-gray-600">|</span>
              <span>Upload: #{image.uploadNumber}</span>
            </div>
            <h3 className="text-blue-400 hover:underline cursor-pointer">
              {image.name}
            </h3>
          </div>

          {/* Image Display */}
          <div className="border-t border-gray-800">
            <img 
              src={image.url} 
              alt={image.name}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format bytes
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 