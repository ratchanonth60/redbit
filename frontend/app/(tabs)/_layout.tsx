import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { Platform, useWindowDimensions } from "react-native";
import { Home, Compass, User, Users, Search, Bell } from "lucide-react-native";
import { Ionicons } from '@expo/vector-icons';
import Colors from "@/constants/colors";
import { HapticTab } from "@/components/haptic-tab";
import NotificationBadge from '@/components/NotificationBadge';
import { useNotificationSubscription } from '@/hooks/useNotificationSubscription';

// ...

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Subscribe to real-time notifications (web only for now)
  if (Platform.OS === 'web') {
    useNotificationSubscription();
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.upvote,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.card,
          borderTopColor: Colors.light.border,
          display: isDesktop ? 'none' : 'flex',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          tabBarButton: HapticTab,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          tabBarButton: HapticTab,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
          tabBarButton: HapticTab,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          tabBarButton: HapticTab,
        }}
      />
    </Tabs>
  );
}
