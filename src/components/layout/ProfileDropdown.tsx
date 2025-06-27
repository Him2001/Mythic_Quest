import React, { useState } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { 
  User as UserIcon, 
  Camera, 
  Settings, 
  LogOut, 
  X,
  Upload,
  Trash2
} from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  onClose: () => void;
  onSignOut: () => void;
  onProfileUpdate: (updatedUser: User) => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onClose,
  onSignOut,
  onProfileUpdate
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Predefined avatar options
  const avatarOptions = [
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to data URL for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSelectedAvatar(dataUrl);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Failed to read the image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleAvatarChange = () => {
    if (!selectedAvatar) return;

    const updatedUser = {
      ...user,
      avatarUrl: selectedAvatar
    };

    onProfileUpdate(updatedUser);
    setShowAvatarModal(false);
    setSelectedAvatar('');
    onClose();
  };

  const handleRemoveAvatar = () => {
    const defaultAvatar = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400';
    const updatedUser = {
      ...user,
      avatarUrl: defaultAvatar
    };

    onProfileUpdate(updatedUser);
    onClose();
  };

  return (
    <>
      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
        {/* User Info Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="md"
              className="border-2 border-amber-300"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-cinzel font-bold text-gray-800 truncate">{user.name}</h3>
              <p className="text-sm text-gray-600 font-merriweather">{user.email}</p>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs text-amber-600 font-cinzel">Level {user.level}</span>
                <span className="text-xs text-gray-500 font-merriweather">{user.mythicCoins} coins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="py-2">
          <button
            onClick={() => setShowAvatarModal(true)}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <Camera size={16} className="mr-3 text-amber-600" />
            <span className="font-merriweather text-sm">Change Profile Picture</span>
          </button>

          <button
            onClick={handleRemoveAvatar}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <Trash2 size={16} className="mr-3 text-red-500" />
            <span className="font-merriweather text-sm">Remove Profile Picture</span>
          </button>

          <div className="border-t border-gray-200 my-2"></div>

          <button
            onClick={onSignOut}
            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut size={16} className="mr-3" />
            <span className="font-merriweather text-sm">Sign Out</span>
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-cinzel font-bold text-gray-800">Change Profile Picture</h2>
              <button
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedAvatar('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Current Avatar */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-3">Current Avatar</h3>
                <Avatar
                  src={selectedAvatar || user.avatarUrl}
                  alt={user.name}
                  size="xl"
                  className="mx-auto border-4 border-amber-300"
                />
              </div>

              {/* Upload Custom Image */}
              <div className="mb-6">
                <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-3">Upload Custom Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        <span className="text-sm text-gray-600 font-merriweather">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="text-gray-400" size={32} />
                        <span className="text-sm text-gray-600 font-merriweather">
                          Click to upload your own image
                        </span>
                        <span className="text-xs text-gray-500 font-merriweather">
                          JPG, PNG, GIF (Max 5MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Predefined Avatars */}
              <div className="mb-6">
                <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-3">Choose from Gallery</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {avatarOptions.map((avatarUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(avatarUrl)}
                      className={`relative rounded-full overflow-hidden transition-all duration-200 hover:scale-105 ${
                        selectedAvatar === avatarUrl
                          ? 'ring-4 ring-amber-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-amber-300'
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar option ${index + 1}`}
                        className="w-16 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAvatarModal(false);
                    setSelectedAvatar('');
                  }}
                  className="flex-1"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAvatarChange}
                  className="flex-1 magical-glow"
                  disabled={!selectedAvatar || isUploading}
                >
                  Update Avatar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
    </>
  );
};

export default ProfileDropdown;