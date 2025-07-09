"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  phone?: string;
  created_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthError {
  error: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthError | undefined>;
  signUp: (email: string, password: string, full_name?: string) => Promise<AuthError | undefined>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<AuthError | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await api.get('/users/profile');

          if (response.status === 200) {
            setUser(response.data.user);
            setSession({
              access_token: token,
              refresh_token: localStorage.getItem('refresh_token') || '',
              expires_at: Date.now() + 3600000 // 1 hour
            });
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
          }
        } catch (error) {
          console.error('Session check error:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/users/login', { email, password });

      const data = response.data;

      if (response.status === 200) {
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem('auth_token', data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem('refresh_token', data.session.refresh_token);
        }
        
        // Redirect based on user role
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/search');
        }
        
        return undefined;
      } else {
        return { error: data.error || 'Login failed' };
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, full_name?: string) => {
    setLoading(true);
    try {
      const response = await api.post('/users/register', { email, password, full_name });

      const data = response.data;

      if (response.status === 201) {
        // After successful registration, automatically sign in the user
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem('auth_token', data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem('refresh_token', data.session.refresh_token);
        }
        
        // Redirect to search page after successful registration
        router.push('/search');
        
        return undefined;
      } else {
        return { error: data.error || 'Registration failed' };
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');

      // Clear state
      setUser(null);
      setSession(null);
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { error: 'No authentication token' };
      }

      const response = await api.put('/users/profile', data);

      const responseData = response.data;

      if (response.status === 200) {
        setUser(responseData.user);
        return undefined;
      } else {
        return { error: responseData.error || 'Profile update failed' };
      }
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 