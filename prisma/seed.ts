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
      oneThing: "Delegate one project completely to a team member",
      keyActions: "1. Identify a project to hand off\n2. Brief the team member\n3. Step back and only check in weekly",
      firstStep: "Choose which project to delegate by Friday",
      timeBlockDay: "Monday",
      timeBlockTime: "9:00 AM",
      definitionOfProgress: "One project is fully owned by someone else, and I haven't intervened for 2 weeks",
    },
  });

  const aliceEntry = await prisma.monthlyEntry.upsert({
    where: { userId_year_month: { userId: alice.id, year, month } },
    update: {},
    create: {
      userId: alice.id,
      year,
      month,
      oneThing: "Set clear boundaries with family",
      keyActions: "1. Identify one boundary to set this week\n2. Practice saying no in low-stakes situations\n3. Journal about how it feels afterward",
      firstStep: "Write down the one boundary I need to set most urgently",
      timeBlockDay: "Wednesday",
      timeBlockTime: "7:00 PM",
      definitionOfProgress: "I've said no to at least 3 things I don't want to do without feeling guilty",
    },
  });

  const bobEntry = await prisma.monthlyEntry.upsert({
    where: { userId_year_month: { userId: bob.id, year, month } },
    update: {},
    create: {
      userId: bob.id,
      year,
      month,
      oneThing: "Have honest financial conversations with my partner",
      keyActions: "1. Schedule a weekly money chat\n2. Prepare a simple budget overview\n3. Listen without getting defensive",
      firstStep: "Propose a time for our first money chat this weekend",
      timeBlockDay: "Saturday",
      timeBlockTime: "10:00 AM",
      definitionOfProgress: "We've had at least 3 money conversations and agreed on a shared budget",
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
