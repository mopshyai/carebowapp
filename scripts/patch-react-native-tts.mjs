import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const buildGradlePath = join(
  process.cwd(),
  'node_modules',
  'react-native-tts',
  'android',
  'build.gradle'
);

const legacyBuildscript = `buildscript {
    repositories {
        jcenter()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:1.3.1'
    }
}

`;

let source;
try {
  source = readFileSync(buildGradlePath, 'utf8');
} catch (error) {
  throw new Error(
    `react-native-tts compatibility patch could not read ${buildGradlePath}: ${error instanceof Error ? error.message : String(error)}`
  );
}

if (source.includes(legacyBuildscript)) {
  writeFileSync(buildGradlePath, source.replace(legacyBuildscript, ''));
  console.log('Patched react-native-tts to use the root AGP 9 toolchain.');
} else if (source.includes('jcenter()') || source.includes("com.android.tools.build:gradle:1.3.1")) {
  throw new Error(
    'react-native-tts build.gradle has an unreviewed legacy buildscript shape; review the dependency before continuing.'
  );
}
