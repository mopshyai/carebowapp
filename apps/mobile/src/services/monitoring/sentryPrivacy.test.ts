import { redactSentryBreadcrumb, redactSentryFreeText } from './sentryPrivacy';

const PHI = 'SYNTHETIC_PHI_DO_NOT_EXPORT_74291';

describe('Sentry PHI boundary', () => {
  it('removes synthetic PHI from Sentry export surfaces while preserving diagnostics', () => {
    const event = {
      message: PHI,
      request: {
        url: `https://api.carebow.com/care?note=${PHI}`,
        query_string: `note=${PHI}`,
        data: { symptom: PHI },
        body: JSON.stringify({ note: PHI }),
        cookies: `session=${PHI}`,
        headers: {
          Authorization: `Bearer ${PHI}`,
          Cookie: `session=${PHI}`,
          'X-Api-Key': PHI,
          'X-CareBow-Debug-Note': PHI,
        },
        method: 'POST',
      },
      user: {
        id: PHI,
        email: `patient+${PHI}@example.test`,
        username: PHI,
        ip_address: PHI,
        segment: PHI,
      },
      extra: {
        careNote: PHI,
      },
      contexts: {
        appointment: {
          reason: PHI,
        },
      },
      exception: {
        values: [
          {
            type: 'Error',
            value: PHI,
            mechanism: {
              type: 'generic',
              handled: true,
              data: { serialized: PHI },
            },
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
    expect(redacted.request.url).toBe('https://api.carebow.com/care');
    expect(redacted.request.method).toBe('POST');
    expect(redacted.request.data).toBeUndefined();
    expect(redacted.request.body).toBeUndefined();
    expect(redacted.request.query_string).toBeUndefined();
    expect(redacted.request.cookies).toBeUndefined();
    expect(redacted.request.headers).toBeUndefined();
    expect(redacted.user).toBeUndefined();
    expect(redacted.extra).toBeUndefined();
    expect(redacted.contexts).toBeUndefined();
    expect(redacted.exception.values[0]?.type).toBe('Error');
    expect(redacted.exception.values[0]?.mechanism.type).toBe('generic');
    expect(redacted.exception.values[0]?.mechanism.handled).toBe(true);
    expect(redacted.exception.values[0]?.mechanism.data).toBeUndefined();
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
