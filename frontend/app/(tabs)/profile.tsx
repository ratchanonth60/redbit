import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Settings, Award, MessageSquare, FileText, Bookmark } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerStyle: {
            backgroundColor: Colors.light.card,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <Text style={styles.username}>u/yourname</Text>
          <Text style={styles.userStats}>Member since 2024</Text>
        </View>

        <View style={styles.karmaCard}>
          <View style={styles.karmaItem}>
            <Award size={24} color={Colors.light.upvote} />
            <Text style={styles.karmaValue}>15,234</Text>
            <Text style={styles.karmaLabel}>Post Karma</Text>
          </View>
          <View style={styles.karmaDivider} />
          <View style={styles.karmaItem}>
            <MessageSquare size={24} color={Colors.light.upvote} />
            <Text style={styles.karmaValue}>8,421</Text>
            <Text style={styles.karmaLabel}>Comment Karma</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <FileText size={22} color={Colors.light.text} />
            <Text style={styles.menuText}>My Posts</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <MessageSquare size={22} color={Colors.light.text} />
            <Text style={styles.menuText}>My Comments</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <Bookmark size={22} color={Colors.light.text} />
            <Text style={styles.menuText}>Saved Posts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About Redbit</Text>
          <Text style={styles.aboutText}>
            Redbit is your community-driven platform for sharing content and engaging in
            discussions. Discover communities, share your thoughts, and connect with people who
            share your interests.
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  profileHeader: {
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.upvote,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  userStats: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  karmaCard: {
    backgroundColor: Colors.light.card,
    marginTop: 8,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  karmaItem: {
    alignItems: 'center',
    flex: 1,
  },
  karmaDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
  },
  karmaValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 8,
    marginBottom: 4,
  },
  karmaLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  menuSection: {
    backgroundColor: Colors.light.card,
    marginTop: 8,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 50,
  },
  aboutSection: {
    backgroundColor: Colors.light.card,
    marginTop: 8,
    padding: 16,
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  version: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
