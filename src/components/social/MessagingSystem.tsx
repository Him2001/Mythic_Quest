import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { SupabaseService } from '../../utils/supabaseService';
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
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
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
      SupabaseService.markMessagesAsRead(selectedConversation.id, currentUser.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const userConversations = await SupabaseService.getConversations(currentUser.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const friendships = await SupabaseService.getFriends(currentUser.id);
      const friendUsers = friendships.map(friendship => {
        // Get the other user in the friendship
        return friendship.user1_id === currentUser.id ? friendship.user2 : friendship.user1;
      });
      setFriends(friendUsers);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const conversationMessages = await SupabaseService.getMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const startConversationWithUser = async (userId: string) => {
    try {
      const conversation = await SupabaseService.createConversation(currentUser.id, userId);
      if (conversation) {
        setSelectedConversation(conversation);
        loadConversations();
      } else {
        alert('You can only message friends. Send a friend request first!');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUserId = selectedConversation.user1_id === currentUser.id 
      ? selectedConversation.user2_id 
      : selectedConversation.user1_id;

    try {
      const message = await SupabaseService.sendMessage(
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
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherUser = (conversation: any) => {
    return conversation.user1_id === currentUser.id ? conversation.user2 : conversation.user1;
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
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
    return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredFriends = friends.filter(friend => {
    if (!searchQuery.trim()) return true;
    return friend.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full sm:w-1/3 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden sm:flex' : ''}`}>
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-cinzel font-bold text-gray-800">Messages</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} sm:size={16} />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-merriweather"
              />
            </div>
          </div>

          {/* Friends Notice */}
          <div className="p-2 sm:p-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center text-blue-700 text-xs">
              <Shield size={10} sm:size={12} className="mr-1" />
              <span className="font-merriweather">You can only message friends</span>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && searchQuery.trim() === '' ? (
              <div className="p-3 sm:p-4">
                <h3 className="font-cinzel font-bold text-gray-700 mb-3 text-sm sm:text-base">Your Friends</h3>
                {friends.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Users className="mx-auto mb-2 text-gray-400" size={24} sm:size={32} />
                    <p className="text-gray-500 font-merriweather text-xs sm:text-sm">
                      No friends yet. Add friends to start messaging!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <div
                        key={friend.id}
                        onClick={() => startConversationWithUser(friend.id)}
                        className="p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center">
                          <Avatar
                            src={friend.avatar_url}
                            alt={friend.username}
                            size="sm"
                            className="mr-2 sm:mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-cinzel font-bold text-gray-800 truncate text-xs sm:text-sm">
                              {friend.username}
                            </h4>
                            <p className="text-xs text-gray-500 font-merriweather">
                              Start conversation
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Existing Conversations */}
                {filteredConversations.map(conversation => {
                  const otherUser = getOtherUser(conversation);
                  if (!otherUser) return null;

                  const isSelected = selectedConversation?.id === conversation.id;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-amber-50 border-amber-200' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <Avatar
                          src={otherUser.avatar_url}
                          alt={otherUser.username}
                          size="md"
                          className="mr-2 sm:mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-cinzel font-bold text-gray-800 truncate text-sm sm:text-base">
                              {otherUser.username}
                            </h3>
                            {conversation.last_updated && (
                              <span className="text-xs text-gray-500 font-merriweather">
                                {formatMessageTime(conversation.last_updated)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 font-merriweather truncate">
                            {conversation.last_message || 'Start a conversation...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden sm:flex' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="sm:hidden mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft size={18} sm:size={20} />
                  </button>
                  
                  {(() => {
                    const otherUser = getOtherUser(selectedConversation);
                    return otherUser ? (
                      <>
                        <Avatar
                          src={otherUser.avatar_url}
                          alt={otherUser.username}
                          size="md"
                          className="mr-2 sm:mr-3"
                        />
                        <div>
                          <h3 className="font-cinzel font-bold text-gray-800 text-sm sm:text-base">{otherUser.username}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 font-merriweather">
                            Level {otherUser.level}
                          </p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {messages.map(message => {
                  const isOwnMessage = message.sender_id === currentUser.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar
                          src={isOwnMessage ? currentUser.avatarUrl : message.sender?.avatar_url}
                          alt={isOwnMessage ? currentUser.name : message.sender?.username}
                          size="sm"
                        />
                        <div
                          className={`px-3 sm:px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="font-merriweather text-xs sm:text-sm">{message.message_text}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-amber-100' : 'text-gray-500'}`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex space-x-2 sm:space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-amber-500 font-merriweather text-sm sm:text-base"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!newMessage.trim()}
                    icon={<Send size={14} sm:size={16} />}
                    className="rounded-full magical-glow px-3 sm:px-4"
                  >
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              
              <div className="text-center">
                <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} sm:size={64} />
                <h3 className="text-lg sm:text-xl font-cinzel font-bold text-gray-600 mb-2">
                  Select a Friend to Message
                </h3>
                <p className="text-gray-500 font-merriweather text-sm sm:text-base">
                  Choose a friend from the list to start messaging
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center text-blue-700 text-xs sm:text-sm">
                    <Shield size={14} sm:size={16} className="mr-2" />
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