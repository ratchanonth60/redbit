import "../global.css";
import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from '@apollo/client/link/context';
import * as SecureStore from 'expo-secure-store';
import ScreenLayout from "@/components/ScreenLayout";

SplashScreen.preventAutoHideAsync();

const authLink = setContext(async (_, { headers }) => {
  let token;
  if (Platform.OS === 'web') {
    token = localStorage.getItem('token');
  } else {
    token = await SecureStore.getItemAsync('token');
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : '',
    }
  };
});

import Constants from "expo-constants";

const getBaseUrl = () => {
  if (Platform.OS === 'web') return "http://localhost:8000/graphql/";
  if (Platform.OS === 'android') return "http://10.0.2.2:8000/graphql/";
  // For iOS simulator, localhost works. For physical device, you need your machine's IP.
  return "http://localhost:8000/graphql/";
};

const client = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: getBaseUrl() })),
  cache: new InMemoryCache(),
});

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-text text-xl font-bold mb-4">
        Oops! Something went wrong
      </Text>
      <TouchableOpacity
        className="bg-upvote px-6 py-3 rounded-full"
        onPress={resetErrorBoundary}
      >
        <Text className="text-white font-bold">Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

function RootLayoutNav() {
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      const inAuthGroup = segments[0] === 'auth';

      if (!token && !inAuthGroup) {
        // No token and not in auth group -> redirect to login
        // Use replace to avoid going back
        router.replace('/auth/login' as any);
      } else if (token && inAuthGroup) {
        // Token present and in auth group -> redirect to home
        router.replace('/(tabs)' as any);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [segments]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#D93A00" />
      </View>
    );
  }

  const isAuthGroup = segments[0] === 'auth';

  return (
    <ScreenLayout hideSidebar={isAuthGroup}>
      <Stack screenOptions={{ headerBackTitle: "Back", headerShown: !isAuthGroup }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="post/[id]" options={{ headerShown: true, title: 'Post' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      </Stack>
    </ScreenLayout>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ApolloProvider client={client}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </ApolloProvider>
  );
}
