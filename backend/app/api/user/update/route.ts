import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthenticatedUser } from "@/lib/utils";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    const body = await request.json();

    // Validate request body
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      return errorResponse("Validation failed", "VALIDATION_ERROR", 400, errors);
    }

    const { name, phone } = result.data;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return successResponse({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
