import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Camera } from 'lucide-react-native';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    me {
      id
      username
      bio
      profilePicture
      notificationsEnabled
      darkMode
    }
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($bio: String, $profilePicture: String) {
    updateProfile(bio: $bio, profilePicture: $profilePicture) {
      success
      errors
      user {
        id
        bio
        profilePicture
      }
    }
  }
`;

const UPDATE_SETTINGS_MUTATION = gql`
  mutation UpdateSettings($notificationsEnabled: Boolean, $darkMode: Boolean) {
    updateSettings(notificationsEnabled: $notificationsEnabled, darkMode: $darkMode) {
      success
      user {
        id
        notificationsEnabled
        darkMode
      }
    }
  }
`;

interface GetMyProfileData {
  me: {
    id: string;
    username: string;
    bio: string;
    profilePicture: string;
    notificationsEnabled: boolean;
    darkMode: boolean;
  };
}

interface UpdateProfileData {
  updateProfile: {
    success: boolean;
    errors: string[] | null;
    user: {
      id: string;
      bio: string;
      profilePicture: string;
    };
  };
}

interface UpdateSettingsData {
  updateSettings: {
    success: boolean;
    user: {
      id: string;
      notificationsEnabled: boolean;
      darkMode: boolean;
    };
  };
}

export default function EditProfileScreen() {
  const { data, loading: loadingProfile } = useQuery<GetMyProfileData>(GET_MY_PROFILE);
  const [updateProfile, { loading: updatingProfile }] = useMutation<UpdateProfileData>(UPDATE_PROFILE_MUTATION);
  const [updateSettings, { loading: updatingSettings }] = useMutation<UpdateSettingsData>(UPDATE_SETTINGS_MUTATION);

  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (data?.me) {
      setBio(data.me.bio || '');
      setProfilePicture(data.me.profilePicture || '');
      setNotificationsEnabled(data.me.notificationsEnabled ?? true);
      setDarkMode(data.me.darkMode ?? false);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      // Update Profile
      const profileResult = await updateProfile({
        variables: { bio, profilePicture },
      });

      if (!profileResult.data?.updateProfile?.success) {
        Alert.alert('Error', profileResult.data?.updateProfile?.errors?.join('\n') || 'Failed to update profile.');
        return;
      }

      // Update Settings
      const settingsResult = await updateSettings({
        variables: { notificationsEnabled, darkMode },
      });

      if (!settingsResult.data?.updateSettings?.success) {
        Alert.alert('Error', 'Failed to update settings.');
        return;
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An unexpected error occurred.');
    }
  };

  if (loadingProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#D93A00" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <ScrollView className="flex-1">
        <View className="items-center py-6 bg-card mb-4">
          <View className="relative">
            <Image
              source={{ uri: profilePicture || 'https://ui-avatars.com/api/?name=' + (data?.me?.username || 'User') }}
              className="w-24 h-24 rounded-full bg-gray-200"
            />
            <View className="absolute bottom-0 right-0 bg-upvote p-2 rounded-full border-2 border-white">
              <Camera size={16} color="white" />
            </View>
          </View>
          <Text className="text-text font-bold text-xl mt-4">{data?.me?.username}</Text>
        </View>

        <View className="p-4 space-y-4">
          <View>
            <Text className="text-gray-500 mb-1 font-medium">Profile Picture URL</Text>
            <TextInput
              className="bg-white p-3 rounded-lg border border-gray-200 text-text"
              placeholder="https://example.com/avatar.png"
              value={profilePicture}
              onChangeText={setProfilePicture}
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-500 mb-1 font-medium">Bio</Text>
            <TextInput
              className="bg-white p-3 rounded-lg border border-gray-200 text-text min-h-[100px]"
              placeholder="Tell us about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text className="text-gray-400 text-xs text-right mt-1">
              {bio.length}/500
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-lg font-bold text-text mb-2">Settings</Text>

            <View className="flex-row justify-between items-center bg-white p-4 rounded-lg border border-gray-200 mb-2">
              <Text className="text-text font-medium">Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#D93A00' }}
              />
            </View>

            <View className="flex-row justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
              <Text className="text-text font-medium">Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: '#D93A00' }}
              />
            </View>
          </View>
        </View>

        <View className="p-4 pb-8">
          <TouchableOpacity
            className={`p-4 rounded-full items-center ${updatingProfile || updatingSettings ? 'bg-gray-400' : 'bg-upvote'}`}
            onPress={handleSave}
            disabled={updatingProfile || updatingSettings}
          >
            {updatingProfile || updatingSettings ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
