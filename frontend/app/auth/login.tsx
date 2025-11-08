import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

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

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async () => {
    try {
      const { data } = await login({ 
        variables: { username, password } 
      });
      // เก็บ token ใน SecureStore
      await SecureStore.setItemAsync('token', data.tokenAuth.token);
      await SecureStore.setItemAsync('refreshToken', data.tokenAuth.refreshToken);
      router.replace('/(tabs)');
    } catch (e) {
      // Handle error
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
        onPress={() => router.push('/auth/register')}
      >
        <Text className="text-upvote text-center">
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
