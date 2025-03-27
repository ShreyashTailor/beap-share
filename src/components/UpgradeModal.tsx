import { X, Check, ZapIcon } from 'lucide-react';
import { Button } from './ui/button';
import { USER_PLANS } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { setPlan, user } = useAuth();
  
  if (!isOpen) return null;
  
  const handleSelectPlan = (plan: string) => {
    // In a real app, this would integrate with a payment processor
    // For demo purposes, we'll just update the user's plan directly
    try {
      setPlan(plan);
      toast.success(`Upgraded to ${plan} plan successfully!`);
      onClose();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade plan. Please try again later.');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#111827] border border-gray-800 rounded-lg w-[90%] max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <ZapIcon className="w-5 h-5 mr-2 text-blue-400" />
            Upgrade Your Plan
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 mb-6">
            Choose the plan that's right for you. All plans include access to our core features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border border-gray-800 rounded-lg p-5 bg-[#0F172A]/50">
              <h3 className="text-lg font-semibold text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-white mb-4">$0</p>
              <p className="text-gray-400 text-sm mb-4">Basic access with limited storage</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>100MB storage</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>5MB max file size</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>0 invite codes</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gray-700 hover:bg-gray-600 text-white" 
                onClick={() => handleSelectPlan(USER_PLANS.FREE)}
              >
                Current Plan
              </Button>
            </div>
            
            {/* Photos Plan */}
            <div className="border border-blue-600/30 rounded-lg p-5 bg-[#0F172A]/70 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full">
                POPULAR
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">Photos</h3>
              <p className="text-3xl font-bold text-white mb-1">$5</p>
              <p className="text-gray-400 text-xs mb-4">per year</p>
              <p className="text-gray-400 text-sm mb-4">Perfect for storing your photos</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  <span>1GB storage</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  <span>10MB max file size</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  <span>3 invite codes</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => handleSelectPlan(USER_PLANS.PHOTOS)}
              >
                Select Plan
              </Button>
            </div>
            
            {/* Premium Plan */}
            <div className="border border-purple-600/30 rounded-lg p-5 bg-[#0F172A]/70">
              <h3 className="text-lg font-semibold text-white mb-2">Premium</h3>
              <p className="text-3xl font-bold text-white mb-1">$20</p>
              <p className="text-gray-400 text-xs mb-4">per year</p>
              <p className="text-gray-400 text-sm mb-4">Maximum storage for professionals</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  <span>5GB storage</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  <span>20MB max file size</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Check className="w-4 h-4 text-purple-500 mr-2" />
                  <span>10 invite codes</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                onClick={() => handleSelectPlan(USER_PLANS.PREMIUM)}
              >
                Select Plan
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          Note: This is a demo application. No actual payment will be processed.
        </div>
      </div>
    </div>
  );
} 