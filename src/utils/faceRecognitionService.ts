/**
 * Browser-based face recognition service
 * Uses face-api.js for detection and matches against database.json embeddings
 */
import * as faceapi from 'face-api.js';

export interface FaceDatabase {
  [username: string]: {
    embedding: number[][];
    model: string;
    detector: string;
    created_at: string;
    samples: number;
  };
}

class FaceRecognitionService {
  private modelsLoaded = false;
  private faceDatabase: FaceDatabase | null = null;
  private faceApiEmbeddings: Map<string, Float32Array> = new Map();

  /**
   * Load face-api.js models
   */
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      // Try loading from CDN (more reliable)
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      this.modelsLoaded = true;
      console.log('Face recognition models loaded successfully');
    } catch (error) {
      console.error('Error loading face recognition models:', error);
      // Try alternative CDN
      try {
        const ALT_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(ALT_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(ALT_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(ALT_URL),
        ]);
        this.modelsLoaded = true;
        console.log('Face recognition models loaded from alternative CDN');
      } catch (altError) {
        console.error('Failed to load from alternative CDN:', altError);
        throw new Error('Failed to load face recognition models. Please check your internet connection.');
      }
    }
  }

  /**
   * Load face database from JSON file
   */
  async loadDatabase(): Promise<void> {
    if (this.faceDatabase) return;

    try {
      // Try multiple paths
      let response = await fetch('/face_database.json');
      if (!response.ok) {
        response = await fetch('/facial_reco/database.json');
      }
      if (!response.ok) {
        response = await fetch('/database.json');
      }
      
      if (!response.ok) {
        throw new Error('Failed to load face database');
      }
      
      this.faceDatabase = await response.json();
      console.log('Face database loaded:', Object.keys(this.faceDatabase || {}));
      
      // Auto-register faces from database on first load
      await this.autoRegisterFromDatabase();
    } catch (error) {
      console.error('Error loading face database:', error);
      this.faceDatabase = {};
    }
  }

  /**
   * Auto-register faces from database using face-api.js
   * This creates face-api.js embeddings for users in the database
   */
  private async autoRegisterFromDatabase(): Promise<void> {
    if (!this.faceDatabase) return;
    
    // Load any previously stored face-api.js embeddings
    this.loadStoredEmbeddings();
    
    // If we already have embeddings, don't re-register
    if (this.faceApiEmbeddings.size > 0) {
      console.log('Using existing face-api.js embeddings');
      return;
    }
    
    console.log('Database loaded. Face-api.js embeddings will be created on first recognition.');
  }

  /**
   * Initialize the service (load models and database)
   */
  async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.loadModels(),
        this.loadDatabase()
      ]);
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  /**
   * Get face embedding from an image using face-api.js
   */
  async getFaceEmbedding(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Float32Array | null> {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    try {
      const detection = await faceapi
        .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        return null;
      }

      return detection.descriptor;
    } catch (error) {
      console.error('Error getting face embedding:', error);
      return null;
    }
  }

  /**
   * Register a face embedding for a user
   */
  registerFace(username: string, embedding: Float32Array): void {
    this.faceApiEmbeddings.set(username, embedding);
    
    // Save to localStorage for persistence
    const stored = this.getStoredEmbeddings();
    stored[username] = Array.from(embedding);
    localStorage.setItem('face_api_embeddings', JSON.stringify(stored));
    console.log(`Registered face for ${username}`);
  }

  /**
   * Get stored face-api.js embeddings from localStorage
   */
  private getStoredEmbeddings(): Record<string, number[]> {
    try {
      const stored = localStorage.getItem('face_api_embeddings');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Load stored embeddings from localStorage
   */
  loadStoredEmbeddings(): void {
    const stored = this.getStoredEmbeddings();
    for (const [username, embedding] of Object.entries(stored)) {
      this.faceApiEmbeddings.set(username, new Float32Array(embedding));
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Find the best matching face from the database
   */
  /**
   * Find the best matching face from the database
   */
    /**
   * Find the best matching face from the database
   */
    async recognizeFace(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, threshold: number = 0.75): Promise<{ username: string | null; similarity: number }> {
        // Ensure models and database are loaded
        if (!this.modelsLoaded) {
          await this.loadModels();
        }
        if (!this.faceDatabase) {
          await this.loadDatabase();
        }
        
        // Load stored embeddings
        this.loadStoredEmbeddings();
    
        const queryEmbedding = await this.getFaceEmbedding(image);
        if (!queryEmbedding) {
          return { username: null, similarity: 0 };
        }
    
        // If no faces are registered, return no match
        if (this.faceApiEmbeddings.size === 0) {
          console.log('No faces registered in the system');
          return { username: null, similarity: 0 };
        }
    
        let bestMatch: { username: string; similarity: number } | null = null;
        const allSimilarities: Array<{ username: string; similarity: number }> = [];
    
        // Check against ALL stored face-api.js embeddings
        for (const [username, storedEmbedding] of this.faceApiEmbeddings.entries()) {
          const similarity = this.cosineSimilarity(queryEmbedding, storedEmbedding);
          allSimilarities.push({ username, similarity });
          
          // Track the best match
          if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = { username, similarity };
          }
        }
    
        // Log all similarities for debugging
        console.log('Face recognition similarities:', allSimilarities.map(s => `${s.username}: ${(s.similarity * 100).toFixed(2)}%`).join(', '));
    
        // Only return match if similarity is STRICTLY above threshold
        // This ensures we don't get false positives
        if (bestMatch && bestMatch.similarity > threshold) {
          console.log(`✅ Match found: ${bestMatch.username} with ${(bestMatch.similarity * 100).toFixed(2)}% similarity`);
          return bestMatch;
        }
    
        // No match found - similarity too low
        console.log(`❌ No match found. Best similarity: ${bestMatch ? (bestMatch.similarity * 100).toFixed(2) + '%' : '0%'} (threshold: ${(threshold * 100).toFixed(0)}%)`);
        return { username: null, similarity: bestMatch?.similarity || 0 };
      }
  /**
   * Auto-register a face for a database user
   */
  async autoRegisterFromVideo(video: HTMLVideoElement, username: string): Promise<boolean> {
    const embedding = await this.getFaceEmbedding(video);
    if (!embedding) {
      return false;
    }
    
    this.registerFace(username, embedding);
    console.log(`Auto-registered face for ${username}`);
    return true;
  }

  /**
   * Check if a user exists in the database
   */
  userExistsInDatabase(username: string): boolean {
    return this.faceDatabase !== null && username in this.faceDatabase;
  }

  /**
   * Get all users from the database
   */
  getDatabaseUsers(): string[] {
    return this.faceDatabase ? Object.keys(this.faceDatabase) : [];
  }
}

export const faceRecognitionService = new FaceRecognitionService();