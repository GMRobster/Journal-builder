import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#0f1117',
          surface: '#181c27',
          panel: '#1e2333',
          border: '#2d3352',
          text: '#c8cfe0',
          muted: '#6b7594',
          accent: '#7c6af0',
          gold: '#d4a853',
          danger: '#e05252',
        },
      },
    },
  },
  plugins: [],
};

export default config;
