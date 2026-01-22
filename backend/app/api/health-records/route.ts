import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthenticatedUser,
  requireRole,
} from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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

    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const date = formData.get("date") as string;
    const doctorName = formData.get("doctorName") as string | null;

    // Validate required fields
    if (!file || !title || !type || !date) {
      return errorResponse(
        "Missing required fields: file, title, type, date",
        "VALIDATION_ERROR",
        400
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        "Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX",
        "INVALID_FILE_TYPE",
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        "File size exceeds 10MB limit",
        "FILE_TOO_LARGE",
        400
      );
    }

    // Validate record type
    const validTypes = ["LAB_REPORT", "IMAGING", "PRESCRIPTION", "MEDICAL_REPORT"];
    if (!validTypes.includes(type)) {
      return errorResponse(
        "Invalid record type. Must be one of: LAB_REPORT, IMAGING, PRESCRIPTION, MEDICAL_REPORT",
        "VALIDATION_ERROR",
        400
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "health-records");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create database record
    const record = await prisma.healthRecord.create({
      data: {
        familyId: familyProfile.id,
        title,
        type: type as "LAB_REPORT" | "IMAGING" | "PRESCRIPTION" | "MEDICAL_REPORT",
        fileUrl: `/uploads/health-records/${filename}`,
        doctorName,
        date: new Date(date),
      },
    });

    return successResponse(
      {
        success: true,
        record,
      },
      201
    );
  } catch (error) {
    console.error("Upload health record error:", error);
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

    // Get family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: user.id },
    });

    if (!familyProfile) {
      return successResponse({ records: [] });
    }

    const records = await prisma.healthRecord.findMany({
      where: { familyId: familyProfile.id },
      orderBy: { date: "desc" },
    });

    return successResponse({ records });
  } catch (error) {
    console.error("Get health records error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
