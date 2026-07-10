import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        signal: '#2563eb',
        verified: '#059669',
        warning: '#d97706',
      },
      boxShadow: {
        soft: '0 20px 80px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;

