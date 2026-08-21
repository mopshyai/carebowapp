import { allowInsecureStorageFallback } from './storageSecurityPolicy';

describe('storage security policy', () => {
  it('allows the insecure fallback only for development builds', () => {
    expect(allowInsecureStorageFallback(true)).toBe(true);
  });

  it('fails closed in production builds', () => {
    expect(allowInsecureStorageFallback(false)).toBe(false);
  });
});
