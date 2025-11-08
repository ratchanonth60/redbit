export function EmptyState({ 
  icon: Icon, 
  title, 
  description,
  action 
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Icon size={64} color={Colors.light.textSecondary} />
      <Text className="text-text text-xl font-bold mt-4">
        {title}
      </Text>
      <Text className="text-textSecondary text-center mt-2">
        {description}
      </Text>
      {action && (
        <TouchableOpacity 
          className="bg-upvote px-6 py-3 rounded-full mt-6"
          onPress={action.onPress}
        >
          <Text className="text-white font-bold">{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
