import React, { useState, useEffect } from 'react';
import { User, FriendRequest } from '../../types';
import { SocialService } from '../../utils/socialService';
import { AuthService } from '../../utils/authService';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Users, UserPlus, UserMinus, MessageCircle, Search, UserCheck, UserX, Clock } from 'lucide-react';

interface FriendsTabProps {
  currentUser: User;
  onStartConversation: (userId: string) => void;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ currentUser, onStartConversation }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ sent: FriendRequest[]; received: FriendRequest[] }>({ sent: [], received: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [currentUser.id]);

  useEffect(() => {
    if (searchQuery.trim() && activeTab === 'search') {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  const loadFriends = () => {
    const friendIds = SocialService.getFriends(currentUser.id);
    const friendUsers = friendIds
      .map(id => AuthService.getUserById(id))
      .filter(user => user !== null) as User[];
    setFriends(friendUsers);
  };

  const loadFriendRequests = () => {
    const requests = SocialService.getFriendRequests(currentUser.id);
    setFriendRequests(requests);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = SocialService.searchUsers(searchQuery, currentUser.id);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = (userId: string) => {
    const success = SocialService.sendFriendRequest(currentUser.id, userId);
    if (success) {
      loadFriendRequests();
      // Update search results to reflect new status
      handleSearch();
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const success = SocialService.acceptFriendRequest(requestId);
    if (success) {
      loadFriends();
      loadFriendRequests();
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const success = SocialService.rejectFriendRequest(requestId);
    if (success) {
      loadFriendRequests();
    }
  };

  const handleRemoveFriend = (userId: string) => {
    const success = SocialService.removeFriend(currentUser.id, userId);
    if (success) {
      loadFriends();
    }
  };

  const getFriendStatus = (userId: string) => {
    return SocialService.getFriendStatus(currentUser.id, userId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'friends':
        return <Badge color="success\" size="sm">Friends</Badge>;
      case 'pending_sent':
        return <Badge color="warning" size="sm">Request Sent</Badge>;
      case 'pending_received':
        return <Badge color="accent" size="sm">Request Received</Badge>;
      default:
        return null;
    }
  };

  const renderUserCard = (user: User, showActions: boolean = true) => {
    const status = getFriendStatus(user.id);
    const isOnline = user.isOnline || Math.random() > 0.5; // Mock online status

    return (
      <div key={user.id} className="bg-white rounded-lg shadow-md p-4 border border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="lg"
              status={isOnline ? 'online' : 'offline'}
              className="mr-4"
            />
            <div>
              <div className="flex items-center mb-1">
                <h3 className="font-cinzel font-bold text-gray-800">{user.name}</h3>
                <Badge color="accent" size="sm" className="ml-2">
                  Level {user.level}
                </Badge>
              </div>
              <p className="text-sm text-amber-700 font-merriweather mb-1">{user.email}</p>
              {user.bio && (
                <p className="text-xs text-gray-600 font-merriweather">{user.bio}</p>
              )}
              <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                <span>{user.questsCompleted} quests</span>
                <span>{user.mythicCoins} coins</span>
                <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
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
    const user = AuthService.getUserById(otherUserId);
    
    if (!user) return null;

    return (
      <div key={request.id} className="bg-white rounded-lg shadow-md p-4 border border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="md"
              className="mr-3"
            />
            <div>
              <h3 className="font-cinzel font-bold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-600 font-merriweather">{user.email}</p>
              <p className="text-xs text-gray-500 font-merriweather">
                {type === 'sent' ? 'Request sent' : 'Request received'} {SocialService.formatTimeAgo(request.createdAt)}
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
                <Users className="mx-auto mb-4 text-gray-400\" size={48} />
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
              searchResults.map(user => renderUserCard(user))
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
                <p className="text-gray-500 font-merriweather">
                  Search for other adventurers by name or email address to send friend requests.
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