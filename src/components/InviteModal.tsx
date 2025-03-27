import { useState } from 'react';
import { X, Send, Users, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [codesLoading, setCodesLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  
  // Fetch user's invite codes on mount
  useState(() => {
    if (isOpen && user) {
      fetchInviteCodes();
    }
  });
  
  if (!isOpen) return null;
  
  const fetchInviteCodes = async () => {
    try {
      setCodesLoading(true);
      
      // Get the user's invite codes
      const codesQuery = query(
        collection(db, 'inviteCodes'),
        where('createdBy', '==', user?.email),
        limit(10)
      );
      
      const codesSnapshot = await getDocs(codesQuery);
      const codes = codesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      setInviteCodes(codes);
    } catch (error) {
      console.error('Error fetching invite codes:', error);
      toast.error('Failed to load your invite codes');
    } finally {
      setCodesLoading(false);
    }
  };
  
  const generateInviteCode = async () => {
    if (!user) {
      toast.error('You must be signed in to generate invite codes');
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate a random code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Add to the inviteCodes collection
      await addDoc(collection(db, 'inviteCodes'), {
        code,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        usedBy: null,
        usedAt: null
      });
      
      toast.success('Invite code generated successfully');
      
      // Refresh the list
      fetchInviteCodes();
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Failed to generate invite code');
    } finally {
      setLoading(false);
    }
  };
  
  const sendInvite = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!user) {
      toast.error('You must be signed in to send invites');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, this would send an email
      // For this demo, we'll just add the user to the invites collection
      await addDoc(collection(db, 'invites'), {
        email,
        invitedBy: user.email,
        createdAt: serverTimestamp(),
        plan: 'photos', // Default plan for invited users
        isAdmin: false,
        inviteCount: 3, // Each invited user gets 3 invites
        usedInvites: 0
      });
      
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied to clipboard');
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#111827] border border-gray-800 rounded-lg w-[90%] max-w-xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Invite Friends
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Send Invite</h3>
            <p className="text-gray-400 text-sm mb-4">
              Invite a friend by email to join ImageVault
            </p>
            
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1E293B]/50 border-[#1E293B] text-white"
              />
              <Button 
                onClick={sendInvite}
                disabled={loading || !email}
                className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
              >
                {loading ? 'Sending...' : 'Send Invite'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-white">Your Invite Codes</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={generateInviteCode}
                disabled={loading}
                className="border-[#1E293B] text-blue-400 hover:bg-[#1E293B] hover:text-blue-300"
              >
                Generate Code
              </Button>
            </div>
            
            {codesLoading ? (
              <div className="text-center py-6">
                <div className="inline-block w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-2">Loading invite codes...</p>
              </div>
            ) : inviteCodes.length > 0 ? (
              <div className="space-y-3">
                {inviteCodes.map(code => (
                  <div 
                    key={code.id}
                    className="bg-[#1E293B]/50 border border-[#1E293B] rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-blue-400 text-lg">{code.code}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Created: {new Date(code.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code.code)}
                      className="text-gray-400 hover:text-white hover:bg-[#2D3B4E]"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-[#1E293B]/20 border border-[#1E293B] rounded-lg">
                <p className="text-gray-400">You haven't generated any invite codes yet.</p>
                <Button
                  variant="link"
                  onClick={generateInviteCode}
                  className="text-blue-400 hover:text-blue-300 mt-2"
                >
                  Generate your first code
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 