import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const ACCESS_TOKEN_KEY = 'business_nexus_access';
const REFRESH_TOKEN_KEY = 'business_nexus_refresh';
const RESET_TOKEN_KEY = 'business_nexus_reset_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // ======================
  // LOGIN
  // ======================
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();

      localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);

      // Fetch logged-in user profile
      const profileRes = await fetch(`${API_BASE_URL}/api/users/profile/`, {
        headers: {
          Authorization: `Bearer ${data.access}`
        }
      });

      const profile = await profileRes.json();

      const loggedInUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatarUrl: profile.avatar || '',
        bio: profile.bio || '',
        isOnline: true,
        createdAt: profile.created_at
      };

      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));

      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // REGISTER
  // ======================
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Registration failed');
      }

      toast.success('Account created successfully!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // LOGOUT
  // ======================
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    toast.success('Logged out successfully');
  };

  // ======================
  // FORGOT PASSWORD (Mock – Presentation OK)
  // ======================
  const forgotPassword = async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem(RESET_TOKEN_KEY, 'mock-reset-token');
    toast.success('Password reset instructions sent to your email');
  };

  // ======================
  // RESET PASSWORD (Mock)
  // ======================
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const storedToken = localStorage.getItem(RESET_TOKEN_KEY);
    if (token !== storedToken) {
      throw new Error('Invalid reset token');
    }
    localStorage.removeItem(RESET_TOKEN_KEY);
    toast.success('Password reset successfully');
  };

  // ======================
  // UPDATE PROFILE
  // ======================
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);

      const response = await fetch(`${API_BASE_URL}/api/users/profile/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = { ...user!, ...updates };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
