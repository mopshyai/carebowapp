import { redactSentryBreadcrumb, redactSentryFreeText } from './sentryPrivacy';

const PHI = 'synthetic patient Jane Doe has chest pain at 123 Private Lane';

describe('Sentry PHI boundary', () => {
  it('removes synthetic PHI from event, exception, breadcrumb message, and breadcrumb data', () => {
    const event = {
      message: PHI,
      exception: {
        values: [
          {
            type: 'Error',
            value: PHI,
            stacktrace: { frames: [{ filename: 'CareScreen.tsx', lineno: 42 }] },
          },
        ],
      },
      breadcrumbs: [
        {
          category: 'care',
          message: PHI,
          data: { symptom: PHI },
        },
      ],
    };

    const redacted = redactSentryFreeText(event);
    const serialized = JSON.stringify(redacted);

    expect(serialized).not.toContain(PHI);
    expect(redacted.message).toBe('CareBow application message');
    expect(redacted.exception.values[0]?.type).toBe('Error');
    expect(redacted.exception.values[0]?.stacktrace.frames[0]?.filename).toBe('CareScreen.tsx');
    expect(redacted.exception.values[0]?.value).toBe('CareBow application exception');
    expect(redacted.breadcrumbs[0]?.message).toBe('CareBow breadcrumb');
    expect(redacted.breadcrumbs[0]?.data).toBeUndefined();
  });

  it('redacts breadcrumb free text before attachment', () => {
    const breadcrumb = {
      category: 'navigation',
      message: PHI,
      data: { routeParam: PHI },
      level: 'info',
    };

    const redacted = redactSentryBreadcrumb(breadcrumb);

    expect(JSON.stringify(redacted)).not.toContain(PHI);
    expect(redacted.message).toBe('CareBow breadcrumb');
    expect(redacted.data).toBeUndefined();
    expect(redacted.category).toBe('navigation');
    expect(redacted.level).toBe('info');
  });
});
