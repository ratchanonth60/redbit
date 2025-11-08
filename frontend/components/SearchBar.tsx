import { Search, X } from 'lucide-react-native';

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSearch = useDebouncedCallback((text: string) => {
    onSearch(text);
  }, 500);

  return (
    <View className="bg-card mx-4 my-2 rounded-full px-4 py-2 flex-row items-center">
      <Search size={20} color={Colors.light.textSecondary} />
      <TextInput
        className="flex-1 ml-3 text-text"
        placeholder="Search posts, communities..."
        placeholderTextColor={Colors.light.textSecondary}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          handleSearch(text);
        }}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery('')}>
          <X size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
