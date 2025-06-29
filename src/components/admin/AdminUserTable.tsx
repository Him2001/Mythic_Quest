import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { SupabaseService } from '../../utils/supabaseService';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Search, Eye, Trash2, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminUserTableProps {
  onViewUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ onViewUser, onDeleteUser }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const usersPerPage = 10;
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allUsers = await SupabaseService.getAllUserProfiles();
      
      // Filter users based on search query
      let filteredUsers = allUsers;
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase();
        filteredUsers = allUsers.filter(user =>
          (user.username && user.username.toLowerCase().includes(searchTerm)) ||
          (user.email && user.email.toLowerCase().includes(searchTerm))
        );
      }

      // Sort by creation date (newest first)
      filteredUsers.sort((a, b) => new Date(b.date_created || b.created_at).getTime() - new Date(a.date_created || a.created_at).getTime());

      // Paginate
      const startIndex = (currentPage - 1) * usersPerPage;
      const endIndex = startIndex + usersPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotalUsers(filteredUsers.length);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        const success = await SupabaseService.deleteUser(userId);
        if (success) {
          await loadUsers(); // Reload the users list
          onDeleteUser(userId);
        } else {
          alert('Failed to delete user. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      
      return `${Math.floor(diffInDays / 30)} months ago`;
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-800 font-cinzel">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <UserX size={48} className="mx-auto mb-2" />
            <p className="font-cinzel font-bold">Error Loading Users</p>
          </div>
          <p className="text-gray-600 font-merriweather mb-4">{error}</p>
          <Button variant="primary" onClick={loadUsers}>
            Try Again
          </Button>
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
          <div className="text-sm text-gray-600 font-merriweather">
            {totalUsers} total users
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather"
          />
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <UserX className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-cinzel font-bold text-gray-600 mb-2">
            {searchQuery ? 'No Users Found' : 'No Users Yet'}
          </h3>
          <p className="text-gray-500 font-merriweather">
            {searchQuery 
              ? 'Try adjusting your search criteria.' 
              : 'Users will appear here once they sign up.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-cinzel font-bold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-cinzel font-bold text-gray-500 uppercase tracking-wider">
                    Level & Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-cinzel font-bold text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-cinzel font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-cinzel font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.username}
                          size="md"
                          className="mr-4"
                        />
                        <div>
                          <div className="text-sm font-cinzel font-bold text-gray-900">
                            {user.username || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500 font-merriweather">
                            {user.email || 'No email'}
                          </div>
                          <div className="text-xs text-gray-400 font-merriweather">
                            Joined {formatDate(user.date_created || user.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <Badge color="accent" size="sm" className="mr-2">
                            Level {user.level || 1}
                          </Badge>
                          <span className="text-gray-600 font-merriweather">
                            {user.xp || 0} XP
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-merriweather">
                          {user.total_quests_completed || 0} quests completed
                        </div>
                        <div className="text-xs text-amber-600 font-merriweather">
                          {user.coins || 0} coins
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900 font-merriweather">
                          {formatTimeAgo(user.updated_at || user.date_created || user.created_at)}
                        </div>
                        <div className="text-xs text-gray-500 font-merriweather">
                          Last activity
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        color={user.is_active !== false ? 'success' : 'error'} 
                        size="sm"
                      >
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewUser(user.id)}
                          icon={<Eye size={14} />}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.username)}
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-merriweather">
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  icon={<ChevronLeft size={14} />}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm font-cinzel text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  icon={<ChevronRight size={14} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUserTable;