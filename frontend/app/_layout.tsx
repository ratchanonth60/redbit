import "../global.css";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments, useRootNavigationState, usePathname } from "expo-router";
import { View, Platform, ActivityIndicator } from "react-native";
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



function RootLayoutNav() {
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

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
        // Wrap in setTimeout to avoid "Attempted to navigate before mounting the Root Layout component"
        setTimeout(() => {
          router.replace('/auth/login' as any);
        }, 0);
      } else if (token && (inAuthGroup || pathname === '/')) {
        // Token present and in auth group OR at root -> redirect to home
        setTimeout(() => {
          router.replace('/(tabs)/(home)' as any);
        }, 0);
      }

      await SplashScreen.hideAsync();
    };

    checkAuth();
  }, [segments, navigationState?.key, pathname]);

  const isAuthGroup = segments[0] === 'auth';

  if (!navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
  return (
    <ApolloProvider client={client}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </ApolloProvider>
  );
}
