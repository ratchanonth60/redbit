
import React, { useEffect } from "react";
// import * as Sentry from 'sentry-expo';
//
// Sentry.init({
//   dsn: 'your-sentry-dsn',
//   enableInExpoDevelopment: true,
//   debug: __DEV__,
// });
//
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from '@apollo/client/link/context';
import * as SecureStore from 'expo-secure-store';

import { ErrorBoundary } from 'react-error-boundary';

SplashScreen.preventAutoHideAsync();

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : '',
    }
  };
});

const client = new ApolloClient({
  link: new HttpLink({ uri: "http://localhost:8000/graphql/" }),
  cache: new InMemoryCache(),
});

function ErrorFallback({ error, resetErrorBoundary }) {
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
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="post/[id]" options={{ headerShown: true }} />
    </Stack>
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

