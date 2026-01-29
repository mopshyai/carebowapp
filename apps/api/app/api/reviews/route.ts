import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";
import { z } from "zod";

const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    if (!requireRole(user.type, ["FAMILY"])) {
      return errorResponse(
        "Forbidden - Only families can leave reviews",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    const body = await request.json();

    // Validate request body
    const result = createReviewSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      return errorResponse("Validation failed", "VALIDATION_ERROR", 400, errors);
    }

    const { bookingId, rating, comment } = result.data;

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

    // Get booking and verify it belongs to this family
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        caregiver: true,
        review: true,
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", "RESOURCE_NOT_FOUND", 404);
    }

    if (booking.familyId !== familyProfile.id) {
      return errorResponse(
        "You can only review your own bookings",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    if (booking.status !== "COMPLETED") {
      return errorResponse(
        "Can only review completed bookings",
        "INVALID_STATUS",
        400
      );
    }

    if (booking.review) {
      return errorResponse(
        "You have already reviewed this booking",
        "ALREADY_REVIEWED",
        409
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        caregiverId: booking.caregiverId,
        rating,
        comment,
      },
    });

    // Update caregiver's average rating
    const allReviews = await prisma.review.findMany({
      where: { caregiverId: booking.caregiverId },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await prisma.caregiverProfile.update({
      where: { id: booking.caregiverId },
      data: {
        rating: averageRating,
        totalReviews: allReviews.length,
      },
    });

    return successResponse(
      {
        success: true,
        review,
      },
      201
    );
  } catch (error) {
    console.error("Create review error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caregiverId = searchParams.get("caregiverId");

    if (!caregiverId) {
      return errorResponse(
        "caregiverId query parameter is required",
        "VALIDATION_ERROR",
        400
      );
    }

    const reviews = await prisma.review.findMany({
      where: { caregiverId },
      include: {
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
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return successResponse({
      reviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
