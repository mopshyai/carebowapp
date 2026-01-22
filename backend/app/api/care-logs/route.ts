import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";
import { z } from "zod";

const createCareLogSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  vitals: z.string().optional(),
  medications: z.string().optional(),
  activities: z.string().optional(),
  notes: z.string().optional(),
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
    const result = createCareLogSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      return errorResponse("Validation failed", "VALIDATION_ERROR", 400, errors);
    }

    const { bookingId, vitals, medications, activities, notes } = result.data;

    // Get caregiver profile
    const caregiverProfile = await prisma.caregiverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!caregiverProfile) {
      return errorResponse(
        "Please create a caregiver profile first",
        "PROFILE_REQUIRED",
        400
      );
    }

    // Verify booking exists and belongs to this caregiver
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return errorResponse("Booking not found", "RESOURCE_NOT_FOUND", 404);
    }

    if (booking.caregiverId !== caregiverProfile.id) {
      return errorResponse(
        "You can only create care logs for your own bookings",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
      return errorResponse(
        "Can only create care logs for confirmed or completed bookings",
        "INVALID_STATUS",
        400
      );
    }

    // Create care log
    const careLog = await prisma.careLog.create({
      data: {
        bookingId,
        caregiverId: caregiverProfile.id,
        vitals,
        medications,
        activities,
        notes,
      },
    });

    return successResponse(
      {
        success: true,
        careLog,
      },
      201
    );
  } catch (error) {
    console.error("Create care log error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    let careLogs;

    if (user.type === "FAMILY") {
      // Get family profile
      const familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: user.id },
      });

      if (!familyProfile) {
        return successResponse({ careLogs: [] });
      }

      // Get all care logs for family's bookings
      careLogs = await prisma.careLog.findMany({
        where: {
          booking: {
            familyId: familyProfile.id,
          },
        },
        include: {
          caregiver: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          booking: {
            select: {
              serviceType: true,
              family: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
      });
    } else if (user.type === "CAREGIVER") {
      // Get caregiver profile
      const caregiverProfile = await prisma.caregiverProfile.findUnique({
        where: { userId: user.id },
      });

      if (!caregiverProfile) {
        return successResponse({ careLogs: [] });
      }

      // Get caregiver's own care logs
      careLogs = await prisma.careLog.findMany({
        where: { caregiverId: caregiverProfile.id },
        include: {
          caregiver: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          booking: {
            select: {
              serviceType: true,
              family: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
      });
    } else if (user.type === "ADMIN") {
      // Admin sees all care logs
      careLogs = await prisma.careLog.findMany({
        include: {
          caregiver: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          booking: {
            select: {
              serviceType: true,
              family: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
      });
    } else {
      return errorResponse("Invalid user type", "INVALID_USER_TYPE", 400);
    }

    return successResponse({ careLogs });
  } catch (error) {
    console.error("Get care logs error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
