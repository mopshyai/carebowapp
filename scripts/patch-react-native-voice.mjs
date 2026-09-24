import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const buildGradlePath = join(
  process.cwd(),
  'node_modules',
  '@react-native-voice',
  'voice',
  'android',
  'build.gradle'
);

let source;
try {
  source = readFileSync(buildGradlePath, 'utf8');
} catch (error) {
  throw new Error(
    `@react-native-voice/voice compatibility patch could not read ${buildGradlePath}: ${error instanceof Error ? error.message : String(error)}`
  );
}

const legacyMarkers = [
  "jcenter()",
  "com.android.tools.build:gradle:3.3.2",
  "com.android.support:appcompat-v7",
  "compileSdkVersion rootProject.hasProperty('compileSdkVersion')",
];

if (legacyMarkers.every(marker => source.includes(marker))) {
  writeFileSync(
    buildGradlePath,
    `apply plugin: 'com.android.library'

android {
    namespace 'com.wenkesj.voice'
    compileSdk rootProject.ext.compileSdkVersion

    defaultConfig {
        minSdk rootProject.ext.minSdkVersion
        targetSdk rootProject.ext.targetSdkVersion
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation 'com.facebook.react:react-android'
}
`
  );
  console.log('Patched @react-native-voice/voice for the RN 0.87 Android toolchain.');
} else if (legacyMarkers.some(marker => source.includes(marker))) {
  throw new Error(
    '@react-native-voice/voice build.gradle only partially matches the reviewed compatibility patch; review the dependency before continuing.'
  );
}
