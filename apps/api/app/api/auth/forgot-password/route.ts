import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return errorResponse("Invalid email format", "VALIDATION_ERROR", 400);
    }

    const { email } = result.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({
        success: true,
        message: "If an account exists with this email, a reset link will be sent.",
      });
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // In production, send email here
    // For development, log the token
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(`Reset URL: http://localhost:3000/reset-password?token=${token}`);

    // TODO: Integrate email service (SendGrid, Resend, etc.)
    // await sendPasswordResetEmail(email, token);

    // SECURITY: Never include token in API response - use server logs for debugging
    return successResponse({
      success: true,
      message: "If an account exists with this email, a reset link will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
