import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Image, ScrollView, KeyboardAvoidingView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshToken
      user {
        id
        username
        email
      }
    }
  }
`;

const SOCIAL_AUTH_MUTATION = gql`
  mutation SocialAuth($provider: String!, $email: String!, $username: String) {
    socialAuth(provider: $provider, email: $email, username: $username) {
      success
      token
      refreshToken
      user {
        id
        username
        email
      }
      errors
    }
  }
`;

interface LoginData {
  tokenAuth: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

interface SocialAuthData {
  socialAuth: {
    success: boolean;
    token: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
    errors: string[];
  };
}

interface LoginVars {
  username: string;
  password: string;
}

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error }] = useMutation<LoginData, LoginVars>(LOGIN_MUTATION);


  const { login: authLogin } = useAuth();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const { data } = await login({
        variables: { username, password }
      });
      if (data?.tokenAuth?.token && data?.tokenAuth?.user) {
        await authLogin(data.tokenAuth.token, data.tokenAuth.user, data.tokenAuth.refreshToken);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Login Failed', e.message || 'An error occurred during login');
    }
  };

  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    try {
      // For web platform, redirect to OAuth URL
      if (Platform.OS === 'web') {
        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const oauthUrl = `${backendUrl}/accounts/${provider.toLowerCase()}/login/`;

        // Use full page redirect instead of popup
        window.location.href = oauthUrl;
      } else {
        // For native apps, use expo-web-browser
        const { WebBrowser } = await import('expo-web-browser');
        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const oauthUrl = `${backendUrl}/accounts/${provider.toLowerCase()}/login/`;

        const result = await WebBrowser.openAuthSessionAsync(oauthUrl, 'redbit://');

        if (result.type === 'success' && result.url) {
          // Extract token from callback URL
          const url = new URL(result.url);
          const token = url.searchParams.get('token');
          const refreshToken = url.searchParams.get('refresh_token');

          if (token) {
            const placeholderUser = { id: '0', username: 'loading...', email: '' };
            await authLogin(token, placeholderUser, refreshToken || undefined);
          }
        }
        setSocialLoading(null);
      }
    } catch (e: any) {
      console.error('OAuth error:', e);
      Alert.alert('Error', e.message || 'An unexpected error occurred during social login.');
      setSocialLoading(null);
    }
  };

  const SocialButton = ({ icon, text, provider, onPress }: { icon: any, text: string, provider: string, onPress: () => void }) => (
    <TouchableOpacity
      className={`flex-row items-center justify-center bg-card border border-border rounded-full p-3 mb-3 ${socialLoading === provider ? 'opacity-70' : 'hover:bg-gray-100'}`}
      onPress={onPress}
      disabled={!!socialLoading || loading}
    >
      {socialLoading === provider ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        icon
      )}
      <Text className="text-text font-bold ml-2">{socialLoading === provider ? 'Connecting...' : text}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <View className={`flex-1 justify-center items-center p-4 ${isDesktop ? 'bg-gray-100' : ''}`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className={`w-full ${isDesktop ? 'max-w-md bg-white p-8 rounded-xl shadow-sm border border-border' : ''}`}
        >
          <View className="items-center mb-8">
            <View className="w-12 h-12 bg-upvote rounded-full items-center justify-center mb-4">
              <Text className="text-white font-bold text-2xl">r</Text>
            </View>
            <Text className="text-2xl font-bold text-text">Log in to Redbit</Text>
            <Text className="text-textSecondary text-sm mt-2 text-center">
              By continuing, you agree to our User Agreement and Privacy Policy.
            </Text>
          </View>

          {/* Social Login */}
          <View className="mb-6">
            <SocialButton
              icon={<AntDesign name="google" size={20} color="black" />}
              text="Continue with Google"
              provider="Google"
              onPress={() => handleSocialLogin('Google')}
            />
            <SocialButton
              icon={<AntDesign name="apple" size={20} color="black" />}
              text="Continue with Apple"
              provider="Apple"
              onPress={() => handleSocialLogin('Apple')}
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-textSecondary text-xs uppercase font-bold">OR</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Form */}
          <View>
            <TextInput
              className="bg-card border border-border p-4 rounded-full mb-4 text-text focus:border-upvote outline-none"
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              className="bg-card border border-border p-4 rounded-full mb-6 text-text focus:border-upvote outline-none"
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && (
              <Text className="text-red-500 mb-4 text-center text-sm">
                {error.message}
              </Text>
            )}

            <TouchableOpacity
              className={`bg-upvote p-4 rounded-full mb-4 ${loading ? 'opacity-50' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white text-center font-bold text-base">
                {loading ? 'Logging in...' : 'Log In'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-2">
              <Text className="text-textSecondary">New to Redbit? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
                <Text className="text-upvote font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
