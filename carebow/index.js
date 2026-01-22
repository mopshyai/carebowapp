/**
 * @format
 */

// IMPORTANT: This must be at the very top for Android gesture handling to work
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
