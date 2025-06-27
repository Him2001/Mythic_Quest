import React, { useState, useEffect } from 'react';
import { User, FriendRequest } from '../../types';
import { SupabaseService } from '../../utils/supabaseService';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Users, UserPlus, UserMinus, MessageCircle, Search, UserCheck, UserX, Clock } from 'lucide-react';

interface FriendsTabProps {
  currentUser: User;
  onStartConversation: (userId: string) => void;
}

interface SupabaseUser {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  level?: number;
  xp?: number;
  coins?: number;
  total_quests_completed?: number;
  created_at: string;
  is_active: boolean;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ currentUser, onStartConversation }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SupabaseUser[]>([]);
  const [allUsers, setAllUsers] = useState<SupabaseUser[]>([]);
  const [friends, setFriends] = useState<SupabaseUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ sent: FriendRequest[]; received: FriendRequest[] }>({ sent: [], received: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllUsers();
    loadFriends();
    loadFriendRequests();
  }, [currentUser.id]);

  useEffect(() => {
    if (searchQuery.trim() && activeTab === 'search') {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab, allUsers]);

  const loadAllUsers = async () => {
    setIsLoading(true);
    try {
      const users = await SupabaseService.getAllUserProfiles();
      // Filter out current user and inactive users
      const filteredUsers = users.filter(user => 
        user.id !== currentUser.id && 
        user.is_active !== false
      );
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const friendships = await SupabaseService.getFriends(currentUser.id);
      const friendUsers = friendships.map(friendship => {
        // Get the other user in the friendship
        return friendship.user1_id === currentUser.id ? friendship.user2 : friendship.user1;
      }).filter(user => user !== null);
      setFriends(friendUsers);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requests = await SupabaseService.getFriendRequests(currentUser.id);
      
      const sentRequests = requests
        .filter(req => req.sender_id === currentUser.id && req.status === 'pending')
        .map(req => ({
          id: req.id,
          senderId: req.sender_id,
          receiverId: req.receiver_id,
          status: req.status as 'pending' | 'accepted' | 'rejected',
          createdAt: new Date(req.created_at),
          updatedAt: new Date(req.updated_at)
        }));

      const receivedRequests = requests
        .filter(req => req.receiver_id === currentUser.id && req.status === 'pending')
        .map(req => ({
          id: req.id,
          senderId: req.sender_id,
          receiverId: req.receiver_id,
          status: req.status as 'pending' | 'accepted' | 'rejected',
          createdAt: new Date(req.created_at),
          updatedAt: new Date(req.updated_at)
        }));

      setFriendRequests({ sent: sentRequests, received: receivedRequests });
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchTerm = searchQuery.toLowerCase();
      const results = allUsers.filter(user => 
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.username && user.username.toLowerCase().includes(searchTerm))
      ).slice(0, 20); // Limit to 20 results
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const success = await SupabaseService.sendFriendRequest(currentUser.id, userId);
      if (success) {
        loadFriendRequests();
        // Update search results to reflect new status
        handleSearch();
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const success = await SupabaseService.acceptFriendRequest(requestId);
      if (success) {
        loadFriends();
        loadFriendRequests();
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // Update request status to rejected
      const requests = await SupabaseService.getFriendRequests(currentUser.id);
      const request = requests.find(r => r.id === requestId);
      if (request) {
        // For now, we'll just reload the requests (in a full implementation, you'd have a reject method)
        loadFriendRequests();
      }
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      // In a full implementation, you'd have a removeFriend method in SupabaseService
      console.log('Remove friend:', userId);
      loadFriends();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const getFriendStatus = (userId: string) => {
    // Check if already friends
    if (friends.some(friend => friend.id === userId)) {
      return 'friends';
    }

    // Check if there's a pending request
    const sentRequest = friendRequests.sent.find(req => req.receiverId === userId);
    if (sentRequest) {
      return 'pending_sent';
    }

    const receivedRequest = friendRequests.received.find(req => req.senderId === userId);
    if (receivedRequest) {
      return 'pending_received';
    }

    return 'none';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'friends':
        return <Badge color="success" size="sm">Friends</Badge>;
      case 'pending_sent':
        return <Badge color="warning" size="sm">Request Sent</Badge>;
      case 'pending_received':
        return <Badge color="accent" size="sm">Request Received</Badge>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const renderUserCard = (user: SupabaseUser, showActions: boolean = true) => {
    const status = getFriendStatus(user.id);
    const displayName = user.username || user.email?.split('@')[0] || 'Unknown User';
    const avatarUrl = user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

    return (
      <div key={user.id} className="bg-white rounded-lg shadow-md p-4 border border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar
              src={avatarUrl}
              alt={displayName}
              size="lg"
              className="mr-4"
            />
            <div>
              <div className="flex items-center mb-1">
                <h3 className="font-cinzel font-bold text-gray-800">{displayName}</h3>
                {user.level && (
                  <Badge color="accent" size="sm" className="ml-2">
                    Level {user.level}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-amber-700 font-merriweather mb-1">{user.email}</p>
              <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                {user.total_quests_completed !== undefined && (
                  <span>{user.total_quests_completed} quests</span>
                )}
                {user.coins !== undefined && (
                  <span>{user.coins} coins</span>
                )}
                <span>Joined {formatTimeAgo(new Date(user.created_at))}</span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex flex-col space-y-2">
              {status === 'none' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSendFriendRequest(user.id)}
                  icon={<UserPlus size={14} />}
                  className="magical-glow"
                >
                  Add Friend
                </Button>
              )}
              
              {status === 'pending_sent' && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  icon={<Clock size={14} />}
                >
                  Request Sent
                </Button>
              )}
              
              {status === 'friends' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onStartConversation(user.id)}
                    icon={<MessageCircle size={14} />}
                    className="magical-glow"
                  >
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFriend(user.id)}
                    icon={<UserMinus size={14} />}
                  >
                    Remove
                  </Button>
                </>
              )}
              
              {getStatusBadge(status)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFriendRequestCard = (request: FriendRequest, type: 'sent' | 'received') => {
    const otherUserId = type === 'sent' ? request.receiverId : request.senderId;
    const user = allUsers.find(u => u.id === otherUserId);
    
    if (!user) return null;

    const displayName = user.username || user.email?.split('@')[0] || 'Unknown User';
    const avatarUrl = user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

    return (
      <div key={request.id} className="bg-white rounded-lg shadow-md p-4 border border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar
              src={avatarUrl}
              alt={displayName}
              size="md"
              className="mr-3"
            />
            <div>
              <h3 className="font-cinzel font-bold text-gray-800">{displayName}</h3>
              <p className="text-sm text-gray-600 font-merriweather">{user.email}</p>
              <p className="text-xs text-gray-500 font-merriweather">
                {type === 'sent' ? 'Request sent' : 'Request received'} {formatTimeAgo(request.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {type === 'received' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAcceptRequest(request.id)}
                  icon={<UserCheck size={14} />}
                  className="magical-glow"
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectRequest(request.id)}
                  icon={<UserX size={14} />}
                >
                  Reject
                </Button>
              </>
            )}
            
            {type === 'sent' && (
              <Badge color="warning" size="sm">
                <Clock size={12} className="mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-800 font-cinzel">Loading community...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Users className="text-amber-600 mr-3 magical-glow" size={28} />
          <div>
            <h1 className="text-2xl font-cinzel font-bold text-amber-800 magical-glow">
              Friends & Community
            </h1>
            <p className="text-amber-700 font-merriweather">
              Connect with fellow adventurers on their wellness journey
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-4 rounded-md font-cinzel font-bold transition-all duration-200 ${
              activeTab === 'friends'
                ? 'bg-white text-amber-800 shadow-md'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-4 rounded-md font-cinzel font-bold transition-all duration-200 ${
              activeTab === 'requests'
                ? 'bg-white text-amber-800 shadow-md'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            Requests ({friendRequests.received.length + friendRequests.sent.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-md font-cinzel font-bold transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-white text-amber-800 shadow-md'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            Find Friends
          </button>
        </div>
      </div>

      {/* Search Bar (for search tab) */}
      {activeTab === 'search' && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none font-merriweather bg-white/80 backdrop-blur-sm"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'friends' && (
          <>
            {friends.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Users className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
                  No Friends Yet
                </h3>
                <p className="text-gray-500 font-merriweather">
                  Search for adventurers to add as friends!
                </p>
              </div>
            ) : (
              friends.map(user => renderUserCard(user))
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {friendRequests.received.length > 0 && (
              <div>
                <h3 className="text-lg font-cinzel font-bold text-amber-800 mb-3">
                  Received Requests ({friendRequests.received.length})
                </h3>
                <div className="space-y-3 mb-6">
                  {friendRequests.received.map(request => renderFriendRequestCard(request, 'received'))}
                </div>
              </div>
            )}

            {friendRequests.sent.length > 0 && (
              <div>
                <h3 className="text-lg font-cinzel font-bold text-amber-800 mb-3">
                  Sent Requests ({friendRequests.sent.length})
                </h3>
                <div className="space-y-3">
                  {friendRequests.sent.map(request => renderFriendRequestCard(request, 'sent'))}
                </div>
              </div>
            )}

            {friendRequests.received.length === 0 && friendRequests.sent.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <UserPlus className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
                  No Friend Requests
                </h3>
                <p className="text-gray-500 font-merriweather">
                  Send friend requests to connect with other adventurers!
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'search' && (
          <>
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
                <p className="text-amber-800 font-cinzel">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-cinzel font-bold text-amber-800">
                    Search Results ({searchResults.length})
                  </h3>
                  <p className="text-sm text-gray-600 font-merriweather">
                    Showing registered users from Supabase
                  </p>
                </div>
                {searchResults.map(user => renderUserCard(user))}
              </>
            ) : searchQuery.trim() ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Search className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-500 font-merriweather">
                  Try searching with a different name or email address.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Search className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
                  Find New Friends
                </h3>
                <p className="text-gray-500 font-merriweather mb-4">
                  Search for other adventurers by name or email address to send friend requests.
                </p>
                <p className="text-xs text-gray-400 font-merriweather">
                  Showing users registered in Supabase authentication database
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsTab;