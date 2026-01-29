import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";
import { z } from "zod";

const verifySchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const result = verifySchema.safeParse(body);
    if (!result.success) {
      return errorResponse(
        "Invalid action. Must be 'approve' or 'reject'",
        "VALIDATION_ERROR",
        400
      );
    }

    const { action } = result.data;

    // Check if caregiver exists
    const caregiver = await prisma.caregiverProfile.findUnique({
      where: { id },
    });

    if (!caregiver) {
      return errorResponse("Caregiver not found", "RESOURCE_NOT_FOUND", 404);
    }

    // Update verification status
    const newStatus = action === "approve" ? "VERIFIED" : "REJECTED";

    const updatedCaregiver = await prisma.caregiverProfile.update({
      where: { id },
      data: { verificationStatus: newStatus },
    });

    return successResponse({
      success: true,
      caregiver: {
        id: updatedCaregiver.id,
        verificationStatus: updatedCaregiver.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Verify caregiver error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
