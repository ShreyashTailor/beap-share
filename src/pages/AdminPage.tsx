import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  getAllUsers,
  getAllInviteCodes,
  generateInviteCode,
  revokeInviteCode,
  updateUserRole,
  auth,
  isAdmin
} from '../lib/firebase';

interface User {
  id: string;
  email: string;
  plan: string;
  isAdmin: boolean;
  createdAt: Date | null;
  inviteCount: number;
  usedInvites: number;
}

interface InviteCode {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: Date | null;
  createdBy: string;
  usedBy?: string;
  usedAt?: Date | null;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users');

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser?.email || !isAdmin(currentUser.email)) {
        toast.error('Access denied');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const [usersData, codesData] = await Promise.all([
          getAllUsers(),
          getAllInviteCodes()
        ]);
        setUsers(usersData);
        setInviteCodes(codesData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadData();
  }, [navigate]);

  const handleGenerateInviteCode = async () => {
    try {
      const code = await generateInviteCode();
      toast.success('Invite code generated successfully');
      // Refresh invite codes
      const newCodes = await getAllInviteCodes();
      setInviteCodes(newCodes);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invite code');
    }
  };

  const handleRevokeInviteCode = async (code: string) => {
    try {
      await revokeInviteCode(code);
      toast.success('Invite code revoked successfully');
      // Refresh invite codes
      const newCodes = await getAllInviteCodes();
      setInviteCodes(newCodes);
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke invite code');
    }
  };

  const handleToggleAdminRole = async (email: string, makeAdmin: boolean) => {
    try {
      await updateUserRole(email, makeAdmin);
      toast.success(`User ${makeAdmin ? 'promoted to' : 'demoted from'} admin`);
      // Refresh users
      const newUsers = await getAllUsers();
      setUsers(newUsers);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-[#0A1425]/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              } transition-colors`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'invites'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              } transition-colors`}
            >
              Invite Codes
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'users' ? (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400">
                        <th className="pb-4">Email</th>
                        <th className="pb-4">Plan</th>
                        <th className="pb-4">Created At</th>
                        <th className="pb-4">Invites</th>
                        <th className="pb-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-gray-800">
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <span>{user.email}</span>
                              {user.isAdmin && (
                                <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded-full">
                                  Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">{user.plan}</td>
                          <td className="py-4">
                            {user.createdAt?.toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="py-4">
                            {user.usedInvites} / {user.inviteCount}
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => handleToggleAdminRole(user.email, !user.isAdmin)}
                              className={`px-3 py-1 text-xs rounded-full ${
                                user.isAdmin
                                  ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                  : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                              } transition-colors`}
                            >
                              {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateInviteCode}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Generate New Code
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400">
                        <th className="pb-4">Code</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Created By</th>
                        <th className="pb-4">Created At</th>
                        <th className="pb-4">Used By</th>
                        <th className="pb-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {inviteCodes.map((code) => (
                        <tr key={code.id} className="border-t border-gray-800">
                          <td className="py-4 font-mono">{code.code}</td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                code.isUsed
                                  ? 'bg-gray-600/20 text-gray-400'
                                  : 'bg-green-600/20 text-green-400'
                              }`}
                            >
                              {code.isUsed ? 'Used' : 'Available'}
                            </span>
                          </td>
                          <td className="py-4">{code.createdBy}</td>
                          <td className="py-4">
                            {code.createdAt?.toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="py-4">{code.usedBy || 'N/A'}</td>
                          <td className="py-4">
                            {!code.isUsed && (
                              <button
                                onClick={() => handleRevokeInviteCode(code.code)}
                                className="px-3 py-1 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-full transition-colors"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 