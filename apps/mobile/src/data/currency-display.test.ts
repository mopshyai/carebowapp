import { formatMinor, setServerCurrency } from './countries';

describe('server-priced amounts never round away charged minor units', () => {
  afterEach(() => setServerCurrency(null));

  it('shows cents on converted USD prices', () => {
    expect(formatMinor(1880, 'USD')).toBe('$18.80');
    expect(formatMinor(940, 'USD')).toBe('$9.40');
  });

  it('keeps whole amounts clean', () => {
    expect(formatMinor(5000, 'USD')).toBe('$50');
    expect(formatMinor(0, 'USD')).toBe('$0');
  });

  it('does not round paise away', () => {
    expect(formatMinor(335135, 'INR')).toContain('3,351.35');
  });
});
