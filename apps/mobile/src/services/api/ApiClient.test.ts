import { ApiClient } from './ApiClient';
import { ApiError } from './types';

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
