import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const LoadingSpinner = ({ size = 'medium', message }: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Blue glow effect */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
        
        {/* Outer spinning ring */}
        <div className={`absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin`}></div>
        
        {/* Middle spinning ring (opposite direction) */}
        <div className={`absolute inset-1 rounded-full border-r-2 border-blue-300 animate-[spin_1.2s_linear_infinite_reverse]`}></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-2 rounded-full bg-blue-500/50 animate-pulse"></div>
        
        {/* Center dot */}
        <div className="absolute inset-[35%] rounded-full bg-white"></div>
      </div>
      
      {message && (
        <p className={`mt-4 text-white/80 font-medium ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
}; 