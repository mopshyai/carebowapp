module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/constants': './constants',
          '@/components': './components',
          '@/data': './data',
          '@/store': './store',
          '@/types': './types',
          '@/hooks': './hooks',
          '@/theme': './theme',
          '@/utils': './utils',
          '@/lib': './lib',
          '@/features': './features',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
