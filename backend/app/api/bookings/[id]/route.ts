import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
} from "@/lib/utils";
import { z } from "zod";

const updateBookingSchema = z.object({
  action: z.enum(["accept", "decline", "cancel", "complete"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const result = updateBookingSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(
        "Invalid action. Must be one of: accept, decline, cancel, complete",
        "VALIDATION_ERROR",
        400
      );
    }

    const { action } = result.data;

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        family: true,
        caregiver: true,
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", "RESOURCE_NOT_FOUND", 404);
    }

    // Check permissions based on action
    if (action === "accept" || action === "decline") {
      // Only caregiver can accept/decline
      if (
        user.type !== "CAREGIVER" ||
        booking.caregiver.userId !== user.id
      ) {
        return errorResponse(
          "Only the assigned caregiver can accept or decline",
          "INSUFFICIENT_PERMISSIONS",
          403
        );
      }

      if (booking.status !== "PENDING") {
        return errorResponse(
          "Can only accept/decline pending bookings",
          "INVALID_STATUS",
          400
        );
      }
    }

    if (action === "cancel") {
      // Family can cancel their bookings, caregiver can cancel confirmed bookings
      const isFamily =
        user.type === "FAMILY" && booking.family.userId === user.id;
      const isCaregiver =
        user.type === "CAREGIVER" && booking.caregiver.userId === user.id;

      if (!isFamily && !isCaregiver && user.type !== "ADMIN") {
        return errorResponse(
          "You don't have permission to cancel this booking",
          "INSUFFICIENT_PERMISSIONS",
          403
        );
      }
    }

    if (action === "complete") {
      // Only caregiver can mark as complete
      if (
        user.type !== "CAREGIVER" ||
        booking.caregiver.userId !== user.id
      ) {
        return errorResponse(
          "Only the assigned caregiver can mark as complete",
          "INSUFFICIENT_PERMISSIONS",
          403
        );
      }

      if (booking.status !== "CONFIRMED") {
        return errorResponse(
          "Can only complete confirmed bookings",
          "INVALID_STATUS",
          400
        );
      }
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      accept: "CONFIRMED",
      decline: "CANCELLED",
      cancel: "CANCELLED",
      complete: "COMPLETED",
    };

    const newStatus = statusMap[action] as
      | "PENDING"
      | "CONFIRMED"
      | "COMPLETED"
      | "CANCELLED";

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
    });

    return successResponse({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    const { id } = await params;

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        family: true,
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", "RESOURCE_NOT_FOUND", 404);
    }

    // Only family who created the booking or admin can delete
    const isFamily =
      user.type === "FAMILY" && booking.family.userId === user.id;

    if (!isFamily && user.type !== "ADMIN") {
      return errorResponse(
        "You don't have permission to delete this booking",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    return successResponse({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return errorResponse("Unauthorized", "AUTH_REQUIRED", 401);
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
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
        careLogs: true,
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", "RESOURCE_NOT_FOUND", 404);
    }

    // Check if user has access to this booking
    const hasAccess =
      user.type === "ADMIN" ||
      (user.type === "FAMILY" && booking.family.userId === user.id) ||
      (user.type === "CAREGIVER" && booking.caregiver.userId === user.id);

    if (!hasAccess) {
      return errorResponse(
        "You don't have access to this booking",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    return successResponse({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
