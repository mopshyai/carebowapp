import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    // Build where clause
    const where: {
      isActive: boolean;
      verificationStatus: "VERIFIED";
      caregiverType?: "ELDER_CARE_SPECIALIST" | "NURSE" | "PHYSIOTHERAPIST" | "COMPANION" | "SPECIALIZED_CARE";
      OR?: Array<{
        bio?: { contains: string; mode: "insensitive" };
        specializations?: { hasSome: string[] };
        user?: { name: { contains: string; mode: "insensitive" } };
      }>;
    } = {
      isActive: true,
      verificationStatus: "VERIFIED",
    };

    // Filter by caregiver type
    if (type) {
      const validTypes = [
        "ELDER_CARE_SPECIALIST",
        "NURSE",
        "PHYSIOTHERAPIST",
        "COMPANION",
        "SPECIALIZED_CARE",
      ];
      if (validTypes.includes(type)) {
        where.caregiverType = type as
          | "ELDER_CARE_SPECIALIST"
          | "NURSE"
          | "PHYSIOTHERAPIST"
          | "COMPANION"
          | "SPECIALIZED_CARE";
      }
    }

    // Search by name or specialization
    if (search) {
      where.OR = [
        { bio: { contains: search, mode: "insensitive" } },
        { specializations: { hasSome: [search] } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const caregivers = await prisma.caregiverProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [{ rating: "desc" }, { totalReviews: "desc" }],
    });

    return successResponse({ caregivers });
  } catch (error) {
    console.error("Search caregivers error:", error);
    return errorResponse("Internal server error", "SERVER_ERROR", 500);
  }
}
