export class MediaUtils {
  static readonly MAX_IMAGE_SIZE = 1200; // Max width/height in pixels
  static readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB in bytes
  static readonly IMAGE_QUALITY = 0.8; // 80% quality for JPEG compression

  static async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            this.MAX_IMAGE_SIZE
          );
          
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
            this.IMAGE_QUALITY
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async validateVideo(file: File): Promise<File> {
    if (file.size > this.MAX_VIDEO_SIZE) {
      throw new Error(`Video file is too large. Maximum size is ${this.formatFileSize(this.MAX_VIDEO_SIZE)}.`);
    }
    
    // Additional video validation could be added here
    return file;
  }

  static calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxSize: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
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
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  static isValidVideoType(file: File): boolean {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    return validTypes.includes(file.type);
  }

  static async convertFileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  static createThumbnail(file: File, maxSize: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isValidImageType(file)) {
        reject(new Error('Invalid image type for thumbnail'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      img.onload = () => {
        const { width, height } = this.calculateDimensions(
          img.width, 
          img.height, 
          maxSize
        );
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailUrl = URL.createObjectURL(blob);
              resolve(thumbnailUrl);
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          },
          'image/jpeg',
          0.7
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }
}