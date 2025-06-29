import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../utils/supabaseService';
import { User, Search, Edit, Trash2, UserPlus, Award, RefreshCw, Eye } from 'lucide-react';

interface AdminUserTableProps {
  hasSupabase: boolean;
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({
  hasSupabase,
  onViewUser,
  onEditUser,
  onDeleteUser
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      if (hasSupabase) {
        console.log('🔄 Loading users from Supabase...');
        const allUsers = await SupabaseService.getAllUserProfiles();
        console.log('👥 Users loaded:', allUsers.length, 'users');
        
        // Filter users based on search query
        let filteredUsers = allUsers;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredUsers = allUsers.filter(user =>
            (user.username && user.username.toLowerCase().includes(query)) ||
            (user.email && user.email.toLowerCase().includes(query))
          );
        }

        setTotalUsers(filteredUsers.length);
        
        // Paginate results
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
      } else {
        // Demo mode fallback
        console.log('👥 Using demo mode users');
        const demoUsers = [
          {
            id: 'demo-1',
            username: 'demo_user_1',
            email: 'demo1@example.com',
            level: 5,
            xp: 1250,
            coins: 500,
            total_quests_completed: 12,
            is_active: true,
            date_created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-2',
            username: 'demo_user_2',
            email: 'demo2@example.com',
            level: 3,
            xp: 750,
            coins: 300,
            total_quests_completed: 8,
            is_active: true,
            date_created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setUsers(demoUsers);
        setTotalUsers(demoUsers.length);
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [hasSupabase, searchQuery, currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        if (hasSupabase) {
          const success = await SupabaseService.deleteUser(userId);
          if (success) {
            console.log('✅ User deleted successfully');
            loadUsers(); // Refresh the list
            onDeleteUser(userId);
          } else {
            alert('Failed to delete user. Please try again.');
          }
        } else {
          // Demo mode
          setUsers(prev => prev.filter(user => user.id !== userId));
          onDeleteUser(userId);
        }
      } catch (error) {
        console.error('❌ Error deleting user:', error);
        alert('An error occurred while deleting the user.');
      }
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

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">User Management</h3>
            <p className="text-gray-600">
              {totalUsers} total users
              {!hasSupabase && <span className="text-orange-600 ml-2">(Demo Mode)</span>}
            </p>
          </div>
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level & Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'No users match your search criteria.' : 'No users have registered yet.'}
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
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
                    <div className="text-sm text-gray-900">Level {user.level || 1}</div>
                    <div className="text-sm text-gray-500">{user.xp || 0} XP</div>
                    <div className="text-sm text-gray-500">{user.coins || 0} coins</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.total_quests_completed || 0} quests</div>
                    <div className="text-sm text-gray-500">
                      Joined {formatTimeAgo(user.date_created)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;