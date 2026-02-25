import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hash("password123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nakedminds.app" },
    update: {},
    create: {
      email: "admin@nakedminds.app",
      passwordHash: adminPassword,
      displayName: "Circle Admin",
      bio: "I started this Circle to help us all grow together.",
      role: "ADMIN",
      onboarded: true,
    },
  });

  const memberPassword = await hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      passwordHash: memberPassword,
      displayName: "Alice",
      bio: "Working on being more present and intentional.",
      role: "MEMBER",
      onboarded: true,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      passwordHash: memberPassword,
      displayName: "Bob",
      bio: "Trying to slow down and enjoy the process.",
      role: "MEMBER",
      onboarded: true,
    },
  });

  // Create monthly entries for current month
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  const adminEntry = await prisma.monthlyEntry.upsert({
    where: { userId_year_month: { userId: admin.id, year, month } },
    update: {},
    create: {
      userId: admin.id,
      year,
      month,
      habitAdopt: "Read for 30 minutes every evening before bed",
      habitRemove: "Checking email first thing in the morning",
      focusChallenge:
        "I'm working on delegating more at work instead of trying to do everything myself. It's uncomfortable but necessary for my growth as a leader.",
    },
  });

  const aliceEntry = await prisma.monthlyEntry.upsert({
    where: { userId_year_month: { userId: alice.id, year, month } },
    update: {},
    create: {
      userId: alice.id,
      year,
      month,
      habitAdopt: "Write in my journal every morning for 10 minutes",
      habitRemove: "Saying yes to things I don't actually want to do",
      focusChallenge:
        "I'm learning to set boundaries with family without feeling guilty. It's the hardest thing I've ever done but I know it's important for my mental health.",
    },
  });

  const bobEntry = await prisma.monthlyEntry.upsert({
    where: { userId_year_month: { userId: bob.id, year, month } },
    update: {},
    create: {
      userId: bob.id,
      year,
      month,
      habitAdopt: "Take a 20-minute walk after lunch every day",
      habitRemove: "Doom-scrolling social media during breaks",
      focusChallenge:
        "I'm trying to have more honest conversations with my partner about our finances. We've been avoiding the topic and it's creating tension.",
    },
  });

  // Add some comments
  await prisma.comment.createMany({
    data: [
      {
        authorId: alice.id,
        monthlyEntryId: adminEntry.id,
        body: "Delegating is so hard! I struggle with this too. Rooting for you.",
      },
      {
        authorId: bob.id,
        monthlyEntryId: aliceEntry.id,
        body: "Boundaries are an act of self-love. You've got this, Alice.",
      },
      {
        authorId: admin.id,
        monthlyEntryId: bobEntry.id,
        body: "Those honest conversations are tough but so worth it. Happy to chat if you want to talk it through.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete!");
  console.log("---");
  console.log("Test accounts (all password: password123):");
  console.log("  Admin: admin@nakedminds.app");
  console.log("  Member: alice@example.com");
  console.log("  Member: bob@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
