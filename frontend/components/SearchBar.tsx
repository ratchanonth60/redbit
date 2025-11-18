import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useState } from 'react';
import Colors from '@/constants/colors';

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <View className="bg-card mx-4 my-2 rounded-full px-4 py-2 flex-row items-center">
      <Search size={20} color={Colors.light.textSecondary} />
      <TextInput
        className="flex-1 ml-3 text-text"
        placeholder="Search posts, communities..."
        placeholderTextColor={Colors.light.textSecondary}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => onSearch(query)}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery('')}>
          <X size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
