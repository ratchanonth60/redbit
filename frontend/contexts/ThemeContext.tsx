export function ThemeProvider({ children }) {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// app/(tabs)/profile.tsx - เพิ่ม toggle
<TouchableOpacity 
  className="flex-row items-center justify-between p-4"
  onPress={toggleColorScheme}
>
  <Text className="text-text">Dark Mode</Text>
  <Switch value={colorScheme === 'dark'} />
</TouchableOpacity>
