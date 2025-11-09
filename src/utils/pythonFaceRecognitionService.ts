/**
 * Service to call Python facial recognition API
 * Uses base URL from Vite env var with localhost fallback
 */

// Use environment variable for API base URL with production fallback
const API_BASE_URL =
  (import.meta as any).env?.VITE_FACE_RECOGNITION_API_URL || 
  "https://facial-reco-backend.onrender.com";

console.log('🔧 Face Recognition API URL:', API_BASE_URL);

export interface RecognitionResult {
  success: boolean;
  username?: string;
  similarity?: number;
  message?: string;
  error?: string;
}

class PythonFaceRecognitionService {
  private apiUrl: string;
  private healthCheckCache: { healthy: boolean; timestamp: number } | null = null;
  private readonly HEALTH_CHECK_CACHE_MS = 30000; // 30 seconds

  constructor(apiUrl: string = API_BASE_URL) {
    this.apiUrl = apiUrl;
    console.log('🎯 Initialized PythonFaceRecognitionService with URL:', this.apiUrl);
  }

  /**
   * Check if the API server is running with caching
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Use cached result if available and fresh
      const now = Date.now();
      if (this.healthCheckCache && (now - this.healthCheckCache.timestamp) < this.HEALTH_CHECK_CACHE_MS) {
        return this.healthCheckCache.healthy;
      }

      console.log('🏥 Checking API health at:', `${this.apiUrl}/health`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ Health check failed with status:', response.status);
        this.healthCheckCache = { healthy: false, timestamp: now };
        return false;
      }

      const data = await response.json();
      const isHealthy = data.status === 'ok';
      
      console.log(isHealthy ? '✅ API is healthy' : '❌ API returned unhealthy status');
      this.healthCheckCache = { healthy: isHealthy, timestamp: now };
      
      return isHealthy;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      this.healthCheckCache = { healthy: false, timestamp: Date.now() };
      return false;
    }
  }

  /**
   * Convert video frame to base64 image
   */
  private videoFrameToBase64(video: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  /**
   * Recognize face from video frame using Python API
   */
  async recognizeFace(
    video: HTMLVideoElement,
    threshold: number = 0.45
  ): Promise<RecognitionResult> {
    try {
      console.log('🔍 Starting face recognition...');
      
      // Check if API is available
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        console.error('❌ API health check failed');
        return {
          success: false,
          message: `Facial recognition API is not available at ${this.apiUrl}. Please check if the server is running.`,
          error: 'API_UNAVAILABLE'
        };
      }

      // Convert video frame to base64
      console.log('📸 Converting video frame to base64...');
      const base64Image = this.videoFrameToBase64(video);

      // Call the Python API with CORS configuration and timeout
      console.log('📡 Sending recognition request to:', `${this.apiUrl}/recognize`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${this.apiUrl}/recognize`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          threshold: threshold
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ API request failed with status:', response.status, response.statusText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: RecognitionResult = await response.json();
      console.log('🔍 API Response:', data);
      console.log('📊 Similarity:', data.similarity);
      console.log('✅ Success:', data.success);
      console.log('👤 Username:', data.username);
      return data;
    } catch (error) {
      console.error('❌ Recognition error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'Request timed out. The server took too long to respond.',
            error: 'TIMEOUT'
          };
        }
        return {
          success: false,
          message: error.message,
          error: 'NETWORK_ERROR'
        };
      }
      
      return {
        success: false,
        message: 'Failed to recognize face. Please try again.',
        error: 'UNKNOWN_ERROR'
      };
    }
  }
}

export const pythonFaceRecognitionService = new PythonFaceRecognitionService();