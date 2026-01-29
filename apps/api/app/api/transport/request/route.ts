import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";
import { z } from "zod";

const transportRequestSchema = z.object({
  pickup: z.string().min(1, "Pickup location is required"),
  dropoff: z.string().min(1, "Dropoff location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
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
    const result = transportRequestSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      return errorResponse("Validation failed", "VALIDATION_ERROR", 400, errors);
    }

    const { pickup, dropoff, date, time, notes } = result.data;

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

    // Create transport request
    const transportRequest = await prisma.transportRequest.create({
      data: {
        familyId: familyProfile.id,
        pickup,
        dropoff,
        date: new Date(date),
        time,
        notes,
      },
    });

    return successResponse(
      {
        success: true,
        request: transportRequest,
      },
      201
    );
  } catch (error) {
    console.error("Create transport request error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    if (!requireRole(user.type, ["FAMILY", "ADMIN"])) {
      return errorResponse(
        "Forbidden",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    let requests;

    if (user.type === "FAMILY") {
      const familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: user.id },
      });

      if (!familyProfile) {
        return successResponse({ requests: [] });
      }

      requests = await prisma.transportRequest.findMany({
        where: { familyId: familyProfile.id },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Admin sees all requests
      requests = await prisma.transportRequest.findMany({
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
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return successResponse({ requests });
  } catch (error) {
    console.error("Get transport requests error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
