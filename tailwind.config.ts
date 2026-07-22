// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class', // ✅ shu qator uchun aynan shu fayl kerak edi
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config