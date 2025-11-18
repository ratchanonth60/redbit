import { ScrollView, TouchableOpacity, Text } from 'react-native';

interface FilterChipsProps {
  active: string;
  onSelect: (filter: string) => void;
}
const filters = ['Hot', 'New', 'Top', 'Rising'];

export function FilterChips({ active, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          className={`px-4 py-2 rounded-full mr-2 ${active === filter ? 'bg-upvote' : 'bg-card'
            }`}
          onPress={() => onSelect(filter)}
        >
          <Text className={`font-semibold ${active === filter ? 'text-white' : 'text-text'
            }`}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
