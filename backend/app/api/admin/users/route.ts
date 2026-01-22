import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    if (!requireRole(user.type, ["ADMIN"])) {
      return errorResponse(
        "Forbidden - Admin access only",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        phone: true,
        createdAt: true,
        familyProfile: {
          select: {
            id: true,
            city: true,
            state: true,
          },
        },
        caregiverProfile: {
          select: {
            id: true,
            caregiverType: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ users });
  } catch (error) {
    console.error("Admin get users error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
