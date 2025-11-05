import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

/**
 * นี่คือ hook ที่รวม "system" theme (จาก react-native)
 * และ theme ที่ผู้ใช้เลือก (จาก nativewind)
 */
export function useColorScheme() {
  const deviceColorScheme = useDeviceColorScheme();
  const {
    colorScheme: nativewindColorScheme,
    setColorScheme,
    toggleColorScheme,
  } = useNativewindColorScheme();

  const colorScheme =
    nativewindColorScheme === 'system' ? deviceColorScheme : nativewindColorScheme;

  return {
    colorScheme: colorScheme ?? 'light',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
  };
}
