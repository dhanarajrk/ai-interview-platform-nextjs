import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const questions = [
    {
      role: "Frontend Developer",
      difficulty: "Easy",
      prompt: "Explain the difference between == and === in JavaScript.",
      tags: ["javascript", "basics"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Medium",
      prompt: "What is the purpose of React keys when rendering a list?",
      tags: ["react", "rendering"],
    },
    {
      role: "Backend Developer",
      difficulty: "Easy",
      prompt: "What is REST and what are the common HTTP methods?",
      tags: ["api", "rest"],
    },
    {
      role: "Backend Developer",
      difficulty: "Medium",
      prompt: "Explain what a database index is and when it helps.",
      tags: ["database", "performance"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Medium",
      prompt: "How would you handle authentication securely in a web app?",
      tags: ["security", "auth"],
    },
  ];

  for (const q of questions) {
    await prisma.question.upsert({
      where: {
        // "fake unique" using prompt; for v1 seed it's fine
        id: "seed_" + Buffer.from(q.prompt).toString("base64url").slice(0, 16),
      },
      update: {},
      create: {
        id: "seed_" + Buffer.from(q.prompt).toString("base64url").slice(0, 16),
        role: q.role,
        difficulty: q.difficulty,
        prompt: q.prompt,
        tags: q.tags,
      },
    });
  }

  console.log("✅ Seeded questions:", questions.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
