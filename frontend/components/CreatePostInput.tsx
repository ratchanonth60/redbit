import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Image as ImageIcon, Link } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function CreatePostInput() {
    return (
        <View className="bg-card p-3 mb-4 border-b border-border flex-row items-center">
            {/* User Avatar Placeholder */}
            <View className="w-10 h-10 bg-gray-300 rounded-full mr-3 items-center justify-center">
                <Text className="text-text font-bold">U</Text>
            </View>

            {/* Input Trigger */}
            <TouchableOpacity
                className="flex-1 bg-background border border-border rounded-md px-4 py-2 mr-3"
                onPress={() => router.push('/post/create' as any)}
            >
                <Text className="text-muted-foreground">Create Post</Text>
            </TouchableOpacity>

            {/* Media Icons */}
            <TouchableOpacity
                className="p-2 hover:bg-gray-100 rounded-md"
                onPress={() => router.push('/post/create' as any)}
            >
                <ImageIcon size={24} color={Colors.light.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
                className="p-2 hover:bg-gray-100 rounded-md"
                onPress={() => router.push('/post/create' as any)}
            >
                <Link size={24} color={Colors.light.textSecondary} />
            </TouchableOpacity>
        </View>
    );
}
