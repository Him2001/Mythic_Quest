import React, { useState, useEffect } from 'react';
import { User, AdminStats } from '../../types';
import { SupabaseService } from '../../utils/supabaseService';
import { Coins, Users, Award, CheckSquare, BarChart2, UserPlus, LogOut } from 'lucide-react';
import Button from '../ui/Button';

interface AdminDashboardProps {
  currentUser: User;
  onSignOut: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'quests'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalQuestsCompleted: 0,
    totalXPEarned: 0,
    totalCoinsEarned: 0,
    totalPosts: 0,
    newUsersThisWeek: 0,
    averageLevel: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialQuestForm, setSpecialQuestForm] = useState({
    questName: '',
    questType: 'special',
    xpReward: 100,
    coinsReward: 50,
    description: ''
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const adminStats = await SupabaseService.getAdminStats();
      setStats(adminStats);
      
      const allUsers = await SupabaseService.getAllUserProfiles();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (userId: string) => {
    try {
      const userProfile = users.find(user => user.id === userId);
      if (userProfile) {
        const userActivity = await SupabaseService.getUserActivity(userId);
        setSelectedUser({
          ...userProfile,
          activity: userActivity
        });
      }
    } catch (error) {
      console.error('Failed to load user details:', error);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const success = await SupabaseService.adminUpdateUserProfile(userId, { is_active: false });
        if (success) {
          loadAdminData();
          if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(prev => ({ ...prev, is_active: false }));
          }
        }
      } catch (error) {
        console.error('Failed to deactivate user:', error);
      }
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const success = await SupabaseService.adminUpdateUserProfile(userId, { is_active: true });
      if (success) {
        loadAdminData();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => ({ ...prev, is_active: true }));
        }
      }
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const handleAssignSpecialQuest = async (userId: string) => {
    if (!specialQuestForm.questName.trim()) {
      alert('Please enter a quest name');
      return;
    }

    try {
      const success = await SupabaseService.assignSpecialQuest(userId, {
        questName: specialQuestForm.questName,
        questType: specialQuestForm.questType,
        xpReward: specialQuestForm.xpReward,
        coinsReward: specialQuestForm.coinsReward,
        description: specialQuestForm.description
      });

      if (success) {
        alert('Special quest assigned successfully!');
        setSpecialQuestForm({
          questName: '',
          questType: 'special',
          xpReward: 100,
          coinsReward: 50,
          description: ''
        });
        
        // Refresh user data
        handleUserSelect(userId);
        loadAdminData();
      }
    } catch (error) {
      console.error('Failed to assign special quest:', error);
      alert('Failed to assign special quest. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-cinzel">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <BarChart2 className="mr-3" size={28} />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-amber-100 text-sm">Manage users, quests, and system settings</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onSignOut}
              icon={<LogOut size={16} />}
              className="border-white text-white hover:bg-white/20 self-start sm:self-auto"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-amber-500'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-amber-500'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'quests'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-amber-500'
              }`}
            >
              Special Quests
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Platform Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-xl font-bold text-gray-800">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quests Completed</p>
                    <p className="text-xl font-bold text-gray-800">{stats.totalQuestsCompleted}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-100 text-amber-500 mr-4">
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Coins</p>
                    <p className="text-xl font-bold text-gray-800">{stats.totalCoinsEarned}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">New Users This Week</p>
                    <p className="text-xl font-bold text-gray-800">{stats.newUsersThisWeek}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">User Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-medium text-gray-800">{stats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Average Level</span>
                    <span className="font-medium text-gray-800">{stats.averageLevel.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Total XP Earned</span>
                    <span className="font-medium text-gray-800">{stats.totalXPEarned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Posts</span>
                    <span className="font-medium text-gray-800">{stats.totalPosts}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <UserPlus className="text-green-500" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{stats.newUsersThisWeek} new users joined this week</p>
                      <p className="text-sm text-gray-500">Growth rate: {stats.totalUsers > 0 ? ((stats.newUsersThisWeek / stats.totalUsers) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <CheckSquare className="text-blue-500" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{stats.totalQuestsCompleted} total quests completed</p>
                      <p className="text-sm text-gray-500">Average {stats.totalUsers > 0 ? (stats.totalQuestsCompleted / stats.totalUsers).toFixed(1) : 0} quests per user</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <Award className="text-amber-500" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{stats.totalCoinsEarned.toLocaleString()} coins in circulation</p>
                      <p className="text-sm text-gray-500">Economy health: Good</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Users List */}
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Users Management</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quests</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img 
                                    className="h-10 w-10 rounded-full" 
                                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                                    alt={user.username} 
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.level}</div>
                              <div className="text-xs text-gray-500">{user.xp} XP</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.total_quests_completed}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.coins}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.date_created)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleUserSelect(user.id)}
                                className="text-amber-600 hover:text-amber-900 mr-3"
                              >
                                View
                              </button>
                              {user.is_active ? (
                                <button
                                  onClick={() => handleDeactivateUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateUser(user.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Activate
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
            </div>
            
            {/* User Details */}
            <div className="lg:w-1/3">
              {selectedUser ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-6">
                    <img 
                      className="h-16 w-16 rounded-full mr-4" 
                      src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`} 
                      alt={selectedUser.username} 
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{selectedUser.username}</h3>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedUser.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="text-lg font-bold text-gray-800">{selectedUser.level}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">XP</p>
                      <p className="text-lg font-bold text-gray-800">{selectedUser.xp}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Quests Completed</p>
                      <p className="text-lg font-bold text-gray-800">{selectedUser.total_quests_completed}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Coins</p>
                      <p className="text-lg font-bold text-gray-800">{selectedUser.coins}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-md font-bold text-gray-800 mb-2">User Activity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Joined</span>
                        <span className="text-gray-800">{formatDate(selectedUser.date_created)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Walking Distance</span>
                        <span className="text-gray-800">{selectedUser.total_walking_distance ? `${(selectedUser.total_walking_distance / 1000).toFixed(2)} km` : '0 km'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Quests */}
                  {selectedUser.activity?.quests && selectedUser.activity.quests.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-bold text-gray-800 mb-2">Recent Quests</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedUser.activity.quests.map((quest: any) => (
                          <div key={quest.id} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-800">{quest.quest_name}</span>
                              <span className="text-xs text-gray-500">{formatDate(quest.date_completed)}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-xs">
                              <span className="text-purple-600">+{quest.xp_earned} XP</span>
                              <span className="text-amber-600">+{quest.coins_earned} coins</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Admin Actions */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-md font-bold text-gray-800 mb-3">Admin Actions</h4>
                    <div className="space-y-3">
                      {selectedUser.is_active ? (
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => handleDeactivateUser(selectedUser.id)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          Deactivate User
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => handleActivateUser(selectedUser.id)}
                          className="border-green-500 text-green-500 hover:bg-green-50"
                        >
                          Activate User
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <Users className="mx-auto text-gray-400 mb-2" size={48} />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No User Selected</h3>
                  <p className="text-gray-500 text-sm">Select a user from the list to view details and perform actions</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Special Quest Assignment */}
            <div className="lg:w-1/2">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Assign Special Quests</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 mb-4">
                  Create and assign special quests to users. These quests will appear in their quest log and reward them with XP and coins upon completion.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quest Name
                    </label>
                    <input
                      type="text"
                      value={specialQuestForm.questName}
                      onChange={(e) => setSpecialQuestForm(prev => ({ ...prev, questName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter quest name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quest Type
                    </label>
                    <select
                      value={specialQuestForm.questType}
                      onChange={(e) => setSpecialQuestForm(prev => ({ ...prev, questType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="special">Special</option>
                      <option value="walking">Walking</option>
                      <option value="exercise">Exercise</option>
                      <option value="meditation">Meditation</option>
                      <option value="journaling">Journaling</option>
                      <option value="reading">Reading</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        XP Reward
                      </label>
                      <input
                        type="number"
                        value={specialQuestForm.xpReward}
                        onChange={(e) => setSpecialQuestForm(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coins Reward
                      </label>
                      <input
                        type="number"
                        value={specialQuestForm.coinsReward}
                        onChange={(e) => setSpecialQuestForm(prev => ({ ...prev, coinsReward: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={specialQuestForm.description}
                      onChange={(e) => setSpecialQuestForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows={3}
                      placeholder="Enter quest description"
                    />
                  </div>
                </div>
                
                {selectedUser ? (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center mb-4">
                      <img 
                        className="h-10 w-10 rounded-full mr-3" 
                        src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`} 
                        alt={selectedUser.username} 
                      />
                      <div>
                        <p className="font-medium text-gray-800">{selectedUser.username}</p>
                        <p className="text-xs text-gray-500">Level {selectedUser.level}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => handleAssignSpecialQuest(selectedUser.id)}
                      className="magical-glow"
                    >
                      Assign Quest to {selectedUser.username}
                    </Button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 text-center">
                    <p className="text-gray-500 mb-2">Select a user from the list to assign a quest</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* User Selection for Quests */}
            <div className="lg:w-1/2">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select User</h2>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No users found
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {filteredUsers.map(user => (
                        <li 
                          key={user.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            selectedUser?.id === user.id ? 'bg-amber-50' : ''
                          }`}
                          onClick={() => handleUserSelect(user.id)}
                        >
                          <div className="flex items-center">
                            <img 
                              className="h-10 w-10 rounded-full mr-3" 
                              src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                              alt={user.username} 
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <p className="text-xs text-gray-500">Level {user.level}</p>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;