import { ApiClient } from '../ApiClient';
import { authApi } from './auth';

jest.mock('../ApiClient', () => ({
  ApiClient: {
    post: jest.fn(),
    clearTokens: jest.fn(),
    getRefreshToken: jest.fn(),
  },
}));

const mockPost = ApiClient.post as jest.Mock;
const mockClearTokens = ApiClient.clearTokens as jest.Mock;
const mockGetRefreshToken = ApiClient.getRefreshToken as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockPost.mockResolvedValue({ data: { success: true, message: 'ok' } });
});

it('uses the production v1 verification resend route', async () => {
  await authApi.resendVerificationCode('member@example.com');

  expect(mockPost).toHaveBeenCalledWith(
    '/v1/auth/resend-verification',
    { email: 'member@example.com' },
    { skipAuth: true }
  );
});

it('uses the production v1 forgot-password route', async () => {
  await authApi.requestPasswordReset('member@example.com');

  expect(mockPost).toHaveBeenCalledWith(
    '/v1/auth/forgot',
    { email: 'member@example.com' },
    { skipAuth: true }
  );
});

it('maps the mobile newPassword field to the production password field', async () => {
  await authApi.resetPassword('reset-token', 'NewPassword1!');

  expect(mockPost).toHaveBeenCalledWith(
    '/v1/auth/reset',
    { token: 'reset-token', password: 'NewPassword1!' },
    { skipAuth: true }
  );
});

it('revokes the current refresh token before clearing local tokens', async () => {
  mockGetRefreshToken.mockReturnValue('refresh-token');

  await authApi.logout();

  expect(mockPost).toHaveBeenCalledWith('/v1/auth/logout', { refreshToken: 'refresh-token' });
  expect(mockClearTokens).toHaveBeenCalledTimes(1);
});

it('still clears local tokens when server logout fails', async () => {
  mockGetRefreshToken.mockReturnValue('refresh-token');
  mockPost.mockRejectedValue(new Error('offline'));

  await expect(authApi.logout()).resolves.toBeUndefined();
  expect(mockClearTokens).toHaveBeenCalledTimes(1);
});
