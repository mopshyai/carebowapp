import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";
import { z } from "zod";

const familyProfileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    if (!requireRole(user.type, ["FAMILY"])) {
      return errorResponse(
        "Forbidden - Family members only",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    const body = await request.json();

    // Validate request body
    const result = familyProfileSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      return errorResponse("Validation failed", "VALIDATION_ERROR", 400, errors);
    }

    const {
      phone,
      address,
      city,
      state,
      zipCode,
      emergencyContact,
      emergencyPhone,
    } = result.data;

    // Update user phone if provided
    if (phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone },
      });
    }

    // Check if profile already exists
    const existingProfile = await prisma.familyProfile.findUnique({
      where: { userId: user.id },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.familyProfile.update({
        where: { userId: user.id },
        data: {
          address,
          city,
          state,
          zipCode,
          emergencyContactName: emergencyContact,
          emergencyContactPhone: emergencyPhone,
        },
      });
    } else {
      // Create new profile
      profile = await prisma.familyProfile.create({
        data: {
          userId: user.id,
          address,
          city,
          state,
          zipCode,
          emergencyContactName: emergencyContact,
          emergencyContactPhone: emergencyPhone,
        },
      });
    }

    return successResponse({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Family profile error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    if (!requireRole(user.type, ["FAMILY"])) {
      return errorResponse(
        "Forbidden - Family members only",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    const profile = await prisma.familyProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
    });

    if (!profile) {
      return errorResponse("Profile not found", "RESOURCE_NOT_FOUND", 404);
    }

    return successResponse({ profile });
  } catch (error) {
    console.error("Get family profile error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
