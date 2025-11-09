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
    accountName: 'Akhil',
    accountPassword: 'akhil@1969'
  },
  {
    faceUsername: 'mvnshpra',
    accountEmail: 'mvnshpra@buffalo.edu',
    accountName: 'M V N S H Praneeth',
    accountPassword: 'Praneeth@1969'
  }
];

const STORAGE_KEY = 'mythic_face_account_mappings';

/**
 * Initialize face-to-account mappings and create accounts if they don't exist
 */
export function initializeFaceAccounts(): void {
  console.log('🔧 Initializing face accounts...');
  
  // Load existing mappings
  const existingMappings = loadMappings();
  console.log('📋 Existing mappings loaded:', existingMappings.length);
  
  // Get all users
  const users = AuthService.getAllUsers();
  console.log('👥 Total users before initialization:', users.length);
  
  // Process each mapping
  FACE_ACCOUNT_MAPPINGS.forEach(mapping => {
    console.log(`\n🔍 Processing mapping for: ${mapping.faceUsername}`);
    console.log(`   Email: ${mapping.accountEmail}`);
    console.log(`   Name: ${mapping.accountName}`);
    
    // Check if account already exists
    let user = users.find(u => u.email.toLowerCase() === mapping.accountEmail.toLowerCase());
    
    if (!user) {
      console.log(`   ➕ Creating new user account...`);
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
      console.log(`   ✅ Created account for ${mapping.accountName} (${mapping.accountEmail})`);
    } else {
      console.log(`   ✅ Account already exists for ${mapping.accountEmail}`);
    }
    
    // Save mapping if it doesn't exist
    const mappingExists = existingMappings.some(
      m => m.faceUsername.toLowerCase() === mapping.faceUsername.toLowerCase()
    );
    
    if (!mappingExists) {
      existingMappings.push(mapping);
      console.log(`   ➕ Added face mapping: ${mapping.faceUsername} -> ${mapping.accountEmail}`);
    } else {
      console.log(`   ✅ Face mapping already exists: ${mapping.faceUsername}`);
    }
  });
  
  // Save mappings
  saveMappings(existingMappings);
  console.log(`\n✅ Face account initialization complete!`);
  console.log(`📊 Total mappings: ${existingMappings.length}`);
  console.log(`👥 Total users: ${users.length}`);
}

/**
 * Get account information for a recognized face
 */
export function getAccountForFace(faceUsername: string): User | null {
  console.log('====================================');
  console.log('🔍 getAccountForFace called with:', faceUsername);
  console.log('====================================');
  
  // Normalize the username (lowercase, trim whitespace)
  const normalizedFaceUsername = faceUsername.toLowerCase().trim();
  console.log('📝 Normalized username:', normalizedFaceUsername);
  
  // Load mappings
  const mappings = loadMappings();
  console.log('📋 Available mappings:', mappings);
  console.log('📊 Number of mappings:', mappings.length);
  
  // Try to find mapping (case-insensitive)
  const mapping = mappings.find(m => m.faceUsername.toLowerCase().trim() === normalizedFaceUsername);
  
  if (!mapping) {
    console.error('❌ No account mapping found for face:', normalizedFaceUsername);
    console.error('Available face usernames:', mappings.map(m => m.faceUsername));
    
    // Also check the hardcoded mappings
    const hardcodedMapping = FACE_ACCOUNT_MAPPINGS.find(m => m.faceUsername.toLowerCase().trim() === normalizedFaceUsername);
    if (hardcodedMapping) {
      console.warn('⚠️ Found in hardcoded mappings, using that:', hardcodedMapping);
      // Use hardcoded mapping
      const users = AuthService.getAllUsers();
      console.log('👥 Total users in system:', users.length);
      console.log('📧 Looking for email:', hardcodedMapping.accountEmail);
      
      const user = users.find(u => u.email.toLowerCase() === hardcodedMapping.accountEmail.toLowerCase());
      
      if (!user) {
        console.error('❌ Account not found for email:', hardcodedMapping.accountEmail);
        console.log('Available emails:', users.map(u => u.email));
        
        // Force create the account if it doesn't exist
        console.log('🔨 Force creating account...');
        initializeFaceAccounts();
        
        // Try again
        const updatedUsers = AuthService.getAllUsers();
        const newUser = updatedUsers.find(u => u.email.toLowerCase() === hardcodedMapping.accountEmail.toLowerCase());
        
        if (newUser) {
          console.log('✅ Successfully created and found user:', newUser.email);
          return newUser;
        } else {
          console.error('❌ Failed to create user');
          return null;
        }
      }
      
      console.log('✅ Found user:', user.email, user.name);
      return user;
    }
    
    return null;
  }
  
  console.log('✅ Found mapping:', mapping);
  
  // Find user by email
  const users = AuthService.getAllUsers();
  console.log('👥 Total users in system:', users.length);
  console.log('📧 Looking for email:', mapping.accountEmail);
  
  const user = users.find(u => u.email.toLowerCase() === mapping.accountEmail.toLowerCase());
  
  if (!user) {
    console.error('❌ Account not found for email:', mapping.accountEmail);
    console.log('Available emails:', users.map(u => u.email));
    return null;
  }
  
  console.log('✅ Found user:', user.email, user.name);
  console.log('====================================');
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

