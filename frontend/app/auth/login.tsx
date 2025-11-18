import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

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

interface LoginVars {
  username: string;
  password: string;
}

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error }] = useMutation<LoginData, LoginVars>(LOGIN_MUTATION);

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
        // Store token
        if (Platform.OS === 'web') {
          localStorage.setItem('token', data.tokenAuth.token);
          if (data.tokenAuth.refreshToken) {
            localStorage.setItem('refreshToken', data.tokenAuth.refreshToken);
          }
        } else {
          await SecureStore.setItemAsync('token', data.tokenAuth.token);
          if (data.tokenAuth.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', data.tokenAuth.refreshToken);
          }
        }
        router.replace('/(tabs)' as any);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Login Failed', e.message || 'An error occurred during login');
    }
  };

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <Text className="text-3xl font-bold text-text mb-8">
        Welcome to Redbit
      </Text>

      <TextInput
        className="bg-card p-4 rounded-lg mb-4 text-text"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        className="bg-card p-4 rounded-lg mb-6 text-text"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-upvote p-4 rounded-full"
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 mt-4 text-center">
          {error.message}
        </Text>
      )}

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.push('/auth/register' as any)}
      >
        <Text className="text-upvote text-center">
          Don&apos;t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
