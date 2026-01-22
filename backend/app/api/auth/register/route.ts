import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  type: z.enum(["FAMILY", "CAREGIVER", "ADMIN"]).default("FAMILY"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0] as string] = err.message;
      });
      return errorResponse("Validation failed", "VALIDATION_ERROR", 400, errors);
    }

    const { name, email, password, type } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(
        "User with this email already exists",
        "USER_EXISTS",
        409
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type,
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
      },
    });

    return successResponse(
      {
        success: true,
        user,
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
