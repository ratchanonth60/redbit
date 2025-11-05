import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';

/**
 * Hook ที่ใช้ดึงสีที่ถูกต้องสำหรับ Theme (Light/Dark)
 * ที่กำลังใช้งานอยู่
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // ใช้สีจากไฟล์ constants/colors.ts
    return Colors[theme][colorName];
  }
}
