
import { Redirect } from 'expo-router';

export default function TabIndex() {
  // ไฟล์นี้ควรมีหน้าที่ Redirect ไปที่
  // หน้าจอหลัก (home) ของเราเท่านั้น
  return <Redirect href={'/(home)/'} />;
}
