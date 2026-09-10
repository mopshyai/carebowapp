const REDACTED_EVENT_MESSAGE = 'CareBow application message';
const REDACTED_EXCEPTION_MESSAGE = 'CareBow application exception';
const REDACTED_BREADCRUMB_MESSAGE = 'CareBow breadcrumb';

type MutableBreadcrumb = {
  message?: string;
  data?: unknown;
  [key: string]: unknown;
};

type MutableExceptionValue = {
  value?: string;
  mechanism?: {
    data?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type MutableRequest = {
  data?: unknown;
  body?: unknown;
  query_string?: unknown;
  cookies?: unknown;
  headers?: unknown;
  url?: string;
  [key: string]: unknown;
};

type MutableSentryEvent = {
  message?: string;
  breadcrumbs?: MutableBreadcrumb[];
  exception?: {
    values?: MutableExceptionValue[];
    [key: string]: unknown;
  };
  request?: MutableRequest;
  user?: unknown;
  extra?: unknown;
  contexts?: unknown;
  [key: string]: unknown;
};

/**
 * Remove arbitrary free text before a Sentry event leaves the device.
 *
 * Stack frames, exception types, levels, categories and operational tags remain
 * useful for diagnosis. User-authored or dynamically composed messages do not:
 * they can contain symptoms, names, booking notes, addresses or other PHI/PII.
 */
export function redactSentryFreeText<T>(event: T): T {
  if (!event || typeof event !== 'object') return event;

  const mutable = event as MutableSentryEvent;
  if (mutable.message) {
    mutable.message = REDACTED_EVENT_MESSAGE;
  }

  if (mutable.exception?.values) {
    for (const value of mutable.exception.values) {
      if (value.value) value.value = REDACTED_EXCEPTION_MESSAGE;
      if (value.mechanism?.data) value.mechanism.data = undefined;
    }
  }

  if (mutable.request) {
    mutable.request.data = undefined;
    mutable.request.body = undefined;
    mutable.request.query_string = undefined;
    mutable.request.cookies = undefined;
    mutable.request.headers = undefined;

    if (mutable.request.url) {
      mutable.request.url = mutable.request.url.split('?')[0] ?? mutable.request.url;
    }
  }

  mutable.user = undefined;
  mutable.extra = undefined;
  mutable.contexts = undefined;

  if (mutable.breadcrumbs) {
    mutable.breadcrumbs = mutable.breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      ...(breadcrumb.message ? { message: REDACTED_BREADCRUMB_MESSAGE } : {}),
      data: undefined,
    }));
  }

  return event;
}

/** Redact a breadcrumb before Sentry attaches it to an event. */
export function redactSentryBreadcrumb<T>(breadcrumb: T): T {
  if (!breadcrumb || typeof breadcrumb !== 'object') return breadcrumb;

  const mutable = breadcrumb as MutableBreadcrumb;
  if (mutable.message) mutable.message = REDACTED_BREADCRUMB_MESSAGE;
  mutable.data = undefined;
  return breadcrumb;
}
