/**
 * Mock for @env module (react-native-dotenv)
 * Used in Jest tests
 */

module.exports = {
  APP_ENV: 'test',
  APP_NAME: 'CareBow',
  API_BASE_URL: 'https://www.carebow.com/api',
  API_TIMEOUT: '30000',
  ANALYTICS_KEY: '',
  SENTRY_DSN: '',
  FEATURE_HEALTH_MEMORY: 'true',
  FEATURE_IMAGE_UPLOAD: 'true',
  FEATURE_VOICE_INPUT: 'true',
};
