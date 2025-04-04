import React, { useState } from 'react';
import { formatBytes } from '../utils/formatBytes';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: string;
    url: string;
    name: string;
    size: number;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, image }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;
  
  const shareUrl = `https://image.beap.studio/share/${image.id}`;
  const imageUrl = `https://image.beap.studio/image/${image.id}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleDiscordShare = () => {
    window.open(shareUrl, '_blank');
  };
  
  const handleImageView = () => {
    window.open(imageUrl, '_blank');
  };
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Share Image</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <img src={image.url} alt={image.name} className="w-full h-auto rounded-lg" />
        </div>

        <div className="mb-4">
          <p className="text-white font-medium">{image.name}</p>
          <p className="text-gray-400 text-sm">Size: {formatBytes(image.size)}</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Share Link</label>
          <div className="flex">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="bg-gray-700 text-white px-3 py-2 rounded-l-lg w-full"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Image Page</label>
          <div className="flex">
            <input
              type="text"
              value={imageUrl}
              readOnly
              className="bg-gray-700 text-white px-3 py-2 rounded-l-lg w-full"
            />
            <button
              onClick={handleImageView}
              className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700"
            >
              View
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;