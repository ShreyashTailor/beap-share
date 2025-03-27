import React, { useState } from 'react';
import { X, Ticket } from 'lucide-react';
import { redeemInviteCode } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface InviteCodeModalProps {
  onClose: () => void;
}

export const InviteCodeModal = ({ onClose }: InviteCodeModalProps) => {
  const { user, setPlan } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter an invite code');
      return;
    }
    
    if (!user?.email) {
      toast.error('You must be logged in to redeem an invite code');
      return;
    }
    
    setLoading(true);
    // Set a timeout to ensure loading ends after 1.5 seconds max
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    try {
      const result = await redeemInviteCode(code.trim(), user.email);
      // Close modal immediately on success
      onClose();
      toast.success('Invite code redeemed successfully!');
      
      // Update the plan directly instead of refreshing the page
      if (result && result.plan) {
        setPlan(result.plan);
      }
    } catch (error: any) {
      console.error('Error redeeming invite code:', error);
      toast.error(error.message || 'Failed to redeem invite code');
      setLoading(false);
    }
    
    clearTimeout(timeoutId);
  };

  return (
    <div className="fixed inset-0 bg-white/5 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-white/20">
          <div className="flex items-center">
            <Ticket className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Redeem Invite Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-300 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-300 mb-4">
            Enter your invite code to unlock the Standard plan. If you don't have an invite code,
            you can purchase a subscription or get one from an existing user.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter invite code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Redeeming...' : 'Redeem Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 