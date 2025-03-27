import React, { useState, useEffect } from 'react';
import { X, Shield, UserX, Users, Copy, RefreshCw, Check, AlertTriangle, Loader2, Plus, Ticket } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { 
  getAllUsers, 
  getAllInviteCodes, 
  generateInviteCode,
  deleteInviteCode,
  updateUserRole,
  db,
  isAdmin,
  auth
} from '../lib/firebase';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  onClose: () => void;
}

interface User {
  id: string;
  email: string;
  plan: string;
  isAdmin: boolean;
  createdAt: any;
  inviteCount: number;
  usedInvites: number;
}

interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  createdAt: any;
  usedBy: string | null;
  usedAt: any;
}

export const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Make sure only admins can access this component
    const user = auth.currentUser;
    if (!user?.email || !isAdmin(user.email)) {
      toast.error('You do not have permission to access the admin panel');
      onClose();
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    const loadingToast = toast.loading('Loading admin data...');
    setLoading(true);

    try {
      // Fetch users
      const usersRef = collection(db, 'invites');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error('No users found');
      }

      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as User[];
      
      setUsers(usersData);
      toast.success('User data loaded successfully', { id: loadingToast });

      // Fetch invite codes
      const codesRef = collection(db, 'inviteCodes');
      const codesQuery = query(codesRef, orderBy('createdAt', 'desc'));
      const codesSnapshot = await getDocs(codesQuery);
      
      if (codesSnapshot.empty) {
        toast.error('No invite codes found');
      } else {
        const codesData = codesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          usedAt: doc.data().usedAt?.toDate() || null
        })) as InviteCode[];
        
        setInviteCodes(codesData);
        toast.success('Invite codes loaded successfully');
      }
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error(`Failed to load admin data: ${error.message}`, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    try {
      const user = auth.currentUser;
      if (!user?.email) {
        toast.error('You must be signed in to generate invite codes');
        return;
      }

      setLoading(true);
      
      // Generate code if not provided
      const code = newCode || Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Create the code document
      await addDoc(collection(db, 'inviteCodes'), {
        code,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        usedBy: null,
        usedAt: null
      });
      
      toast.success(`Invite code ${code} generated successfully`);
      setNewCode('');
      
      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      toast.error(error.message || 'Failed to generate invite code');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = (items: Array<any>, term: string) => {
    if (!term) return items;
    return items.filter(item => 
      Object.values(item).some(value => 
        value && typeof value === 'string' && value.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const filteredUsers = filterItems(users, searchTerm);
  const filteredCodes = filterItems(inviteCodes, searchTerm);

  if (loading) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-6 bg-[#0A0F1A]/80 backdrop-blur-sm border border-[#1E293B] rounded-xl">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <h3 className="text-xl font-semibold text-white/90">Loading Admin Data...</h3>
          <p className="text-white/60 text-center max-w-md">
            Fetching users and invite codes. This may take a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#0A0F1A]/80 backdrop-blur-lg border border-[#1E293B] rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-green-400 mr-2" />
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <div className="ml-3 px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-900/20 flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#1E293B] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-4 border-b border-[#1E293B]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex space-x-1 rounded-lg overflow-hidden border border-[#1E293B] w-full sm:w-auto">
              <button
                onClick={() => setSearchTerm('')}
                className={`px-4 py-2 flex items-center ${
                  searchTerm === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#1E293B]/50 text-gray-300 hover:bg-[#1E293B]'
                } transition-colors`}
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </button>
              <button
                onClick={() => setSearchTerm('')}
                className={`px-4 py-2 flex items-center ${
                  searchTerm === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#1E293B]/50 text-gray-300 hover:bg-[#1E293B]'
                } transition-colors`}
              >
                <Ticket className="w-4 h-4 mr-2" />
                Invite Codes
              </button>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Input
                type="text"
                placeholder="Search users or invite codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-[#0A0F1A] border border-[#1E293B] rounded-lg text-white placeholder-gray-500 w-full"
              />
              
              <button
                onClick={fetchData}
                className="p-2 bg-[#1E293B]/50 hover:bg-[#1E293B] text-gray-300 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={generateInviteCode}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-1 inline" /> Generate Code</>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-auto max-h-[calc(90vh-8rem)]">
          {searchTerm === '' ? (
            <>
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">Users ({filteredUsers.length})</h3>
                <div className="rounded-md border border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-900 hover:bg-gray-900">
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Plan</TableHead>
                        <TableHead className="text-gray-400">Admin</TableHead>
                        <TableHead className="text-gray-400">Created</TableHead>
                        <TableHead className="text-gray-400">Invites</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-800/50">
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.plan === 'premium' ? 'bg-purple-900/30 text-purple-400' :
                                user.plan === 'photos' ? 'bg-blue-900/30 text-blue-400' :
                                'bg-gray-800 text-gray-400'
                              }`}>
                                {user.plan || 'free'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.isAdmin ? 
                                <Check className="w-5 h-5 text-green-500" /> : 
                                <X className="w-5 h-5 text-gray-500" />
                              }
                            </TableCell>
                            <TableCell>{user.createdAt?.toLocaleDateString()}</TableCell>
                            <TableCell>{user.usedInvites} / {user.inviteCount}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                            {loading ? 'Loading users...' : 'No users found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">Invite Codes ({filteredCodes.length})</h3>
                <div className="rounded-md border border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-900 hover:bg-gray-900">
                        <TableHead className="text-gray-400">Code</TableHead>
                        <TableHead className="text-gray-400">Created By</TableHead>
                        <TableHead className="text-gray-400">Created At</TableHead>
                        <TableHead className="text-gray-400">Used By</TableHead>
                        <TableHead className="text-gray-400">Used At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCodes.length > 0 ? (
                        filteredCodes.map((code) => (
                          <TableRow key={code.id} className="hover:bg-gray-800/50">
                            <TableCell className="font-medium">{code.code}</TableCell>
                            <TableCell>{code.createdBy}</TableCell>
                            <TableCell>{code.createdAt?.toLocaleDateString()}</TableCell>
                            <TableCell>
                              {code.usedBy || <span className="text-gray-500">-</span>}
                            </TableCell>
                            <TableCell>
                              {code.usedAt ? code.usedAt.toLocaleDateString() : <span className="text-gray-500">-</span>}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                            {loading ? 'Loading invite codes...' : 'No invite codes found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">Search Results</h3>
                <p className="text-gray-400">
                  {filteredUsers.length > 0 ? 'Users' : 'Invite codes'} found: {filteredUsers.length + filteredCodes.length}
                </p>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">Users</h3>
                <div className="rounded-md border border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-900 hover:bg-gray-900">
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Plan</TableHead>
                        <TableHead className="text-gray-400">Admin</TableHead>
                        <TableHead className="text-gray-400">Created</TableHead>
                        <TableHead className="text-gray-400">Invites</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-800/50">
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.plan === 'premium' ? 'bg-purple-900/30 text-purple-400' :
                                user.plan === 'photos' ? 'bg-blue-900/30 text-blue-400' :
                                'bg-gray-800 text-gray-400'
                              }`}>
                                {user.plan || 'free'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.isAdmin ? 
                                <Check className="w-5 h-5 text-green-500" /> : 
                                <X className="w-5 h-5 text-gray-500" />
                              }
                            </TableCell>
                            <TableCell>{user.createdAt?.toLocaleDateString()}</TableCell>
                            <TableCell>{user.usedInvites} / {user.inviteCount}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                            {loading ? 'Loading users...' : 'No users found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4">Invite Codes</h3>
                <div className="rounded-md border border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-900 hover:bg-gray-900">
                        <TableHead className="text-gray-400">Code</TableHead>
                        <TableHead className="text-gray-400">Created By</TableHead>
                        <TableHead className="text-gray-400">Created At</TableHead>
                        <TableHead className="text-gray-400">Used By</TableHead>
                        <TableHead className="text-gray-400">Used At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCodes.length > 0 ? (
                        filteredCodes.map((code) => (
                          <TableRow key={code.id} className="hover:bg-gray-800/50">
                            <TableCell className="font-medium">{code.code}</TableCell>
                            <TableCell>{code.createdBy}</TableCell>
                            <TableCell>{code.createdAt?.toLocaleDateString()}</TableCell>
                            <TableCell>
                              {code.usedBy || <span className="text-gray-500">-</span>}
                            </TableCell>
                            <TableCell>
                              {code.usedAt ? code.usedAt.toLocaleDateString() : <span className="text-gray-500">-</span>}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                            {loading ? 'Loading invite codes...' : 'No invite codes found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 