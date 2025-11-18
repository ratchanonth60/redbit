import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Search, Bell, Plus, User, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function WebNavbar() {
    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        } else {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('refreshToken');
        }
        router.replace('/auth/login' as any);
    };

    return (
        <View className="flex-row items-center justify-between px-4 py-2 bg-card border-b border-border h-14">
            {/* Left: Logo */}
            <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/index' as any)} className="flex-row items-center">
                <View className="w-8 h-8 bg-upvote rounded-full items-center justify-center mr-2">
                    <Text className="text-white font-bold text-lg">r</Text>
                </View>
                <Text className="text-2xl font-bold text-text hidden md:flex">redbit</Text>
            </TouchableOpacity>

            {/* Center: Search */}
            <View className="flex-1 max-w-2xl mx-4">
                <View className="flex-row items-center bg-background rounded-full px-4 py-2 border border-border">
                    <Search size={20} color="#666" />
                    <TextInput
                        placeholder="Search Redbit"
                        placeholderTextColor="#666"
                        className="flex-1 ml-2 text-text outline-none"
                        onSubmitEditing={(e) => router.push(`/search?q=${e.nativeEvent.text}` as any)}
                    />
                </View>
            </View>

            {/* Right: Actions & User */}
            <View className="flex-row items-center space-x-4">
                <TouchableOpacity className="p-2 hover:bg-gray-100 rounded-full">
                    <Plus size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 hover:bg-gray-100 rounded-full">
                    <Bell size={24} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center border border-border rounded-md p-1 hover:bg-gray-100 ml-2"
                    onPress={handleLogout}
                >
                    <View className="w-6 h-6 bg-gray-300 rounded-md items-center justify-center mr-2">
                        <User size={16} color="#666" />
                    </View>
                    <View className="hidden md:flex">
                        <Text className="text-xs font-bold text-text">User</Text>
                        <Text className="text-[10px] text-muted-foreground">1 karma</Text>
                    </View>
                    <LogOut size={16} color="#666" className="ml-2" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
