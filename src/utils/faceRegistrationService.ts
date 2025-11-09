/**
 * Service to help register faces using face-api.js
 */
import { faceRecognitionService } from './faceRecognitionService';

/**
 * Initialize face registrations from the database
 */
export async function initializeFaceRegistrations(): Promise<void> {
  try {
    // Initialize the face recognition service
    await faceRecognitionService.initialize();
    
    // Load stored embeddings (face-api.js format)
    faceRecognitionService.loadStoredEmbeddings();
    
    // Check which users from database have face-api.js embeddings
    const dbUsers = faceRecognitionService.getDatabaseUsers();
    const storedCount = localStorage.getItem('face_api_embeddings') 
      ? Object.keys(JSON.parse(localStorage.getItem('face_api_embeddings') || '{}')).length 
      : 0;
    
    console.log(`Database has ${dbUsers.length} users:`, dbUsers);
    console.log(`Stored face-api.js embeddings: ${storedCount}`);
  } catch (error) {
    console.error('Failed to initialize face registrations:', error);
    throw error;
  }
}

/**
 * Register a face for a user
 */
export async function registerUserFace(username: string, image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<boolean> {
  await faceRecognitionService.initialize();
  
  const embedding = await faceRecognitionService.getFaceEmbedding(image);
  if (!embedding) {
    return false;
  }
  
  faceRecognitionService.registerFace(username, embedding);
  return true;
}