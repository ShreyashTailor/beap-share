import { useState } from 'react';
import { X, Ticket, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setIsInvited, setPlan } = useAuth();
  
  if (!isOpen) return null;
  
  const redeemCode = async () => {
    if (!code) {
      toast.error('Please enter an invite code');
      return;
    }
    
    if (!user) {
      toast.error('You must be signed in to redeem a code');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if the code exists and is unused
      const codesQuery = query(
        collection(db, 'inviteCodes'),
        where('code', '==', code.trim()),
        where('usedBy', '==', null)
      );
      
      const codesSnapshot = await getDocs(codesQuery);
      
      if (codesSnapshot.empty) {
        toast.error('Invalid or already used invite code');
        return;
      }
      
      const inviteCode = codesSnapshot.docs[0];
      
      // Update the invite code as used
      await updateDoc(doc(db, 'inviteCodes', inviteCode.id), {
        usedBy: user.email,
        usedAt: serverTimestamp()
      });
      
      // Add or update the user in the invites collection
      const userQuery = query(
        collection(db, 'invites'),
        where('email', '==', user.email)
      );
      
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        // User exists, update their plan
        const userDoc = userSnapshot.docs[0];
        await updateDoc(doc(db, 'invites', userDoc.id), {
          plan: 'photos', // Set to photos plan for invite codes
          isInvited: true,
          inviteCount: 3, // Give them 3 invites
          lastUpdated: serverTimestamp()
        });
      }
      
      // Update the auth context
      setIsInvited(true);
      setPlan('photos');
      
      toast.success('Invite code redeemed successfully!');
      onClose();
    } catch (error) {
      console.error('Error redeeming code:', error);
      toast.error('Failed to redeem invite code');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#111827] border border-gray-800 rounded-lg w-[90%] max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-blue-400" />
            Redeem Invite Code
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
            Enter your invite code below to gain access to the Photos plan.
          </p>
          
          <div className="mb-6">
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-400 mb-2">
              Invite Code
            </label>
            <Input
              id="inviteCode"
              placeholder="Enter your invite code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-[#1E293B]/50 border-[#1E293B] text-white font-mono"
            />
          </div>
          
          <Button
            onClick={redeemCode}
            disabled={loading || !code}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Redeeming...
              </>
            ) : (
              <>
                Redeem Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 