/**
 * Service to map recognized faces to user accounts
 */
import { User } from '../types';
import { AuthService } from './authService';

export interface FaceAccountMapping {
  faceUsername: string; // Username from facial recognition database
  accountEmail: string;
  accountName: string;
  accountPassword: string;
}

const FACE_ACCOUNT_MAPPINGS: FaceAccountMapping[] = [
  {
    faceUsername: 'akhilven',
    accountEmail: 'akhilven@gmail.com',
    accountName: 'akhil',
    accountPassword: 'akhil@1969'
  },
  {
    faceUsername: 'mvnshpra',
    accountEmail: 'mvnshpra@gmail.com',
    accountName: 'Sai Himanshu Praneeth',
    accountPassword: 'himanshu@1969'
  }
];

const STORAGE_KEY = 'mythic_face_account_mappings';

/**
 * Initialize face-to-account mappings and create accounts if they don't exist
 */
export function initializeFaceAccounts(): void {
  // Load existing mappings
  const existingMappings = loadMappings();
  
  // Get all users
  const users = AuthService.getAllUsers();
  
  // Process each mapping
  FACE_ACCOUNT_MAPPINGS.forEach(mapping => {
    // Check if account already exists
    let user = users.find(u => u.email.toLowerCase() === mapping.accountEmail.toLowerCase());
    
    if (!user) {
      // Create new user account
      user = {
        id: crypto.randomUUID(),
        name: mapping.accountName,
        email: mapping.accountEmail,
        password: mapping.accountPassword,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mapping.faceUsername}`,
        joinDate: new Date(),
        questsCompleted: 0,
        dailyWalkingDistance: 0,
        totalWalkingDistance: 0,
        lastWalkingDate: new Date().toISOString().split('T')[0],
        mythicCoins: 50,
        inventory: [],
        posts: [],
        following: [],
        followers: [],
        authMethod: 'face',
        isAdmin: false,
        isActive: true,
        lastLoginDate: new Date(),
        createdAt: new Date(),
        chronicles: []
      };
      
      users.push(user);
      AuthService.saveUsers(users);
      console.log(`Created account for ${mapping.accountName} (${mapping.accountEmail})`);
    }
    
    // Save mapping if it doesn't exist
    const mappingExists = existingMappings.some(
      m => m.faceUsername === mapping.faceUsername
    );
    
    if (!mappingExists) {
      existingMappings.push(mapping);
    }
  });
  
  // Save mappings
  saveMappings(existingMappings);
}

/**
 * Get account information for a recognized face
 */
export function getAccountForFace(faceUsername: string): User | null {
  const mappings = loadMappings();
  const mapping = mappings.find(m => m.faceUsername === faceUsername);
  
  if (!mapping) {
    console.warn(`No account mapping found for face: ${faceUsername}`);
    return null;
  }
  
  // Find user by email
  const users = AuthService.getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === mapping.accountEmail.toLowerCase());
  
  if (!user) {
    console.warn(`Account not found for email: ${mapping.accountEmail}`);
    return null;
  }
  
  return user;
}

/**
 * Load face-to-account mappings from localStorage
 */
function loadMappings(): FaceAccountMapping[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load face account mappings:', error);
  }
  
  return [];
}

/**
 * Save face-to-account mappings to localStorage
 */
function saveMappings(mappings: FaceAccountMapping[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Failed to save face account mappings:', error);
  }
}

// Initialize on module load
initializeFaceAccounts();

