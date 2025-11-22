import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Image, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

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
  const [socialAuth, { loading: socialLoading }] = useMutation<SocialAuthData>(SOCIAL_AUTH_MUTATION);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const saveTokenAndRedirect = async (token: string, refreshToken?: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } else {
      await SecureStore.setItemAsync('token', token);
      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }
    }
    router.replace('/(tabs)' as any);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const { data } = await login({
        variables: { username, password }
      });
      if (data?.tokenAuth?.token) {
        await saveTokenAndRedirect(data.tokenAuth.token, data.tokenAuth.refreshToken);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Login Failed', e.message || 'An error occurred during login');
    }
  };

  const handleSocialLogin = async (provider: string) => {
    // Simulate getting email from provider
    const mockEmail = `user_${provider.toLowerCase()}_${Math.floor(Math.random() * 1000)}@example.com`;

    try {
      const { data } = await socialAuth({
        variables: {
          provider,
          email: mockEmail,
        }
      });

      if (data?.socialAuth?.success && data.socialAuth.token) {
        await saveTokenAndRedirect(data.socialAuth.token, data.socialAuth.refreshToken);
      } else {
        Alert.alert('Error', data?.socialAuth?.errors?.join('\n') || 'Social login failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An unexpected error occurred.');
    }
  };

  const SocialButton = ({ icon, text, onPress }: { icon: any, text: string, onPress: () => void }) => (
    <TouchableOpacity
      className="flex-row items-center justify-center bg-card border border-border rounded-full p-3 mb-3 hover:bg-gray-100"
      onPress={onPress}
      disabled={socialLoading || loading}
    >
      {icon}
      <Text className="text-text font-bold ml-2">{text}</Text>
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
              onPress={() => handleSocialLogin('Google')}
            />
            <SocialButton
              icon={<AntDesign name="apple" size={20} color="black" />}
              text="Continue with Apple"
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
