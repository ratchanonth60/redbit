
import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.card,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.light.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Redbit",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="post/[id]"
        options={{
          title: "Post",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
