import React, { useState, useEffect } from 'react';
import { User, Quest } from '../../types';
import { mockQuests } from '../../data/mockData';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { X, Image, Video, Tag, Award, Upload, Camera, FileImage, Trash2 } from 'lucide-react';

interface CreatePostModalProps {
  currentUser: User;
  onCreatePost: (
    caption: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    questTag?: { questId: string; questTitle: string; questType: string },
    achievementTag?: { achievementId: string; achievementTitle: string; achievementType: string }
  ) => void;
  onClose: () => void;
  prefilledPost?: {
    caption: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    achievementTag?: {
      achievementId: string;
      achievementTitle: string;
      achievementType: string;
    };
  } | null;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  onCreatePost,
  onClose,
  prefilledPost = null
}) => {
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showQuestSelector, setShowQuestSelector] = useState(false);
  const [showAchievementSelector, setShowAchievementSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const completedQuests = mockQuests.filter(q => q.completed);
  const achievements = [
    { id: 'first-quest', title: 'First Quest Complete', type: 'milestone' },
    { id: 'level-up', title: 'Level Up!', type: 'progression' },
    { id: 'streak-7', title: '7-Day Streak', type: 'consistency' },
    { id: 'mountain-conqueror', title: 'Mountain Conqueror', type: 'exploration' }
  ];

  // Initialize with prefilled data if provided
  useEffect(() => {
    if (prefilledPost) {
      setCaption(prefilledPost.caption);
      
      if (prefilledPost.mediaUrl) {
        setMediaPreview(prefilledPost.mediaUrl);
        setMediaType(prefilledPost.mediaType || 'image');
      }
      
      if (prefilledPost.achievementTag) {
        setSelectedAchievement(prefilledPost.achievementTag);
      }
    }
  }, [prefilledPost]);

  const validateFile = (file: File): string | null => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return 'Please select an image (JPG, PNG, GIF, WebP) or video (MP4, WebM) file.';
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return `File is too large. Maximum size is 50MB. Your file is ${formatFileSize(file.size)}.`;
    }

    // Check specific formats
    if (isImage) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        return 'Invalid image format. Please use JPG, PNG, GIF, or WebP.';
      }
    }

    if (isVideo) {
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validVideoTypes.includes(file.type)) {
        return 'Invalid video format. Please use MP4 or WebM.';
      }
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsProcessingMedia(true);
    
    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Determine media type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      setMediaType(isImage ? 'image' : 'video');

      // Process the file
      let processedFile = file;
      
      if (isImage) {
        // Only compress if image is larger than 2MB
        if (file.size > 2 * 1024 * 1024) {
          processedFile = await compressImage(file);
        }
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(processedFile);
      setMediaPreview(previewUrl);
      setMediaFile(processedFile);
      
    } catch (error) {
      console.error('Error processing media:', error);
      setUploadError('Failed to process media file. Please try again with a different file.');
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      img.onload = () => {
        try {
          // Calculate new dimensions (max 1920px width/height for better quality)
          const maxSize = 1920;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.85 // 85% quality for better balance
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview('');
    setUploadError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let mediaDataUrl: string | undefined;
      
      // Convert file to data URL for storage, or use existing media URL from prefilled post
      if (mediaFile) {
        mediaDataUrl = await convertFileToDataURL(mediaFile);
      } else if (prefilledPost?.mediaUrl) {
        mediaDataUrl = prefilledPost.mediaUrl;
      }

      const questTag = selectedQuest ? {
        questId: selectedQuest.id,
        questTitle: selectedQuest.title,
        questType: selectedQuest.type
      } : undefined;

      const achievementTag = selectedAchievement ? {
        achievementId: selectedAchievement.id,
        achievementTitle: selectedAchievement.title,
        achievementType: selectedAchievement.type
      } : undefined;

      await onCreatePost(
        caption,
        mediaDataUrl,
        mediaFile ? mediaType : prefilledPost?.mediaType,
        questTag,
        achievementTag
      );
      
      // Clean up
      if (mediaPreview && mediaFile) {
        URL.revokeObjectURL(mediaPreview);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      setUploadError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      walking: '🚶‍♀️',
      exercise: '💪',
      meditation: '🧘‍♀️',
      journaling: '📝',
      reading: '📚',
      social: '👥'
    };
    return iconMap[type] || '⭐';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-4 sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-lg sm:text-xl font-cinzel font-bold text-gray-800">
            {prefilledPost ? 'Share Your Achievement' : 'Create New Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} sm:size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Caption */}
          <div>
            <label className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
              Share your journey
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening on your wellness adventure?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-merriweather resize-none text-sm sm:text-base"
              required
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-cinzel font-bold text-gray-700 mb-2">
              Add Media
            </label>
            
            {/* Upload Error */}
            {uploadError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start text-red-700 text-sm">
                  <span className="mr-2">⚠️</span>
                  <span>{uploadError}</span>
                </div>
              </div>
            )}
            
            {!mediaFile && !mediaPreview ? (
              <div className="space-y-3">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-amber-500 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="media-upload"
                    disabled={isProcessingMedia}
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    {isProcessingMedia ? (
                      <>
                        <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-amber-600"></div>
                        <span className="text-sm text-gray-600 font-merriweather">Processing media...</span>
                      </>
                    ) : (
                      <>
                        <div className="flex space-x-2">
                          <Camera className="text-gray-400" size={20} sm:size={24} />
                          <FileImage className="text-gray-400" size={20} sm:size={24} />
                        </div>
                        <span className="text-sm text-gray-600 font-merriweather">
                          Click to upload image or video
                        </span>
                        <span className="text-xs text-gray-500 font-merriweather">
                          JPG, PNG, GIF, WebP, MP4, WebM (Max 50MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Quick Upload Buttons */}
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('media-upload')?.click()}
                    icon={<Image size={14} sm:size={16} />}
                    disabled={isProcessingMedia}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('media-upload')?.click()}
                    icon={<Video size={14} sm:size={16} />}
                    disabled={isProcessingMedia}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Upload Video
                  </Button>
                </div>
              </div>
            ) : (
              /* Media Preview */
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-cinzel text-gray-600">Media Preview:</span>
                  {!prefilledPost && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeMedia}
                      icon={<Trash2 size={12} sm:size={14} />}
                      className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {mediaType === 'video' ? (
                    <video 
                      src={mediaPreview} 
                      controls 
                      className="w-full max-h-48 rounded object-cover"
                      preload="metadata"
                    />
                  ) : (
                    <img 
                      src={mediaPreview} 
                      alt="Preview" 
                      className="w-full max-h-48 object-cover rounded"
                    />
                  )}
                  
                  {mediaFile && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-merriweather truncate mr-2">{mediaFile.name}</span>
                      <span className="font-merriweather whitespace-nowrap">{formatFileSize(mediaFile.size)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-cinzel font-bold text-gray-700">Add Tags (Optional)</h3>
            
            {/* Quest Tag */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-merriweather text-gray-600">Tag a Quest</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuestSelector(!showQuestSelector)}
                  icon={<Tag size={12} sm:size={14} />}
                  className="text-xs sm:text-sm"
                >
                  {selectedQuest ? 'Change Quest' : 'Add Quest'}
                </Button>
              </div>
              
              {selectedQuest && (
                <Badge color="primary" className="mb-2">
                  <span className="mr-1">{getQuestTypeIcon(selectedQuest.type)}</span>
                  {selectedQuest.title}
                  <button
                    type="button"
                    onClick={() => setSelectedQuest(null)}
                    className="ml-2 text-white/70 hover:text-white"
                  >
                    <X size={10} sm:size={12} />
                  </button>
                </Badge>
              )}
              
              {showQuestSelector && (
                <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {completedQuests.length === 0 ? (
                    <p className="text-sm text-gray-500 font-merriweather">
                      Complete some quests to tag them in your posts!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {completedQuests.map(quest => (
                        <button
                          key={quest.id}
                          type="button"
                          onClick={() => {
                            setSelectedQuest(quest);
                            setShowQuestSelector(false);
                          }}
                          className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm font-merriweather"
                        >
                          <span className="mr-2">{getQuestTypeIcon(quest.type)}</span>
                          {quest.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Achievement Tag */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-merriweather text-gray-600">Tag an Achievement</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAchievementSelector(!showAchievementSelector)}
                  icon={<Award size={12} sm:size={14} />}
                  className="text-xs sm:text-sm"
                >
                  {selectedAchievement ? 'Change Achievement' : 'Add Achievement'}
                </Button>
              </div>
              
              {selectedAchievement && (
                <Badge color="warning" className="mb-2">
                  <span className="mr-1">🏆</span>
                  {selectedAchievement.title}
                  <button
                    type="button"
                    onClick={() => setSelectedAchievement(null)}
                    className="ml-2 text-white/70 hover:text-white"
                  >
                    <X size={10} sm:size={12} />
                  </button>
                </Badge>
              )}
              
              {showAchievementSelector && (
                <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <div className="space-y-2">
                    {achievements.map(achievement => (
                      <button
                        key={achievement.id}
                        type="button"
                        onClick={() => {
                          setSelectedAchievement(achievement);
                          setShowAchievementSelector(false);
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm font-merriweather"
                      >
                        <span className="mr-2">🏆</span>
                        {achievement.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-sm sm:text-base"
              disabled={isSubmitting || isProcessingMedia}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 magical-glow text-sm sm:text-base"
              disabled={!caption.trim() || isSubmitting || isProcessingMedia}
            >
              {isSubmitting ? 'Posting...' : 'Share Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;