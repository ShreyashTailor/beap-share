import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { USER_PLANS } from '../lib/firebase';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: string) => void;
}

export const PricingModal = ({ isOpen, onClose, onSelectPlan }: PricingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl max-w-4xl w-full overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-300 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-center text-gray-300 mb-8">
            Select the perfect plan to meet your image sharing needs. Upgrade anytime
            to access more storage and features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all hover:border-white/20">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-blue-900/30 p-3 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-4.5-8.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Free</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Basic access to image sharing features</p>
                <div className="text-3xl font-bold text-white mb-6">$0</div>
                <button
                  onClick={() => onSelectPlan(USER_PLANS.FREE)}
                  className="w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Select Free Plan
                </button>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Up to 10 images</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Max file size 2MB</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Basic storage only</span>
                  </div>
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-500 text-sm">Advanced features</span>
                  </div>
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-500 text-sm">Priority support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Plan */}
            <div className="bg-white/5 rounded-xl border border-blue-500/30 overflow-hidden transition-all hover:border-blue-500/50 shadow-lg relative">
              <div className="absolute top-0 right-0 left-0 bg-blue-500 text-white text-xs font-medium py-1 text-center">
                Most Popular
              </div>
              <div className="p-6 pt-8 flex flex-col items-center">
                <div className="bg-blue-900/30 p-3 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Standard</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Perfect for regular users who need more storage</p>
                <div className="text-3xl font-bold text-white mb-1">$5</div>
                <div className="text-gray-400 text-sm mb-6">per year</div>
                <button
                  onClick={() => onSelectPlan(USER_PLANS.PHOTOS)}
                  className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Subscribe for $5/year
                </button>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Up to 100 images</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Max file size 10MB</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Enhanced storage</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Advanced features</span>
                  </div>
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-500 text-sm">Priority support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all hover:border-white/20">
              <div className="p-6 flex flex-col items-center">
                <div className="bg-blue-900/30 p-3 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
                <p className="text-gray-400 text-sm text-center mb-4">For professionals who need maximum storage</p>
                <div className="text-3xl font-bold text-white mb-1">$149</div>
                <div className="text-gray-400 text-sm mb-6">per year</div>
                <button
                  onClick={() => onSelectPlan(USER_PLANS.PREMIUM)}
                  className="w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Subscribe for $149/year
                </button>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Up to 1000 images</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Max file size 50MB</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Premium storage</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Advanced features</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Priority support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Invite-Only Access</h4>
              <p className="text-gray-300 text-sm">
                BEAP Share is currently available by invitation only. You need a valid invite code to access our service,
                or purchase a subscription to gain immediate access.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Need a custom plan for your team? <a href="mailto:contact@beapshare.com" className="text-blue-400 hover:underline">Contact us</a> for custom pricing and enterprise-level features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 