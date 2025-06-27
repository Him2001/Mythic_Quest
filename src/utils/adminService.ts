import { AdminStats, AdminUser, User, SocialPost } from '../types';
import { AuthService } from './authService';
import { SocialService } from './socialService';

export class AdminService {
  static getAdminStats(): AdminStats {
    const users = AuthService.getAllUsers();
    const posts = SocialService.getAllPosts();
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeUsers = users.filter(user => 
      user.isActive && new Date(user.lastLoginDate) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const newUsersThisWeek = users.filter(user => 
      new Date(user.createdAt) > oneWeekAgo
    );
    
    const totalQuestsCompleted = users.reduce((total, user) => total + user.questsCompleted, 0);
    const totalXPEarned = users.reduce((total, user) => total + user.xp, 0);
    const totalCoinsEarned = users.reduce((total, user) => total + user.mythicCoins, 0);
    const averageLevel = users.length > 0 ? users.reduce((total, user) => total + user.level, 0) / users.length : 0;

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalQuestsCompleted,
      totalXPEarned,
      totalCoinsEarned,
      totalPosts: posts.length,
      newUsersThisWeek: newUsersThisWeek.length,
      averageLevel: Math.round(averageLevel * 10) / 10
    };
  }

  static getAdminUsers(page: number = 1, limit: number = 10, search: string = ''): {
    users: AdminUser[];
    total: number;
    totalPages: number;
  } {
    const allUsers = AuthService.getAllUsers();
    
    // Filter by search query
    let filteredUsers = allUsers;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Convert to AdminUser format (excluding sensitive data)
    const adminUsers: AdminUser[] = filteredUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      mythicCoins: user.mythicCoins,
      questsCompleted: user.questsCompleted,
      postsCount: user.posts.length,
      joinDate: user.joinDate,
      lastLoginDate: user.lastLoginDate,
      isActive: user.isActive,
      authMethod: user.authMethod
    }));

    // Sort by join date (newest first)
    adminUsers.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = adminUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      total: adminUsers.length,
      totalPages: Math.ceil(adminUsers.length / limit)
    };
  }

  static getUserProfile(userId: string): User | null {
    return AuthService.getUserById(userId);
  }

  static deactivateUser(userId: string): boolean {
    return AuthService.deactivateUser(userId);
  }

  static activateUser(userId: string): boolean {
    return AuthService.activateUser(userId);
  }

  static flagPost(postId: string): boolean {
    // In a real app, this would mark the post as flagged for review
    console.log(`Post ${postId} has been flagged for review`);
    return true;
  }

  static getUserPosts(userId: string): SocialPost[] {
    return SocialService.getUserPosts(userId);
  }

  static getRecentActivity(): {
    newUsers: User[];
    recentPosts: SocialPost[];
    activeUsers: User[];
  } {
    const users = AuthService.getAllUsers();
    const posts = SocialService.getAllPosts();
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newUsers = users
      .filter(user => new Date(user.createdAt) > oneWeekAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentPosts = posts
      .filter(post => new Date(post.createdAt) > oneWeekAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const activeUsers = users
      .filter(user => user.isActive && new Date(user.lastLoginDate) > oneDayAgo)
      .sort((a, b) => new Date(b.lastLoginDate).getTime() - new Date(a.lastLoginDate).getTime())
      .slice(0, 10);

    return {
      newUsers,
      recentPosts,
      activeUsers
    };
  }

  static exportUserData(): string {
    const users = AuthService.getAllUsers();
    const adminUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      mythicCoins: user.mythicCoins,
      questsCompleted: user.questsCompleted,
      joinDate: user.joinDate,
      lastLoginDate: user.lastLoginDate,
      isActive: user.isActive,
      authMethod: user.authMethod
    }));

    return JSON.stringify(adminUsers, null, 2);
  }
}