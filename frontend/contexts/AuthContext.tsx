import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Auto-login from stored token
    checkAuth();
  }, []);

  useEffect(() => {
    // Check for token in URL hash (from OAuth callback)
    const hash = window.location.hash.substring(1); // Remove the '#'
    const params = new URLSearchParams(hash);
    const tokenFromUrl = params.get('token');
    const refreshTokenFromUrl = params.get('refresh_token');

    if (tokenFromUrl) {
      (async () => {
        if (Platform.OS === 'web') {
          localStorage.setItem('token', tokenFromUrl);
          if (refreshTokenFromUrl) {
            localStorage.setItem('refreshToken', refreshTokenFromUrl);
          }
        } else {
          await SecureStore.setItemAsync('token', tokenFromUrl);
          if (refreshTokenFromUrl) {
            await SecureStore.setItemAsync('refreshToken', refreshTokenFromUrl);
          }
        }

        // Clean URL hash
        window.history.replaceState({}, document.title, window.location.pathname);

        // Re-check auth to fetch user data
        checkAuth();
      })();
    }

    // Check for OAuth errors in query params
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      console.error('OAuth error:', error, errorDescription);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // You could show an error toast/alert here
    }
  }, []);

  useEffect(() => {
    // Redirect logic
    const inAuthGroup = segments[0] === 'auth';

    if (!isLoading) {
      if (!user && !inAuthGroup) {
        router.replace('/auth/login');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, isLoading]);



  const checkAuth = async () => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      if (token) {
        // Fetch user data using the token
        try {
          // We need to get the client instance, but we're outside a component
          // So we'll use a simple fetch instead
          const response = await fetch('http://localhost:8000/graphql/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `JWT ${token}`,
            },
            body: JSON.stringify({
              query: `
                query Me {
                  me {
                    id
                    username
                    email
                  }
                }
              `
            })
          });

          const result = await response.json();

          if (result.data?.me) {
            setUser(result.data.me);
          } else {
            // Token is invalid, clear it
            if (Platform.OS === 'web') {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
            } else {
              await SecureStore.deleteItemAsync('token');
              await SecureStore.deleteItemAsync('refreshToken');
            }
          }
        } catch (error) {
          // Token might be invalid, clear it
          if (Platform.OS === 'web') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          } else {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('refreshToken');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userData: User, refreshToken?: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    } else {
      await SecureStore.setItemAsync('token', token);
      if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
    }
    setUser(userData);
  };

  const logout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } else {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('refreshToken');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
