import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList, // 1. เปลี่ยนจาก ScrollView.map เป็น FlatList
  RefreshControl, // 2. เพิ่ม RefreshControl
} from 'react-native';
import Colors from '@/constants/colors';
import { Post } from '@/types/post';

// 3. Import Hook และ Component ที่เราสร้าง
import { useHomeScreen } from '@/hooks/useHomeScreen';
import { MemoizedPostCard } from '@/components/PostCard';
import { Plus } from 'lucide-react-native';

export default function HomeScreen() {
  // 4. เรียก Logic ทั้งหมด
  const {
    posts,
    loading,
    error,
    refetch,
    voteLoading,
    handleVote,
    navigateToPost,
  } = useHomeScreen();

  // 5. จัดการ State (Loading, Error) - โดยใช้ NativeWind
  if (loading && posts.length === 0) {
    return (
      // styles.center
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={Colors.light.text} />
      </View>
    );
  }

  if (error) {
    return (
      // styles.center
      <View className="flex-1 justify-center items-center bg-background p-4">
        {/* styles.errorText */}
        <Text className="text-base text-textSecondary text-center mb-4">
          Error loading posts: {error.message}
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text className="text-upvote">Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 6. สร้าง Render Function สำหรับ FlatList (เพื่อ Performance)
  const renderItem = React.useCallback(
    ({ item }: { item: Post }) => (
      <MemoizedPostCard
        post={item}
        onVote={handleVote}
        onPress={() => navigateToPost(item.id)}
        // (ไม่ต้องส่ง formatNumber แล้ว)
      />
    ),
    [handleVote, navigateToPost] // (ใส่ voteLoading ถ้าคุณจะ disable ปุ่ม)
  );

  // 7. นี่คือ View ที่แปลงเป็น NativeWind
  // (ลบ StyleSheet.create ท้ายไฟล์ทิ้งได้เลย)
  return (
    // styles.container
    <View className="flex-1 bg-background">
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        // styles.scrollContent
        contentContainerClassName="py-2"
        showsVerticalScrollIndicator={false}
        // 3. เพิ่ม Pull-to-Refresh
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      />
      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-upvote w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/post/create')}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

