import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";
import { z } from "zod";

const createBookingSchema = z.object({
  caregiverId: z.string().min(1, "Caregiver ID is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  serviceType: z.string().min(1, "Service type is required"),
  notes: z.string().optional(),
  hours: z.number().min(1).optional(),
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
    const result = createBookingSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      return errorResponse("Validation failed", "VALIDATION_ERROR", 400, errors);
    }

    const { caregiverId, startDate, endDate, serviceType, notes, hours } =
      result.data;

    // Get family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: user.id },
    });

    if (!familyProfile) {
      return errorResponse(
        "Please create a family profile first",
        "PROFILE_REQUIRED",
        400
      );
    }

    // Get caregiver to calculate cost
    const caregiver = await prisma.caregiverProfile.findUnique({
      where: { id: caregiverId },
    });

    if (!caregiver) {
      return errorResponse("Caregiver not found", "RESOURCE_NOT_FOUND", 404);
    }

    // SECURITY: Verify caregiver is active and verified before allowing booking
    if (!caregiver.isActive) {
      return errorResponse("Caregiver is not currently active", "CAREGIVER_UNAVAILABLE", 400);
    }
    if (caregiver.verificationStatus !== "VERIFIED") {
      return errorResponse("Caregiver is not verified", "CAREGIVER_UNAVAILABLE", 400);
    }

    // Validate booking dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    const now = new Date();

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return errorResponse("Invalid date format", "VALIDATION_ERROR", 400);
    }

    if (endDateTime <= startDateTime) {
      return errorResponse("End date must be after start date", "VALIDATION_ERROR", 400);
    }

    if (startDateTime < now) {
      return errorResponse("Cannot create bookings in the past", "VALIDATION_ERROR", 400);
    }

    // Calculate total cost
    const bookingHours =
      hours ||
      Math.ceil(
        (endDateTime.getTime() - startDateTime.getTime()) /
          (1000 * 60 * 60)
      );

    // Validate reasonable booking duration (max 168 hours = 1 week)
    if (bookingHours <= 0 || bookingHours > 168) {
      return errorResponse("Booking duration must be between 1 and 168 hours", "VALIDATION_ERROR", 400);
    }

    const totalCost = Number(caregiver.hourlyRate) * bookingHours;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        familyId: familyProfile.id,
        caregiverId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        serviceType,
        notes,
        totalCost,
      },
    });

    return successResponse(
      {
        success: true,
        booking,
      },
      201
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    let bookings;

    if (user.type === "FAMILY") {
      // Get family profile
      const familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: user.id },
      });

      if (!familyProfile) {
        return successResponse({ bookings: [] });
      }

      // Get bookings for family
      bookings = await prisma.booking.findMany({
        where: { familyId: familyProfile.id },
        include: {
          caregiver: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.type === "CAREGIVER") {
      // Get caregiver profile
      const caregiverProfile = await prisma.caregiverProfile.findUnique({
        where: { userId: user.id },
      });

      if (!caregiverProfile) {
        return successResponse({ bookings: [] });
      }

      // Get bookings for caregiver
      bookings = await prisma.booking.findMany({
        where: { caregiverId: caregiverProfile.id },
        include: {
          family: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.type === "ADMIN") {
      // Admin can see all bookings
      bookings = await prisma.booking.findMany({
        include: {
          family: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          caregiver: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return errorResponse("Invalid user type", "INVALID_USER_TYPE", 400);
    }

    return successResponse({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
