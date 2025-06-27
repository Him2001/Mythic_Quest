import React, { useState, useEffect, useRef } from 'react';
import { User, Conversation, DirectMessage } from '../../types';
import { SocialService } from '../../utils/socialService';
import { AuthService } from '../../utils/authService';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { MessageCircle, Send, ArrowLeft, Users, Search, Shield } from 'lucide-react';

interface MessagingSystemProps {
  currentUser: User;
  selectedUserId?: string;
  onClose: () => void;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({
  currentUser,
  selectedUserId,
  onClose
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadFriends();
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedUserId) {
      startConversationWithUser(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      SocialService.markMessagesAsRead(selectedConversation.id, currentUser.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = () => {
    const userConversations = SocialService.getConversations(currentUser.id);
    setConversations(userConversations);
  };

  const loadFriends = () => {
    const friendIds = SocialService.getFriends(currentUser.id);
    const friendUsers = friendIds
      .map(id => AuthService.getUserById(id))
      .filter(user => user !== null) as User[];
    setFriends(friendUsers);
  };

  const loadMessages = (conversationId: string) => {
    const conversationMessages = SocialService.getMessages(conversationId);
    setMessages(conversationMessages);
  };

  const startConversationWithUser = (userId: string) => {
    // Check if users are friends
    if (!SocialService.areFriends(currentUser.id, userId)) {
      alert('You can only message friends. Send a friend request first!');
      return;
    }

    const conversation = SocialService.createConversation(currentUser.id, userId);
    if (conversation) {
      setSelectedConversation(conversation);
      loadConversations();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUserId = selectedConversation.participants.find(id => id !== currentUser.id);
    if (!otherUserId) return;

    const message = SocialService.sendMessage(
      selectedConversation.id,
      currentUser.id,
      otherUserId,
      newMessage.trim()
    );

    if (message) {
      setNewMessage('');
      loadMessages(selectedConversation.id);
      loadConversations();
    } else {
      alert('You can only message friends!');
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== currentUser.id);
    return friends.find(friend => friend.id === otherUserId) || 
           AuthService.getUserById(otherUserId || '');
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const otherUser = getOtherUser(conv);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredFriends = friends.filter(friend => {
    if (!searchQuery.trim()) return true;
    return friend.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-1/3 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-cinzel font-bold text-gray-800">Messages</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-merriweather"
              />
            </div>
          </div>

          {/* Friends Notice */}
          <div className="p-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center text-blue-700 text-xs">
              <Shield size={12} className="mr-1" />
              <span className="font-merriweather">You can only message friends</span>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && searchQuery.trim() === '' ? (
              <div className="p-4">
                <h3 className="font-cinzel font-bold text-gray-700 mb-3">Your Friends</h3>
                {friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-gray-500 font-merriweather text-sm">
                      No friends yet. Add friends to start messaging!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => {
                      const isOnline = friend.isOnline || Math.random() > 0.5; // Mock online status
                      return (
                        <div
                          key={friend.id}
                          onClick={() => startConversationWithUser(friend.id)}
                          className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center">
                            <Avatar
                              src={friend.avatarUrl}
                              alt={friend.name}
                              size="sm"
                              status={isOnline ? 'online' : 'offline'}
                              className="mr-3"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-cinzel font-bold text-gray-800 truncate text-sm">
                                {friend.name}
                              </h4>
                              <p className="text-xs text-gray-500 font-merriweather">
                                {isOnline ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Existing Conversations */}
                {filteredConversations.map(conversation => {
                  const otherUser = getOtherUser(conversation);
                  if (!otherUser) return null;

                  const unreadCount = conversation.unreadCount[currentUser.id] || 0;
                  const isSelected = selectedConversation?.id === conversation.id;
                  const isOnline = otherUser.isOnline || Math.random() > 0.5; // Mock online status

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-amber-50 border-amber-200' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <Avatar
                          src={otherUser.avatarUrl}
                          alt={otherUser.name}
                          size="md"
                          status={isOnline ? 'online' : 'offline'}
                          className="mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-cinzel font-bold text-gray-800 truncate">
                              {otherUser.name}
                            </h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500 font-merriweather">
                                {formatMessageTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 font-merriweather truncate">
                              {conversation.lastMessage?.content || 'Start a conversation...'}
                            </p>
                            {unreadCount > 0 && (
                              <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Available Friends to Message */}
                {searchQuery.trim() && filteredFriends.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-cinzel font-bold text-gray-700 mb-3">Available Friends</h3>
                    {filteredFriends
                      .filter(friend => !conversations.some(conv => conv.participants.includes(friend.id)))
                      .map(friend => {
                        const isOnline = friend.isOnline || Math.random() > 0.5;
                        return (
                          <div
                            key={friend.id}
                            onClick={() => startConversationWithUser(friend.id)}
                            className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="flex items-center">
                              <Avatar
                                src={friend.avatarUrl}
                                alt={friend.name}
                                size="sm"
                                status={isOnline ? 'online' : 'offline'}
                                className="mr-3"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-cinzel font-bold text-gray-800 truncate text-sm">
                                  {friend.name}
                                </h4>
                                <p className="text-xs text-gray-500 font-merriweather">
                                  Start conversation
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  
                  {(() => {
                    const otherUser = getOtherUser(selectedConversation);
                    const isOnline = otherUser?.isOnline || Math.random() > 0.5;
                    return otherUser ? (
                      <>
                        <Avatar
                          src={otherUser.avatarUrl}
                          alt={otherUser.name}
                          size="md"
                          status={isOnline ? 'online' : 'offline'}
                          className="mr-3"
                        />
                        <div>
                          <h3 className="font-cinzel font-bold text-gray-800">{otherUser.name}</h3>
                          <p className="text-sm text-gray-600 font-merriweather">
                            {isOnline ? 'Online' : `Last seen ${SocialService.formatTimeAgo(otherUser.lastSeenAt || new Date())}`}
                          </p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => {
                  const isOwnMessage = message.senderId === currentUser.id;
                  const sender = isOwnMessage ? currentUser : getOtherUser(selectedConversation);

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar
                          src={sender?.avatarUrl || ''}
                          alt={sender?.name || ''}
                          size="sm"
                        />
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="font-merriweather text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-amber-100' : 'text-gray-500'}`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-amber-500 font-merriweather"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!newMessage.trim()}
                    icon={<Send size={16} />}
                    className="rounded-full magical-glow"
                  >
                    Send
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
                  Select a Friend to Message
                </h3>
                <p className="text-gray-500 font-merriweather">
                  Choose a friend from the list to start messaging
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center text-blue-700 text-sm">
                    <Shield size={16} className="mr-2" />
                    <span className="font-merriweather">Only friends can message each other</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;