import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Public API index and health response.
 * Keep this intentionally free of infrastructure details and secrets.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: 'CareBow API',
      status: 'operational',
      version: 'v1',
      timestamp: new Date().toISOString(),
      endpoints: {
        authentication: '/api/auth/enabled-methods',
        services: '/api/v1/services',
        profiles: '/api/v1/profiles',
        bookings: '/api/v1/bookings',
        support: '/api/support/conversations',
      },
      note: 'Protected endpoints require an Authorization: Bearer <token> header.',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
