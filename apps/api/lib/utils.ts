import { NextResponse } from "next/server";
import { auth } from "./auth";

// Standard API response helpers
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  message: string,
  code: string,
  status: number,
  details?: Record<string, string>
) {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(details && { details }),
    },
    { status }
  );
}

// Authentication helper for API routes
export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

// Role-based authorization helper
export function requireRole(userType: string | undefined, allowedRoles: string[]) {
  if (!userType || !allowedRoles.includes(userType)) {
    return false;
  }
  return true;
}
