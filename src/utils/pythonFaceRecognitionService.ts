/**
 * Service to call Python facial recognition API
 * Uses base URL from Vite env var with localhost fallback
 */

// Use environment variable for API base URL with localhost fallback
const API_BASE_URL =
  (import.meta as any).env?.VITE_FACE_RECOGNITION_API_URL || "http://localhost:5000";

export interface RecognitionResult {
  success: boolean;
  username?: string;
  similarity?: number;
  message?: string;
}

class PythonFaceRecognitionService {
  private apiUrl: string;

  constructor(apiUrl: string = API_BASE_URL) {
    this.apiUrl = apiUrl;
  }

  /**
   * Check if the API server is running
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('API health check failed:', error);
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
      // Check if API is available
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        return {
          success: false,
          message: 'Facial recognition API is not available. Please make sure the Python server is running on http://localhost:5000'
        };
      }

      // Convert video frame to base64
      const base64Image = this.videoFrameToBase64(video);

      // Call the Python API
      const response = await fetch(`${this.apiUrl}/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          threshold: threshold
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data: RecognitionResult = await response.json();
      return data;
    } catch (error) {
      console.error('Recognition error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to recognize face'
      };
    }
  }
}

export const pythonFaceRecognitionService = new PythonFaceRecognitionService();