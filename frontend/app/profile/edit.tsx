import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Camera } from 'lucide-react-native';
export default function EditProfileScreen() {
  const { user } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.profilePicture);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION);

  const handleSave = async () => {
    await updateProfile({
      variables: { bio, profilePicture: avatar },
      refetchQueries: ['GetMe'],
    });
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center py-6">
        <TouchableOpacity onPress={pickAvatar}>
          <Image
            source={{ uri: avatar }}
            className="w-24 h-24 rounded-full"
          />
          <View className="absolute bottom-0 right-0 bg-upvote p-2 rounded-full">
            <Camera size={16} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View className="p-4">
        <Text className="text-text font-bold mb-2">Bio</Text>
        <TextInput
          className="bg-card p-4 rounded-lg text-text min-h-[120px]"
          placeholder="Tell us about yourself..."
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={500}
        />
        <Text className="text-textSecondary text-right mt-1">
          {bio.length}/500
        </Text>
      </View>

      <TouchableOpacity
        className="bg-upvote mx-4 p-4 rounded-full"
        onPress={handleSave}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">
          {loading ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
