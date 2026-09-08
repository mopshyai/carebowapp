import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const buildGradlePath = join(
  process.cwd(),
  'node_modules',
  'react-native-splash-screen',
  'android',
  'build.gradle'
);

const legacy = "getDefaultProguardFile('proguard-android.txt')";
const supported = "getDefaultProguardFile('proguard-android-optimize.txt')";

let source;
try {
  source = readFileSync(buildGradlePath, 'utf8');
} catch (error) {
  throw new Error(
    `react-native-splash-screen compatibility patch could not read ${buildGradlePath}: ${error instanceof Error ? error.message : String(error)}`
  );
}

if (source.includes(legacy)) {
  writeFileSync(buildGradlePath, source.replaceAll(legacy, supported));
  console.log('Patched react-native-splash-screen for AGP 9 ProGuard defaults.');
} else if (!source.includes(supported)) {
  throw new Error(
    'react-native-splash-screen build.gradle no longer matches the reviewed AGP 9 compatibility patch; review the dependency before continuing.'
  );
}
