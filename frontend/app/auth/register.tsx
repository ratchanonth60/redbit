import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { router } from 'expo-router';

const REGISTER_MUTATION = gql`
  mutation RegisterUser($username: String!, $email: String!, $password: String!) {
    registerUser(username: $username, email: $email, password: $password) {
      success
      errors
      user {
        id
        username
      }
    }
  }
`;

interface RegisterData {
    registerUser: {
        success: boolean;
        errors: string[] | null;
        user: {
            id: string;
            username: string;
        } | null;
    };
}

interface RegisterVars {
    username: string;
    email: string;
    password: string;
}

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [register, { loading }] = useMutation<RegisterData, RegisterVars>(REGISTER_MUTATION);

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const { data } = await register({
                variables: { username, email, password }
            });

            if (data?.registerUser?.success) {
                Alert.alert('Success', 'Account created successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else if (data?.registerUser?.errors) {
                Alert.alert('Registration Failed', data.registerUser.errors.join('\n'));
            }
        } catch (e: any) {
            console.error(e);
            Alert.alert('Error', e.message || 'An error occurred during registration');
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
            className="bg-background"
        >
            <Text className="text-3xl font-bold text-text mb-8 text-center">
                Create Account
            </Text>

            <TextInput
                className="bg-gray-100 p-4 rounded-lg mb-4 text-black"
                placeholder="Username"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <TextInput
                className="bg-gray-100 p-4 rounded-lg mb-4 text-black"
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                className="bg-gray-100 p-4 rounded-lg mb-4 text-black"
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                className="bg-gray-100 p-4 rounded-lg mb-6 text-black"
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity
                className="bg-red-500 p-4 rounded-full"
                onPress={handleRegister}
                disabled={loading}
            >
                <Text className="text-white text-center font-bold text-lg">
                    {loading ? 'Creating Account...' : 'Register'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-6"
                onPress={() => router.back()}
            >
                <Text className="text-red-500 text-center font-semibold">
                    Already have an account? Login
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
