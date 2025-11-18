import React from 'react';
import { View, useWindowDimensions, Platform, Text, TouchableOpacity } from 'react-native';
import WebNavbar from './WebNavbar';
import { Slot, router } from 'expo-router';
import { Home, Compass, Users, Plus } from 'lucide-react-native';

interface ScreenLayoutProps {
    children?: React.ReactNode;
    hideSidebar?: boolean;
}

export default function ScreenLayout({ children, hideSidebar = false }: ScreenLayoutProps) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const isWeb = Platform.OS === 'web';

    if (isWeb && isDesktop && !hideSidebar) {
        return (
            <View className="flex-1 bg-background h-screen">
                <WebNavbar />
                <View className="flex-1 flex-row justify-center pt-4 px-4">
                    {/* Left Sidebar (Navigation) */}
                    <View className="w-64 hidden lg:flex pr-4">
                        <TouchableOpacity
                            className="bg-upvote p-3 rounded-full mb-4 flex-row items-center justify-center"
                            onPress={() => router.push('/post/create' as any)}
                        >
                            <Plus size={20} color="white" className="mr-2" />
                            <Text className="text-white font-bold">Create Post</Text>
                        </TouchableOpacity>

                        <View className="bg-card p-4 rounded-md border border-border">
                            <Text className="font-bold mb-2 text-xs uppercase text-muted-foreground">Feeds</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/index' as any)} className="py-2 flex-row items-center hover:bg-gray-100 rounded-md px-2">
                                <Home size={20} color="#333" className="mr-2" />
                                <Text className="text-text">Home</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/explore' as any)} className="py-2 flex-row items-center hover:bg-gray-100 rounded-md px-2">
                                <Compass size={20} color="#333" className="mr-2" />
                                <Text className="text-text">Popular</Text>
                            </TouchableOpacity>

                            <Text className="font-bold mt-4 mb-2 text-xs uppercase text-muted-foreground">Communities</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/communities' as any)} className="py-2 flex-row items-center hover:bg-gray-100 rounded-md px-2">
                                <Users size={20} color="#333" className="mr-2" />
                                <Text className="text-text">All Communities</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Center Content (Feed) */}
                    <View className="flex-1 max-w-2xl w-full">
                        {children || <Slot />}
                    </View>

                    {/* Right Sidebar (Widgets) */}
                    <View className="w-80 hidden xl:flex pl-4">
                        <View className="bg-card p-4 rounded-md border border-border mb-4">
                            <Text className="font-bold mb-2">About Redbit</Text>
                            <Text className="text-sm text-muted-foreground">
                                Redbit is a Reddit clone built with React Native (Expo) and Django.
                            </Text>
                        </View>
                        <View className="bg-card p-4 rounded-md border border-border">
                            <Text className="font-bold mb-2">Trending</Text>
                            <Text className="text-sm text-upvote">#coding</Text>
                            <Text className="text-sm text-upvote">#expo</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    // Mobile / Tablet View
    return (
        <View className="flex-1 bg-background">
            {children || <Slot />}
        </View>
    );
}
