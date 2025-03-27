import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Key, 
  Trash2, 
  Gift, 
  User, 
  Shield, 
  AlertCircle, 
  Copy, 
  Check,
  Search,
  ArrowLeft,
  Star,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllUsers, 
  getAllInviteCodes, 
  generateInviteCode, 
  deleteInviteCode, 
  updateUserRole, 
  updateUserPlan, 
  USER_PLANS 
} from '../lib/firebase';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'invite-codes'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      window.location.href = '/';
    }
  }, [user, isAdmin]);

  // Load admin data
  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Loading admin data...');
    
    try {
      if (activeTab === 'users') {
        const userData = await getAllUsers();
        setUsers(userData);
      } else {
        const codesData = await getAllInviteCodes();
        setInviteCodes(codesData);
      }
      
      toast.success('Data loaded successfully', { id: toastId });
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast.error(error.message || 'Failed to load admin data', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInviteCode = async () => {
    try {
      const toastId = toast.loading('Generating invite code...');
      const result = await generateInviteCode();
      
      if (result?.code) {
        toast.success('Invite code generated successfully', { id: toastId });
        // Refresh the invite codes list
        const codesData = await getAllInviteCodes();
        setInviteCodes(codesData);
        
        // Auto-copy the code to clipboard
        navigator.clipboard.writeText(result.code);
        setCopiedCode(result.code);
        setTimeout(() => {
          setCopiedCode('');
        }, 3000);
      } else {
        toast.error('Failed to generate invite code', { id: toastId });
      }
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      toast.error(error.message || 'Failed to generate invite code');
    }
  };

  const handleDeleteInviteCode = async (codeId: string) => {
    try {
      const toastId = toast.loading('Deleting invite code...');
      await deleteInviteCode(codeId);
      
      toast.success('Invite code deleted successfully', { id: toastId });
      // Refresh the invite codes list
      const codesData = await getAllInviteCodes();
      setInviteCodes(codesData);
    } catch (error: any) {
      console.error('Error deleting invite code:', error);
      toast.error(error.message || 'Failed to delete invite code');
    }
  };

  const handleToggleAdmin = async (email: string, makeAdmin: boolean) => {
    try {
      const toastId = toast.loading(`${makeAdmin ? 'Making' : 'Removing'} admin status...`);
      await updateUserRole(email, makeAdmin);
      
      toast.success(`User ${makeAdmin ? 'is now an admin' : 'is no longer an admin'}`, { id: toastId });
      // Refresh the users list
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleUpdatePlan = async (email: string, plan: string) => {
    try {
      const toastId = toast.loading(`Updating user plan to ${plan}...`);
      await updateUserPlan(email, plan);
      
      toast.success(`User plan updated to ${plan}`, { id: toastId });
      // Refresh the users list
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (error: any) {
      console.error('Error updating user plan:', error);
      toast.error(error.message || 'Failed to update user plan');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        toast.success('Code copied to clipboard');
        setTimeout(() => {
          setCopiedCode('');
        }, 3000);
      })
      .catch(() => toast.error('Failed to copy code'));
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCodes = inviteCodes.filter(code => 
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (code.createdBy && code.createdBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (code.usedBy && code.usedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="bg-[#0A0F1A]/70 border border-[#1E293B] p-8 rounded-lg max-w-md text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have permission to access the admin panel.</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600/90 hover:bg-blue-700 rounded-md text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#1E293B] bg-[#0A1425]/60 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <ArrowLeft className="w-5 h-5 mr-2 text-gray-400" />
              <span className="font-bold">BEAP Share</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-green-800/30 border border-green-800/50 rounded-full text-xs flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              Admin
            </div>
            {user.email && (
              <div className="text-sm text-gray-400">{user.email}</div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        {/* Tab navigation */}
        <div className="flex space-x-1 mb-6 bg-[#0A0F1A]/40 p-1 rounded-lg inline-flex">
          <button
            onClick={() => {
              setActiveTab('users');
              setSearchTerm('');
              loadData();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'users' 
                ? 'bg-blue-600/90 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#1E293B]/50'
            }`}
          >
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Users
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('invite-codes');
              setSearchTerm('');
              loadData();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'invite-codes' 
                ? 'bg-blue-600/90 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#1E293B]/50'
            }`}
          >
            <div className="flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Invite Codes
            </div>
          </button>
        </div>
        
        {/* Search box and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'users' ? "Search users..." : "Search codes..."}
              className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-[#1E293B] rounded-lg bg-[#0A0F1A]/60 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {activeTab === 'invite-codes' && (
            <button
              onClick={handleGenerateInviteCode}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600/90 hover:bg-indigo-700 rounded-md text-white transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate New Code
            </button>
          )}
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Users tab */}
        {!isLoading && activeTab === 'users' && (
          <div className="bg-[#0A0F1A]/30 border border-[#1E293B] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#1E293B]">
                <thead className="bg-[#0A0F1A]/60">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#1E293B]/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-white">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.plan === USER_PLANS.PREMIUM
                                ? 'bg-indigo-800/50 text-indigo-300 border border-indigo-800'
                                : 'bg-blue-800/30 text-blue-300 border border-blue-800/50'
                            }`}>
                              {user.plan === USER_PLANS.PREMIUM ? (
                                <>
                                  <Star className="w-3 h-3 mr-1" />
                                  Premium
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Default
                                </>
                              )}
                            </span>
                            <div className="relative group">
                              <button
                                className="text-gray-400 hover:text-blue-400 text-xs"
                                onClick={() => handleUpdatePlan(
                                  user.email,
                                  user.plan === USER_PLANS.PREMIUM
                                    ? USER_PLANS.PHOTOS
                                    : USER_PLANS.PREMIUM
                                )}
                              >
                                Change
                              </button>
                              <div className="absolute left-0 mt-2 w-40 bg-[#111827] border border-[#1E293B] rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-800/30"
                                  onClick={() => handleUpdatePlan(user.email, USER_PLANS.PHOTOS)}
                                >
                                  Set to Default
                                </button>
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-indigo-800/30"
                                  onClick={() => handleUpdatePlan(user.email, USER_PLANS.PREMIUM)}
                                >
                                  Set to Premium
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isAdmin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800/30 text-green-300 border border-green-800/50">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700">
                              <User className="w-3 h-3 mr-1" />
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleToggleAdmin(user.email, !user.isAdmin)}
                            className={`text-xs mr-3 px-2 py-1 rounded ${
                              user.isAdmin
                                ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                                : 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                            }`}
                          >
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Invite Codes tab */}
        {!isLoading && activeTab === 'invite-codes' && (
          <div className="bg-[#0A0F1A]/30 border border-[#1E293B] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#1E293B]">
                <thead className="bg-[#0A0F1A]/60">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Created By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Created At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Used By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No invite codes found
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((code) => (
                      <tr key={code.id} className="hover:bg-[#1E293B]/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Key className="w-4 h-4 mr-2 text-gray-400" />
                            <div className="font-mono text-white">{code.code}</div>
                            <button
                              onClick={() => handleCopyCode(code.code)}
                              className="ml-2 text-gray-400 hover:text-blue-400"
                              title="Copy code"
                            >
                              {copiedCode === code.code ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {code.isUsed ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700">
                              Used
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800/30 text-green-300 border border-green-800/50">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {code.createdBy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(code.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {code.usedBy || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!code.isUsed && (
                            <button
                              onClick={() => handleDeleteInviteCode(code.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete code"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel; 