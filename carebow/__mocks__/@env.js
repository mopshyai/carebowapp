/**
 * Mock for @env module (react-native-dotenv)
 * Used in Jest tests
 */

module.exports = {
  APP_ENV: 'test',
  APP_NAME: 'CareBow',
  API_BASE_URL: 'https://api.carebow.com/v1',
  API_TIMEOUT: '30000',
  ASK_CAREBOW_API_URL: 'https://api.carebow.com/v1/ask-carebow',
  ASK_CAREBOW_API_KEY: 'test_api_key',
  FEATURE_HEALTH_MEMORY: 'true',
  FEATURE_IMAGE_UPLOAD: 'true',
  FEATURE_VOICE_INPUT: 'true',
};
