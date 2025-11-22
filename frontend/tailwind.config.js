// 1. Import ไฟล์สีของคุณ
// (ไฟล์ config ที่เป็น .js จะใช้ 'require' ในการดึงไฟล์ .ts)
const appColors = require("./constants/colors");

// 2. จัดการกับ 'export default' จากไฟล์ .ts
// บางครั้ง 'require' จะได้ { default: ... } บางครั้งก็ได้ object ตรงๆ
const Colors = appColors.default || appColors;

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 3. ส่วนสำคัญสำหรับ NativeWind:
  // ระบุตำแหน่งไฟล์ที่ Tailwind จะไปสแกนหา className
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],

  // 4. ตั้งค่า Theme (ธีม)
  theme: {
    extend: {
      // 5. ตั้งค่าสี (Colors)
      // เราจะดึงค่าสีจาก Colors.light มาสร้างเป็น className
      colors: {
        // --- ส่วนที่จำเป็นจาก StyleSheet ของคุณ ---
        background: Colors.light.background,
        card: Colors.light.card,
        border: Colors.light.border,
        text: Colors.light.text,
        textSecondary: Colors.light.textSecondary,

        // --- ส่วนที่จำเป็นจาก (tabs)/_layout.tsx ---
        upvote: Colors.light.upvote,

        // (คุณสามารถเพิ่มสีอื่นๆ จาก Colors.light ได้ที่นี่)
        // เช่น:
        // downvote: Colors.light.downvote,
        // icon: Colors.light.icon,
        // tint: Colors.light.tint,
      },
    },
  },

  // 6. Plugins (ส่วนเสริม)
  plugins: [],
};
