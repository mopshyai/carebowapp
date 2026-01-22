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

    const caregivers = await prisma.caregiverProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ caregivers });
  } catch (error) {
    console.error("Admin get caregivers error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
