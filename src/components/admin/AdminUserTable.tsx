import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../utils/supabaseService';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  Search, 
  Edit, 
  Trash2, 
  Award, 
  MoreHorizontal, 
  UserCheck, 
  UserX,
  Calendar,
  Coins,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface AdminUserTableProps {
  refreshTrigger?: number;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ refreshTrigger = 0 }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'demo' | 'error'>('demo');

  const loadUsers = async () => {
    setIsLoading(true);
    console.log('👥 Loading users for admin table...');
    
    try {
      // Check if Supabase is available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('👥 Supabase not configured, using demo users');
        setConnectionStatus('demo');
        
        // Demo users data
        const demoUsers = [
          {
            id: 'demo-user-1',
            username: 'demo_user_1',
            email: 'demo1@example.com',
            level: 5,
            xp: 1250,
            coins: 340,
            total_quests_completed: 12,
            is_active: true,
            date_created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            updated_at: new Date().toISOString(),
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo1'
          },
          {
            id: 'demo-user-2',
            username: 'demo_user_2',
            email: 'demo2@example.com',
            level: 3,
            xp: 750,
            coins: 180,
            total_quests_completed: 8,
            is_active: true,
            date_created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            updated_at: new Date().toISOString(),
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo2'
          }
        ];
        
        setUsers(demoUsers);
        return;
      }

      setConnectionStatus('connected');
      const allUsers = await SupabaseService.getAllUserProfiles();
      console.log('👥 Received users from Supabase:', allUsers.length, 'users');
      console.log('👥 First user sample:', allUsers[0]);
      
      setUsers(allUsers);
      
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setConnectionStatus('error');
      
      // Fallback to demo data
      const demoUsers = [
        {
          id: 'demo-user-1',
          username: 'demo_user_1',
          email: 'demo1@example.com',
          level: 5,
          xp: 1250,
          coins: 340,
          total_quests_completed: 12,
          is_active: true,
          date_created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo1'
        },
        {
          id: 'demo-user-2',
          username: 'demo_user_2',
          email: 'demo2@example.com',
          level: 3,
          xp: 750,
          coins: 180,
          total_quests_completed: 8,
          is_active: true,
          date_created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo2'
        }
      ];
      
      setUsers(demoUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await SupabaseService.deleteUser(userId);
      if (success) {
        setUsers(users.filter(user => user.id !== userId));
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const success = await SupabaseService.adminUpdateUserProfile(userId, {
        is_active: !currentStatus
      });
      
      if (success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, is_active: !currentStatus }
            : user
        ));
        alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'demo': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected to Supabase';
      case 'demo': return 'Demo Mode (Supabase not configured)';
      case 'error': return 'Connection Error - Using fallback data';
      default: return 'Unknown status';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Users Management</h2>
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Users Management</h2>
            <p className="text-sm text-gray-600">
              Total: {users.length} users | Active: {users.filter(u => u.is_active).length}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'demo' ? 'bg-orange-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs font-medium ${getConnectionStatusColor()}`}>
                {getConnectionStatusText()}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              icon={<RefreshCw size={16} />}
            >
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
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
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <TrendingUp size={14} className="text-blue-500 mr-1" />
                      <span className="text-sm text-gray-900">Level {user.level}</span>
                    </div>
                    <div className="flex items-center">
                      <Coins size={14} className="text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-900">{user.coins}</span>
                    </div>
                    <div className="flex items-center">
                      <Award size={14} className="text-purple-500 mr-1" />
                      <span className="text-sm text-gray-900">{user.total_quests_completed}</span>
                    </div>
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
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(user.date_created)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                      icon={user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      className={user.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      icon={<Edit size={14} />}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      icon={<Trash2 size={14} />}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search criteria.' : 'No users have registered yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserTable;