import { historyService } from "./history-service";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLogin: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  voiceEnabled: boolean;
  autoBackup: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

class AuthService {
  private currentUser: User | null = null;
  private readonly USERS_KEY = 'aira-users';
  private readonly SESSION_KEY = 'aira-session';
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.loadSession();
  }

  // Simple hash function for demo purposes
  // In production, use a proper hashing library like bcrypt
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'aira-salt-2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  }

  private getUsers(): Record<string, { user: User; password: string }> {
    const usersData = localStorage.getItem(this.USERS_KEY);
    return usersData ? JSON.parse(usersData) : {};
  }

  private saveUsers(users: Record<string, { user: User; password: string }>): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private loadSession(): void {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const users = this.getUsers();
        if (users[session.userId]) {
          this.currentUser = users[session.userId].user;
        }
      } catch (error) {
        console.error('Error loading session:', error);
        this.clearSession();
      }
    }
  }

  private saveSession(userId: string): void {
    const session = {
      userId,
      timestamp: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  private clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUser = null;
  }

  private isSessionValid(): boolean {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (!sessionData) return false;

    try {
      const session = JSON.parse(sessionData);
      return session.expiresAt > Date.now();
    } catch {
      return false;
    }
  }

  async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = this.getUsers();
      
      // Check if user already exists
      if (users[data.email]) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Validate input
      if (!data.email || !data.password || !data.name) {
        return { success: false, message: 'All fields are required' };
      }

      if (data.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long' };
      }

      if (!data.email.includes('@')) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create user
      const user: User = {
        id: crypto.randomUUID(),
        email: data.email.toLowerCase(),
        name: data.name,
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: {
          theme: 'system',
          notifications: true,
          voiceEnabled: true,
          autoBackup: true
        }
      };

      // Save user
      users[data.email.toLowerCase()] = { user, password: hashedPassword };
      this.saveUsers(users);

      // Set current user and session
      this.currentUser = user;
      this.saveSession(user.id);

      return { success: true, message: 'Registration successful!', user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = this.getUsers();
      const userData = users[credentials.email.toLowerCase()];

      if (!userData) {
        return { success: false, message: 'Invalid email or password' };
      }

      const isValidPassword = await this.verifyPassword(credentials.password, userData.password);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Update last login
      userData.user.lastLogin = new Date();
      users[credentials.email.toLowerCase()] = userData;
      this.saveUsers(users);

      // Set current user and session
      this.currentUser = userData.user;
      this.saveSession(userData.user.id);

      return { success: true, message: 'Login successful!', user: userData.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  logout(): void {
    this.clearSession();
    // Clear user-specific data
    historyService.clearUserData();
  }

  getCurrentUser(): User | null {
    if (!this.isSessionValid()) {
      this.clearSession();
      return null;
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.isSessionValid() && this.currentUser !== null;
  }

  updateUserPreferences(preferences: Partial<UserPreferences>): boolean {
    if (!this.currentUser) return false;

    try {
      const users = this.getUsers();
      const userData = users[this.currentUser.email];
      
      if (userData) {
        userData.user.preferences = { ...userData.user.preferences, ...preferences };
        this.currentUser = userData.user;
        users[this.currentUser.email] = userData;
        this.saveUsers(users);
        return true;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
    
    return false;
  }

  updateProfile(name: string): boolean {
    if (!this.currentUser) return false;

    try {
      const users = this.getUsers();
      const userData = users[this.currentUser.email];
      
      if (userData) {
        userData.user.name = name;
        this.currentUser = userData.user;
        users[this.currentUser.email] = userData;
        this.saveUsers(users);
        return true;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    
    return false;
  }

  changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return new Promise(async (resolve) => {
      if (!this.currentUser) {
        resolve({ success: false, message: 'No user logged in' });
        return;
      }

      try {
        const users = this.getUsers();
        const userData = users[this.currentUser.email];

        if (!userData) {
          resolve({ success: false, message: 'User not found' });
          return;
        }

        // Verify current password
        const isValidPassword = await this.verifyPassword(currentPassword, userData.password);
        if (!isValidPassword) {
          resolve({ success: false, message: 'Current password is incorrect' });
          return;
        }

        // Validate new password
        if (newPassword.length < 6) {
          resolve({ success: false, message: 'New password must be at least 6 characters long' });
          return;
        }

        // Hash new password
        const hashedNewPassword = await this.hashPassword(newPassword);
        userData.password = hashedNewPassword;
        users[this.currentUser.email] = userData;
        this.saveUsers(users);

        resolve({ success: true, message: 'Password changed successfully' });
      } catch (error) {
        console.error('Error changing password:', error);
        resolve({ success: false, message: 'Failed to change password' });
      }
    });
  }

  deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    return new Promise(async (resolve) => {
      if (!this.currentUser) {
        resolve({ success: false, message: 'No user logged in' });
        return;
      }

      try {
        const users = this.getUsers();
        const userData = users[this.currentUser.email];

        if (!userData) {
          resolve({ success: false, message: 'User not found' });
          return;
        }

        // Verify password
        const isValidPassword = await this.verifyPassword(password, userData.password);
        if (!isValidPassword) {
          resolve({ success: false, message: 'Password is incorrect' });
          return;
        }

        // Delete user data
        delete users[this.currentUser.email];
        this.saveUsers(users);

        // Clear session and user data
        this.logout();

        resolve({ success: true, message: 'Account deleted successfully' });
      } catch (error) {
        console.error('Error deleting account:', error);
        resolve({ success: false, message: 'Failed to delete account' });
      }
    });
  }

  // Get user-specific data key
  getUserDataKey(key: string): string {
    const userId = this.currentUser?.id || 'anonymous';
    return `${key}-${userId}`;
  }

  // Save user-specific data
  saveUserData(key: string, data: any): void {
    const userKey = this.getUserDataKey(key);
    localStorage.setItem(userKey, JSON.stringify(data));
  }

  // Load user-specific data
  loadUserData(key: string): any {
    const userKey = this.getUserDataKey(key);
    const data = localStorage.getItem(userKey);
    return data ? JSON.parse(data) : null;
  }

  // Clear user-specific data
  clearUserData(key: string): void {
    const userKey = this.getUserDataKey(key);
    localStorage.removeItem(userKey);
  }
}

export const authService = new AuthService(); 