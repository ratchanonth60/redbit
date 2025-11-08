export default function CreatePostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [community, setCommunity] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [createPost, { loading }] = useMutation(CREATE_POST_MUTATION);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Upload to your image service (Cloudinary, S3, etc.)
      const imageUrl = await uploadImage(result.assets[0].uri);
      setImage(imageUrl);
    }
  };

  const handleSubmit = async () => {
    try {
      await createPost({
        variables: { title, content, communityName: community, imageUrl: image },
        refetchQueries: ['GetAllPosts'],
      });
      router.back();
    } catch (e) {
      // Handle error
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Community Selector */}
        <View className="mb-4">
          <Text className="text-text font-bold mb-2">Community</Text>
          <TouchableOpacity 
            className="bg-card p-4 rounded-lg flex-row justify-between items-center"
            onPress={() => setCommunityPickerVisible(true)}
          >
            <Text className="text-text">
              {community || 'Select a community'}
            </Text>
            <ChevronDown size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <TextInput
          className="bg-card p-4 rounded-lg mb-4 text-text text-lg font-semibold"
          placeholder="An interesting title"
          placeholderTextColor={Colors.light.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={300}
        />

        {/* Content */}
        <TextInput
          className="bg-card p-4 rounded-lg mb-4 text-text min-h-[200px]"
          placeholder="Text (optional)"
          placeholderTextColor={Colors.light.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Image Picker */}
        <TouchableOpacity
          className="bg-card p-4 rounded-lg mb-4 flex-row items-center"
          onPress={pickImage}
        >
          <Image size={24} color={Colors.light.text} />
          <Text className="text-text ml-3">Add image</Text>
        </TouchableOpacity>

        {image && (
          <View className="mb-4">
            <Image source={{ uri: image }} className="w-full h-64 rounded-lg" />
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-upvote p-4 rounded-full"
          onPress={handleSubmit}
          disabled={loading || !title || !community}
        >
          <Text className="text-white text-center font-bold">
            {loading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
