import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Image, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

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
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

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

    const SocialButton = ({ icon, text, onPress }: { icon: any, text: string, onPress: () => void }) => (
        <TouchableOpacity
            className="flex-row items-center justify-center bg-card border border-border rounded-full p-3 mb-3 hover:bg-gray-100"
            onPress={onPress}
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
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="items-center mb-8">
                            <View className="w-12 h-12 bg-upvote rounded-full items-center justify-center mb-4">
                                <Text className="text-white font-bold text-2xl">r</Text>
                            </View>
                            <Text className="text-2xl font-bold text-text">Sign up for Redbit</Text>
                            <Text className="text-textSecondary text-sm mt-2 text-center">
                                By continuing, you agree to our User Agreement and Privacy Policy.
                            </Text>
                        </View>

                        {/* Social Login */}
                        <View className="mb-6">
                            <SocialButton
                                icon={<AntDesign name="google" size={20} color="black" />}
                                text="Continue with Google"
                                onPress={() => console.log('Google Signup')}
                            />
                            <SocialButton
                                icon={<AntDesign name="apple" size={20} color="black" />}
                                text="Continue with Apple"
                                onPress={() => console.log('Apple Signup')}
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
                                placeholder="Email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <TextInput
                                className="bg-card border border-border p-4 rounded-full mb-4 text-text focus:border-upvote outline-none"
                                placeholder="Username"
                                placeholderTextColor="#999"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />

                            <TextInput
                                className="bg-card border border-border p-4 rounded-full mb-4 text-text focus:border-upvote outline-none"
                                placeholder="Password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TextInput
                                className="bg-card border border-border p-4 rounded-full mb-6 text-text focus:border-upvote outline-none"
                                placeholder="Confirm Password"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                className={`bg-upvote p-4 rounded-full mb-4 ${loading ? 'opacity-50' : ''}`}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                <Text className="text-white text-center font-bold text-base">
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </Text>
                            </TouchableOpacity>

                            <View className="flex-row justify-center mt-2 mb-4">
                                <Text className="text-textSecondary">Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/auth/login' as any)}>
                                    <Text className="text-upvote font-bold">Log In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}
