import { View } from 'react-native';

export function PostSkeleton() {
  return (
    <View className="bg-card p-4 mb-2 animate-pulse">
      <View className="h-4 w-3/5 bg-gray-200 rounded mb-2" />
      <View className="h-16 w-full bg-gray-200 rounded mb-2" />
      <View className="h-3 w-2/5 bg-gray-200 rounded" />
    </View>
  );
}
