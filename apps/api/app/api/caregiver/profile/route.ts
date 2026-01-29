import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";
import { z } from "zod";

const caregiverProfileSchema = z.object({
  phone: z.string().optional(),
  bio: z.string().optional(),
  experience: z.number().min(0).default(0),
  hourlyRate: z.number().min(0).default(0),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  specialties: z.string().optional(), // Comma-separated
  languages: z.string().optional(), // Comma-separated
  caregiverType: z
    .enum([
      "ELDER_CARE_SPECIALIST",
      "NURSE",
      "PHYSIOTHERAPIST",
      "COMPANION",
      "SPECIALIZED_CARE",
    ])
    .default("ELDER_CARE_SPECIALIST"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    if (!requireRole(user.type, ["CAREGIVER"])) {
      return errorResponse(
        "Forbidden - Caregivers only",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    const body = await request.json();

    // Validate request body
    const result = caregiverProfileSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      return errorResponse("Validation failed", "VALIDATION_ERROR", 400, errors);
    }

    const {
      phone,
      bio,
      experience,
      hourlyRate,
      address,
      city,
      state,
      zipCode,
      specialties,
      languages,
      caregiverType,
    } = result.data;

    // Parse comma-separated values into arrays
    const specializations = specialties
      ? specialties.split(",").map((s) => s.trim())
      : [];
    const languageArray = languages
      ? languages.split(",").map((l) => l.trim())
      : [];

    // Update user phone if provided
    if (phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone },
      });
    }

    // Check if profile already exists
    const existingProfile = await prisma.caregiverProfile.findUnique({
      where: { userId: user.id },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.caregiverProfile.update({
        where: { userId: user.id },
        data: {
          caregiverType,
          bio,
          experience,
          hourlyRate,
          address,
          city,
          state,
          zipCode,
          specializations,
          languages: languageArray,
        },
      });
    } else {
      // Create new profile
      profile = await prisma.caregiverProfile.create({
        data: {
          userId: user.id,
          caregiverType,
          bio,
          experience,
          hourlyRate,
          address,
          city,
          state,
          zipCode,
          specializations,
          languages: languageArray,
        },
      });
    }

    return successResponse({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Caregiver profile error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    if (!requireRole(user.type, ["CAREGIVER"])) {
      return errorResponse(
        "Forbidden - Caregivers only",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    const profile = await prisma.caregiverProfile.findUnique({
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
    console.error("Get caregiver profile error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
