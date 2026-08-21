import { ApiClient } from './ApiClient';
import { ApiError } from './types';
import { SecureStorage } from '@/services/storage/SecureStorage';

const secureStorageMock = SecureStorage as jest.Mocked<typeof SecureStorage>;

describe('ApiClient retry policy', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('does not retry a conflict response used by password setup', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      headers: { forEach: jest.fn() },
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          success: false,
          requiresPasswordSetup: true,
          error: 'Password setup required',
        })
      ),
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(ApiClient.post('/v1/auth/login', {}, { skipAuth: true })).rejects.toMatchObject<
      Partial<ApiError>
    >({
      code: 'CONFLICT',
      status: 409,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('ApiClient token lifecycle', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    secureStorageMock.clearAuthTokens.mockResolvedValue(true);
    await ApiClient.clearTokens({ revokeRemote: false });
  });

  afterEach(async () => {
    secureStorageMock.clearAuthTokens.mockResolvedValue(true);
    await ApiClient.clearTokens({ revokeRemote: false });
  });

  it('does not become authenticated when secure token persistence fails', async () => {
    secureStorageMock.setAuthTokens.mockResolvedValueOnce(false);

    await expect(
      ApiClient.setTokens({
        accessToken: 'access-new',
        refreshToken: 'refresh-new',
        expiresAt: Math.floor(Date.now() / 1000) + 900,
      })
    ).rejects.toThrow('Failed to persist authentication tokens securely');

    expect(ApiClient.isAuthenticated()).toBe(false);
    expect(ApiClient.getAccessToken()).toBeNull();
    expect(ApiClient.getRefreshToken()).toBeNull();
  });

  it('activates tokens only after secure persistence succeeds', async () => {
    secureStorageMock.setAuthTokens.mockResolvedValueOnce(true);

    await ApiClient.setTokens({
      accessToken: 'access-ok',
      refreshToken: 'refresh-ok',
      expiresAt: Math.floor(Date.now() / 1000) + 900,
    });

    expect(ApiClient.isAuthenticated()).toBe(true);
    expect(ApiClient.getAccessToken()).toBe('access-ok');
    expect(ApiClient.getRefreshToken()).toBe('refresh-ok');
  });
});
