import React, { useState, useEffect } from 'react';
import { User, Notification as AppNotification } from '../../types';
import { NotificationService } from '../../utils/notificationService';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Bell, X, MessageCircle, Heart, UserPlus, UserCheck, Trash2, BookMarked as MarkAsRead } from 'lucide-react';

interface NotificationPanelProps {
  user: User;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ user, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user.id]);

  const loadNotifications = () => {
    setIsLoading(true);
    try {
      const userNotifications = NotificationService.getNotifications(user.id, 20);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    const success = NotificationService.markNotificationAsRead(user.id, notificationId);
    if (success) {
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = () => {
    NotificationService.markAllNotificationsAsRead(user.id);
    loadNotifications();
  };

  const handleDeleteNotification = (notificationId: string) => {
    const success = NotificationService.deleteNotification(user.id, notificationId);
    if (success) {
      loadNotifications();
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'comment':
        return <MessageCircle size={16} className="text-green-500" />;
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'friend_request':
        return <UserPlus size={16} className="text-purple-500" />;
      case 'friend_accepted':
        return <UserCheck size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'message':
        // Could trigger navigation to specific conversation
        console.log('Navigate to conversation:', notification.data?.conversationId);
        break;
      case 'comment':
      case 'like':
        // Could trigger navigation to specific post
        console.log('Navigate to post:', notification.data?.postId);
        break;
      case 'friend_request':
      case 'friend_accepted':
        // Could trigger navigation to friends section
        console.log('Navigate to friends');
        break;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-amber-200 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center">
          <Bell className="text-amber-600 mr-2" size={20} />
          <h3 className="font-cinzel font-bold text-amber-800">Notifications</h3>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              icon={<MarkAsRead size={14} />}
              className="text-xs"
            >
              Mark All Read
            </Button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-600 font-merriweather text-sm">No notifications yet</p>
            <p className="text-gray-500 font-merriweather text-xs mt-1">
              You'll see updates about messages, comments, and friend requests here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0">
                    {notification.data?.senderAvatar ? (
                      <Avatar
                        src={notification.data.senderAvatar}
                        alt={notification.data.senderName || 'User'}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-cinzel font-bold text-gray-800 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 font-merriweather line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 font-merriweather mt-1">
                          {NotificationService.formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Mark as read"
                          >
                            <MarkAsRead size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="absolute top-4 right-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-merriweather">
              {notifications.filter(n => !n.read).length} unread
            </span>
            <button
              onClick={() => {
                NotificationService.clearAllNotifications(user.id);
                loadNotifications();
              }}
              className="text-red-600 hover:text-red-700 font-merriweather"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;