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
import { AuthProvider } from "../contexts/AuthContext";
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

const getWsUrl = () => {
  if (Platform.OS === 'web') return "ws://localhost:8000/graphql/";
  if (Platform.OS === 'android') return "ws://10.0.2.2:8000/graphql/";
  return "ws://localhost:8000/graphql/";
};

// Create HTTP link for queries and mutations
const httpLink = authLink.concat(new HttpLink({ uri: getBaseUrl() }));

// Create WebSocket link for subscriptions (web only for now)
let link = httpLink;
if (Platform.OS === 'web') {
  const { GraphQLWsLink } = require('@apollo/client/link/subscriptions');
  const { createClient } = require('graphql-ws');
  const { split } = require('@apollo/client');
  const { getMainDefinition } = require('@apollo/client/utilities');

  const wsClient = createClient({
    url: getWsUrl(),
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        authorization: token ? `JWT ${token}` : '',
      };
    },
  });

  const wsLink = new GraphQLWsLink(wsClient);

  // Split based on operation type
  link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );
}

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});




function RootLayoutNav() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    // Just hide splash screen, let AuthContext handle redirects
    SplashScreen.hideAsync();
  }, [navigationState?.key]);

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
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthProvider>
    </ApolloProvider>
  );
}
