import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { SupabaseService } from '../../utils/supabaseService';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Search, Edit, Trash2, UserPlus, RefreshCw, AlertTriangle } from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  total_quests_completed: number;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminUserTableProps {
  currentUser: User;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    level: 1,
    xp: 0,
    coins: 0,
    bio: '',
    is_active: true
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProfiles = await SupabaseService.getAllUserProfiles();
      setUsers(userProfiles || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users from database');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      email: user.email || '',
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      bio: user.bio || '',
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmEditUser = async () => {
    if (!selectedUser) return;

    setActionLoading('edit');
    try {
      const success = await SupabaseService.updateUserProfile(selectedUser.id, {
        username: editFormData.username,
        email: editFormData.email,
        level: editFormData.level,
        xp: editFormData.xp,
        coins: editFormData.coins,
        bio: editFormData.bio,
        is_active: editFormData.is_active
      });

      if (success) {
        await loadUsers(); // Reload users to show updated data
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        setError('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setActionLoading('delete');
    try {
      const success = await SupabaseService.deleteUser(selectedUser.id);

      if (success) {
        await loadUsers(); // Reload users to show updated list
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        setError('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge color={isActive ? 'success' : 'error'} size="sm">
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-3 text-amber-600" size={32} />
          <p className="text-amber-800 font-cinzel">Loading users from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cinzel font-bold text-amber-800">User Management</h2>
          <p className="text-amber-700 font-merriweather">
            Manage user accounts and permissions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={loadUsers}
            icon={<RefreshCw size={16} />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700">
            <AlertTriangle size={16} className="mr-2" />
            <span className="font-merriweather">{error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-amber-50 border-b border-amber-200">
              <tr>
                <th className="text-left p-4 font-cinzel font-bold text-amber-800">User</th>
                <th className="text-left p-4 font-cinzel font-bold text-amber-800">Level & XP</th>
                <th className="text-left p-4 font-cinzel font-bold text-amber-800">Progress</th>
                <th className="text-left p-4 font-cinzel font-bold text-amber-800">Auth Method</th>
                <th className="text-left p-4 font-cinzel font-bold text-amber-800">Joined</th>
                <th className="text-left p-4 font-cinzel font-bold text-amber-800">Status</th>
                <th className="text-left p-4 font-cinzel font-bold text-amber-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Avatar
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.username}
                        size="md"
                        className="mr-3"
                      />
                      <div>
                        <h3 className="font-cinzel font-bold text-gray-800">{user.username}</h3>
                        <p className="text-sm text-gray-600 font-merriweather">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-cinzel font-bold text-amber-700">Level {user.level}</div>
                      <div className="text-gray-600 font-merriweather">{user.xp} XP</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-blue-600 font-merriweather">Quests: {user.total_quests_completed}</div>
                      <div className="text-amber-600 font-merriweather">Coins: {user.coins}</div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <Badge color="accent" size="sm">Email</Badge>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-merriweather">{formatDate(user.created_at)}</div>
                      <div className="text-gray-500 font-merriweather text-xs">
                        Updated: {formatDate(user.updated_at)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    {getStatusBadge(user.is_active)}
                  </td>
                  
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        icon={<Edit size={14} />}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        icon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-700"
                        disabled={user.id === currentUser.id} // Prevent self-deletion
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
              No Users Found
            </h3>
            <p className="text-gray-500 font-merriweather">
              {searchQuery ? 'No users match your search criteria.' : 'No users in the database.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-cinzel font-bold text-gray-800">
                Edit User: {selectedUser.username}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div>
                <label className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
                    Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={editFormData.level}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather"
                  />
                </div>

                <div>
                  <label className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
                    XP
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.xp}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
                  Mythic Coins
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.coins}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, coins: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div>
                <label className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather resize-none"
                  placeholder="User bio..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-cinzel font-bold text-gray-700">
                  Active Account
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
                disabled={actionLoading === 'edit'}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmEditUser}
                className="flex-1"
                disabled={actionLoading === 'edit'}
              >
                {actionLoading === 'edit' ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-cinzel font-bold text-red-800">
                Delete User
              </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-3" size={24} />
                <div>
                  <p className="font-cinzel font-bold text-gray-800">
                    Are you sure you want to delete this user?
                  </p>
                  <p className="text-sm text-gray-600 font-merriweather mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Avatar
                    src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                    alt={selectedUser.username}
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h4 className="font-cinzel font-bold text-gray-800">{selectedUser.username}</h4>
                    <p className="text-sm text-gray-600 font-merriweather">{selectedUser.email}</p>
                    <p className="text-xs text-gray-500 font-merriweather">
                      Level {selectedUser.level} • {selectedUser.total_quests_completed} quests completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
                disabled={actionLoading === 'delete'}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDeleteUser}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;