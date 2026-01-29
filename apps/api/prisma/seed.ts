import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@carebow.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@carebow.com",
      password: adminPassword,
      type: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create sample family user
  const familyPassword = await bcrypt.hash("family123", 12);
  const familyUser = await prisma.user.upsert({
    where: { email: "family@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "family@example.com",
      password: familyPassword,
      type: "FAMILY",
      phone: "+1-555-0123",
    },
  });
  console.log("Created family user:", familyUser.email);

  // Create family profile
  await prisma.familyProfile.upsert({
    where: { userId: familyUser.id },
    update: {},
    create: {
      userId: familyUser.id,
      address: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "+1-555-0124",
    },
  });
  console.log("Created family profile");

  // Create sample caregivers
  const caregivers = [
    {
      name: "Sarah Johnson",
      email: "sarah@carebow.com",
      phone: "+1-555-0125",
      bio: "Experienced nurse with 10 years of elderly care experience. Specialized in dementia care and mobility assistance.",
      experience: 10,
      hourlyRate: 45,
      city: "San Francisco",
      state: "CA",
      specializations: ["Elderly Care", "Dementia Care", "Mobility Assistance"],
      languages: ["English", "Spanish"],
      caregiverType: "ELDER_CARE_SPECIALIST" as const,
    },
    {
      name: "Michael Chen",
      email: "michael@carebow.com",
      phone: "+1-555-0126",
      bio: "Licensed physiotherapist with expertise in rehabilitation and post-surgery care.",
      experience: 8,
      hourlyRate: 55,
      city: "San Francisco",
      state: "CA",
      specializations: ["Physical Therapy", "Rehabilitation", "Post-Surgery Care"],
      languages: ["English", "Mandarin"],
      caregiverType: "PHYSIOTHERAPIST" as const,
    },
    {
      name: "Emily Davis",
      email: "emily@carebow.com",
      phone: "+1-555-0127",
      bio: "Compassionate companion caregiver focused on social engagement and daily living assistance.",
      experience: 5,
      hourlyRate: 35,
      city: "San Francisco",
      state: "CA",
      specializations: ["Companion Care", "Daily Living Assistance", "Social Engagement"],
      languages: ["English"],
      caregiverType: "COMPANION" as const,
    },
  ];

  for (const cg of caregivers) {
    const password = await bcrypt.hash("caregiver123", 12);
    const user = await prisma.user.upsert({
      where: { email: cg.email },
      update: {},
      create: {
        name: cg.name,
        email: cg.email,
        password: password,
        type: "CAREGIVER",
        phone: cg.phone,
      },
    });

    await prisma.caregiverProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        caregiverType: cg.caregiverType,
        bio: cg.bio,
        experience: cg.experience,
        hourlyRate: cg.hourlyRate,
        address: "456 Oak Ave",
        city: cg.city,
        state: cg.state,
        zipCode: "94103",
        specializations: cg.specializations,
        languages: cg.languages,
        rating: 4.5 + Math.random() * 0.5,
        totalReviews: Math.floor(Math.random() * 50) + 10,
        isActive: true,
        verificationStatus: "VERIFIED",
      },
    });

    console.log(`Created caregiver: ${cg.name}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
