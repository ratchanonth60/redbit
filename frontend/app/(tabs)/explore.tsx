import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Users, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';

interface Community {
  name: string;
  members: string;
  description: string;
}

const trendingCommunities: Community[] = [
  { name: 'r/programming', members: '5.2M', description: 'Computer programming' },
  { name: 'r/react', members: '428K', description: 'React.js discussions' },
  { name: 'r/webdev', members: '1.8M', description: 'Web development' },
  { name: 'r/typescript', members: '156K', description: 'TypeScript community' },
  { name: 'r/javascript', members: '2.4M', description: 'JavaScript discussions' },
  { name: 'r/design', members: '892K', description: 'Design and creativity' },
  { name: 'r/devops', members: '324K', description: 'DevOps practices' },
  { name: 'r/startups', members: '1.2M', description: 'Startup culture' },
];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Explore',
          headerStyle: {
            backgroundColor: Colors.light.card,
          },
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.light.upvote} />
            <Text style={styles.sectionTitle}>Trending Communities</Text>
          </View>

          {trendingCommunities.map((community, index) => (
            <TouchableOpacity key={community.name} style={styles.communityCard}>
              <View style={styles.communityRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.communityInfo}>
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityDescription}>{community.description}</Text>
                <View style={styles.memberInfo}>
                  <Users size={14} color={Colors.light.textSecondary} />
                  <Text style={styles.memberCount}>{community.members} members</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
  section: {
    backgroundColor: Colors.light.card,
    marginTop: 8,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  communityRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  communityDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  joinButton: {
    backgroundColor: Colors.light.upvote,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

