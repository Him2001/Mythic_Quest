import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../utils/supabaseService';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  Search, 
  Eye, 
  Trash2, 
  Edit, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  UserX,
  UserCheck,
  Crown,
  Coins,
  TrendingUp
} from 'lucide-react';

interface AdminUserTableProps {
  onUserSelect: (user: any) => void;
  refreshTrigger?: number;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ onUserSelect, refreshTrigger = 0 }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [questUser, setQuestUser] = useState<any>(null);

  const usersPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await SupabaseService.getAllUserProfiles();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        const success = await SupabaseService.deleteUser(userId);
        if (success) {
          setUsers(prev => prev.filter(user => user.id !== userId));
          alert('User deleted successfully');
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleAssignQuest = (user: any) => {
    setQuestUser(user);
    setShowQuestModal(true);
  };

  const handleSaveUserEdit = async (updates: any) => {
    if (!editingUser) return;

    try {
      const success = await SupabaseService.adminUpdateUserProfile(editingUser.id, updates);
      if (success) {
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? { ...user, ...updates } : user
        ));
        setShowEditModal(false);
        setEditingUser(null);
        alert('User updated successfully');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleAssignSpecialQuest = async (questData: any) => {
    if (!questUser) return;

    try {
      const success = await SupabaseService.assignSpecialQuest(questUser.id, questData);
      if (success) {
        // Refresh user data
        loadUsers();
        setShowQuestModal(false);
        setQuestUser(null);
        alert('Special quest assigned successfully');
      } else {
        alert('Failed to assign quest');
      }
    } catch (error) {
      console.error('Error assigning quest:', error);
      alert('Error assigning quest');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-cinzel font-bold text-gray-800">User Management</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-merriweather">
              {filteredUsers.length} users total
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cinzel">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cinzel">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cinzel">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-cinzel">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-cinzel">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      src={user.avatar_url}
                      alt={user.username}
                      size="md"
                      className="mr-4"
                    />
                    <div>
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 font-cinzel">
                          {user.username}
                        </div>
                        {user.level >= 10 && (
                          <Crown className="ml-2 text-yellow-500" size={16} />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 font-merriweather">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <TrendingUp size={14} className="mr-1 text-blue-500" />
                      <span className="font-cinzel">Level {user.level}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Coins size={14} className="mr-1 text-yellow-500" />
                      <span className="font-merriweather">{user.coins || 0} coins</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Award size={14} className="mr-1 text-green-500" />
                      <span className="font-merriweather">{user.total_quests_completed || 0} quests</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-merriweather">
                    Joined {formatDate(user.date_created)}
                  </div>
                  <div className="text-sm text-gray-500 font-merriweather">
                    Updated {formatTimeAgo(user.updated_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    color={user.is_active ? 'success' : 'error'}
                    variant="subtle"
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUserSelect(user)}
                      icon={<Eye size={16} />}
                      title="View Details"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      icon={<Edit size={16} />}
                      title="Edit User"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAssignQuest(user)}
                      icon={<Award size={16} />}
                      title="Assign Quest"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      icon={<Trash2 size={16} />}
                      className="text-red-600 hover:text-red-700"
                      title="Delete User"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700 font-merriweather">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              icon={<ChevronLeft size={16} />}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700 font-cinzel">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              icon={<ChevronRight size={16} />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveUserEdit}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Assign Quest Modal */}
      {showQuestModal && questUser && (
        <AssignQuestModal
          user={questUser}
          onAssign={handleAssignSpecialQuest}
          onClose={() => {
            setShowQuestModal(false);
            setQuestUser(null);
          }}
        />
      )}
    </div>
  );
};

// Edit User Modal Component
const EditUserModal: React.FC<{
  user: any;
  onSave: (updates: any) => void;
  onClose: () => void;
}> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    level: user.level || 1,
    xp: user.xp || 0,
    coins: user.coins || 0,
    bio: user.bio || '',
    is_active: user.is_active !== false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-4">
            Edit User: {user.username}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  Level
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  XP
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.xp}
                  onChange={(e) => setFormData(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  Coins
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.coins}
                  onChange={(e) => setFormData(prev => ({ ...prev, coins: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 font-cinzel">
                Active Account
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Assign Quest Modal Component
const AssignQuestModal: React.FC<{
  user: any;
  onAssign: (questData: any) => void;
  onClose: () => void;
}> = ({ user, onAssign, onClose }) => {
  const [questData, setQuestData] = useState({
    questName: '',
    questType: 'special',
    xpReward: 100,
    coinsReward: 50,
    description: ''
  });

  const questTypes = [
    { value: 'special', label: 'Special Quest' },
    { value: 'bonus', label: 'Bonus Challenge' },
    { value: 'achievement', label: 'Achievement Unlock' },
    { value: 'milestone', label: 'Milestone Reward' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questData.questName.trim()) return;
    onAssign(questData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-4">
            Assign Special Quest to {user.username}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Quest Name
              </label>
              <input
                type="text"
                value={questData.questName}
                onChange={(e) => setQuestData(prev => ({ ...prev, questName: e.target.value }))}
                placeholder="Enter quest name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Quest Type
              </label>
              <select
                value={questData.questType}
                onChange={(e) => setQuestData(prev => ({ ...prev, questType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
              >
                {questTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  XP Reward
                </label>
                <input
                  type="number"
                  min="0"
                  value={questData.xpReward}
                  onChange={(e) => setQuestData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  Coin Reward
                </label>
                <input
                  type="number"
                  min="0"
                  value={questData.coinsReward}
                  onChange={(e) => setQuestData(prev => ({ ...prev, coinsReward: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Description (Optional)
              </label>
              <textarea
                value={questData.description}
                onChange={(e) => setQuestData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Quest description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Assign Quest
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUserTable;