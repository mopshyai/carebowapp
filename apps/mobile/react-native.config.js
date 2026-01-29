const path = require('path');

const root = path.resolve(__dirname, '../../');

module.exports = {
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {
      sourceDir: './android',
    },
  },
  reactNativePath: path.resolve(root, 'node_modules/react-native'),
  assets: [path.resolve(root, 'node_modules/react-native-vector-icons/Fonts')],
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null, // disable auto-linking for iOS, we'll handle it manually
      },
      root: path.resolve(root, 'node_modules/react-native-vector-icons'),
    },
  },
};
