import React, { useState, useEffect } from 'react';
import { AdminUser } from '../../types';
import { AdminService } from '../../utils/adminService';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { Search, Eye, UserX, UserCheck, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface AdminUserTableProps {
  onUserSelect: (userId: string) => void;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const usersPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = AdminService.getAdminUsers(currentPage, usersPerPage, searchQuery);
      setUsers(result.users);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        AdminService.deactivateUser(userId);
      } else {
        AdminService.activateUser(userId);
      }
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleExportData = () => {
    const csvData = AdminService.exportUserData();
    const blob = new Blob([csvData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mythic-quest-users-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAuthMethodBadge = (method: string) => {
    const colors = {
      email: 'primary' as const,
      google: 'success' as const,
      facebook: 'accent' as const,
      github: 'secondary' as const
    };
    return colors[method as keyof typeof colors] || 'primary';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-cinzel">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-cinzel font-bold text-amber-800 magical-glow">
            User Management
          </h2>
          <p className="text-amber-700 font-merriweather text-sm">
            {total} total users • Page {currentPage} of {totalPages}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleExportData}
          icon={<Download size={16} />}
          className="magical-glow"
        >
          Export Data
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" size={20} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/90"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b-2 border-amber-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-cinzel font-bold text-amber-800">User</th>
                <th className="px-6 py-4 text-left text-sm font-cinzel font-bold text-amber-800">Level & XP</th>
                <th className="px-6 py-4 text-left text-sm font-cinzel font-bold text-amber-800">Progress</th>
                <th className="px-6 py-4 text-left text-sm font-cinzel font-bold text-amber-800">Auth Method</th>
                <th className="px-6 py-4 text-left text-sm font-cinzel font-bold text-amber-800">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-cinzel font-bold text-amber-800">Status</th>
                <th className="px-6 py-4 text-left text-sm font-cinzel font-bold text-amber-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-amber-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Avatar
                        src={`https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg?auto=compress&cs=tinysrgb&w=600`}
                        alt={user.name}
                        size="sm"
                        className="mr-3"
                      />
                      <div>
                        <p className="font-cinzel font-bold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600 font-merriweather">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-cinzel font-bold text-amber-700">Level {user.level}</p>
                      <p className="text-sm text-gray-600 font-merriweather">{user.xp} XP</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <span className="font-merriweather text-gray-600 mr-2">Quests:</span>
                        <span className="font-cinzel font-bold text-green-600">{user.questsCompleted}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-merriweather text-gray-600 mr-2">Posts:</span>
                        <span className="font-cinzel font-bold text-blue-600">{user.postsCount}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-merriweather text-gray-600 mr-2">Coins:</span>
                        <span className="font-cinzel font-bold text-amber-600">{user.mythicCoins}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={getAuthMethodBadge(user.authMethod)} size="sm">
                      {user.authMethod.charAt(0).toUpperCase() + user.authMethod.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-merriweather text-gray-800">
                        {formatDate(user.joinDate)}
                      </p>
                      <p className="text-xs font-merriweather text-gray-500">
                        Last: {formatDate(user.lastLoginDate)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={user.isActive ? 'success' : 'error'} size="sm">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUserSelect(user.id)}
                        icon={<Eye size={14} />}
                      >
                        View
                      </Button>
                      <Button
                        variant={user.isActive ? "outline" : "primary"}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        icon={user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
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
          <div className="bg-amber-50 px-6 py-4 border-t border-amber-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-700 font-merriweather">
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, total)} of {total} users
              </p>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  icon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  icon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserTable;