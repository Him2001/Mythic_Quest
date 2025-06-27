import { User, LoginCredentials, SignUpCredentials } from '../types';

export class AuthService {
  private static readonly STORAGE_KEY = 'mythic_users';
  private static readonly CURRENT_USER_KEY = 'mythic_current_user';

  // Initialize with admin account
  static initializeStorage() {
    const users = this.getAllUsers();
    
    // Check if admin account already exists
    const adminExists = users.some(user => user.email === 'admin@123');
    
    if (!adminExists) {
      // Create admin account
      const adminUser: User = {
        id: 'admin-001',
        name: 'Administrator',
        email: 'admin@123',
        password: 'admin@123',
        level: 99,
        xp: 999999,
        xpToNextLevel: 999999,
        avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        joinDate: new Date('2024-01-01'),
        questsCompleted: 999,
        dailyWalkingDistance: 0,
        totalWalkingDistance: 0,
        lastWalkingDate: new Date().toISOString().split('T')[0],
        mythicCoins: 999999,
        inventory: [],
        posts: [],
        following: [],
        followers: [],
        bio: 'System Administrator - Master of the Mythic Realm',
        authMethod: 'email',
        isAdmin: true,
        isActive: true,
        lastLoginDate: new Date(),
        createdAt: new Date('2024-01-01'),
        chronicles: []
      };
      
      users.push(adminUser);
      this.saveUsers(users);
    }
  }

  static getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const users = data ? JSON.parse(data) : [];
      
      // Ensure admin account exists
      if (users.length === 0) {
        this.initializeStorage();
        return this.getAllUsers();
      }
      
      return users;
    } catch (error) {
      console.error('Failed to load users:', error);
      return [];
    }
  }

  static saveUsers(users: User[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }

  static signUp(credentials: SignUpCredentials): { success: boolean; message: string; user?: User } {
    const { name, email, password, confirmPassword } = credentials;

    // Validation
    if (!name.trim()) {
      return { success: false, message: 'Name is required' };
    }

    if (!email.trim()) {
      return { success: false, message: 'Email is required' };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    if (!password) {
      return { success: false, message: 'Password is required' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    // Check if user already exists
    const users = this.getAllUsers();
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      avatarUrl: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=150`,
      joinDate: new Date(),
      questsCompleted: 0,
      dailyWalkingDistance: 0,
      totalWalkingDistance: 0,
      lastWalkingDate: new Date().toISOString().split('T')[0],
      mythicCoins: 50, // Starting coins
      inventory: [],
      posts: [],
      following: [],
      followers: [],
      authMethod: 'email',
      isAdmin: false,
      isActive: true,
      lastLoginDate: new Date(),
      createdAt: new Date(),
      chronicles: []
    };

    // Save user
    users.push(newUser);
    this.saveUsers(users);

    // Auto sign in the new user
    this.setCurrentUser(newUser);

    return { 
      success: true, 
      message: 'Account created successfully!', 
      user: newUser 
    };
  }

  static signIn(credentials: LoginCredentials): { success: boolean; message: string; user?: User } {
    const { email, password } = credentials;

    // Validation
    if (!email.trim()) {
      return { success: false, message: 'Email is required' };
    }

    if (!password) {
      return { success: false, message: 'Password is required' };
    }

    // Find user
    const users = this.getAllUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase().trim() && 
      u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Account has been deactivated' };
    }

    // Update last login
    user.lastLoginDate = new Date();
    this.updateUser(user);

    // Set as current user
    this.setCurrentUser(user);

    return { 
      success: true, 
      message: 'Signed in successfully!', 
      user 
    };
  }

  static signOut() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(this.CURRENT_USER_KEY);
      if (!data) return null;
      
      const userData = JSON.parse(data);
      
      // Verify user still exists and is active
      const users = this.getAllUsers();
      const currentUser = users.find(u => u.id === userData.id);
      
      if (!currentUser || !currentUser.isActive) {
        this.signOut();
        return null;
      }
      
      return currentUser;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  static setCurrentUser(user: User) {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to set current user:', error);
    }
  }

  static updateUser(updatedUser: User) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      this.saveUsers(users);
      
      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === updatedUser.id) {
        this.setCurrentUser(updatedUser);
      }
    }
  }

  static getUserById(userId: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  static deactivateUser(userId: string): boolean {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user || user.isAdmin) return false; // Can't deactivate admin
    
    user.isActive = false;
    this.saveUsers(users);
    return true;
  }

  static activateUser(userId: string): boolean {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return false;
    
    user.isActive = true;
    this.saveUsers(users);
    return true;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Initialize storage when the service is first loaded
  static {
    this.initializeStorage();
  }
}