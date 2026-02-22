import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const questions = [
    // Frontend Developer - Easy (5)
    {
      role: "Frontend Developer",
      difficulty: "Easy",
      prompt: "Explain the difference between == and === in JavaScript.",
      tags: ["javascript", "basics"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Easy",
      prompt: "What are the different data types in JavaScript?",
      tags: ["javascript", "basics"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Easy",
      prompt: "Explain what a closure is in JavaScript.",
      tags: ["javascript", "functions"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Easy",
      prompt: "What is the purpose of React keys when rendering a list?",
      tags: ["react", "rendering"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Easy",
      prompt: "Explain the CSS box model.",
      tags: ["css", "layout"],
    },

    // Frontend Developer - Medium (5)
    {
      role: "Frontend Developer",
      difficulty: "Medium",
      prompt: "What is the event loop in JavaScript and how does it work?",
      tags: ["javascript", "async"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Medium",
      prompt: "Explain the difference between let, const, and var.",
      tags: ["javascript", "variables"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Medium",
      prompt: "What are Promises and how do they differ from callbacks?",
      tags: ["javascript", "async"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Medium",
      prompt: "Explain the useEffect hook and its dependencies.",
      tags: ["react", "hooks"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Medium",
      prompt: "What is flexbox and when would you use it?",
      tags: ["css", "layout"],
    },

    // Frontend Developer - Hard (5)
    {
      role: "Frontend Developer",
      difficulty: "Hard",
      prompt: "Explain how prototypal inheritance works in JavaScript.",
      tags: ["javascript", "oop"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Hard",
      prompt: "What are generators and iterators in JavaScript?",
      tags: ["javascript", "advanced"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Hard",
      prompt: "How does React's reconciliation algorithm work?",
      tags: ["react", "internals"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Hard",
      prompt: "What are render props and when would you use them?",
      tags: ["react", "patterns"],
    },
    {
      role: "Frontend Developer",
      difficulty: "Hard",
      prompt: "Explain CSS Grid and complex layout strategies.",
      tags: ["css", "advanced"],
    },

    // Backend Developer - Easy (5)
    {
      role: "Backend Developer",
      difficulty: "Easy",
      prompt: "What is REST and what are the common HTTP methods?",
      tags: ["api", "rest"],
    },
    {
      role: "Backend Developer",
      difficulty: "Easy",
      prompt: "Explain the difference between SQL and NoSQL databases.",
      tags: ["database", "sql"],
    },
    {
      role: "Backend Developer",
      difficulty: "Easy",
      prompt: "What is an API endpoint and how is it structured?",
      tags: ["api", "basics"],
    },
    {
      role: "Backend Developer",
      difficulty: "Easy",
      prompt: "Explain what a server is in simple terms.",
      tags: ["server", "basics"],
    },
    {
      role: "Backend Developer",
      difficulty: "Easy",
      prompt: "What is JSON and why is it used in APIs?",
      tags: ["api", "json"],
    },

    // Backend Developer - Medium (5)
    {
      role: "Backend Developer",
      difficulty: "Medium",
      prompt: "Explain what a database index is and when it helps.",
      tags: ["database", "performance"],
    },
    {
      role: "Backend Developer",
      difficulty: "Medium",
      prompt: "What is middleware in backend applications?",
      tags: ["backend", "middleware"],
    },
    {
      role: "Backend Developer",
      difficulty: "Medium",
      prompt: "Explain the concept of ACID in databases.",
      tags: ["database", "transactions"],
    },
    {
      role: "Backend Developer",
      difficulty: "Medium",
      prompt: "How does the Node.js event loop work?",
      tags: ["nodejs", "async"],
    },
    {
      role: "Backend Developer",
      difficulty: "Medium",
      prompt: "What are environment variables and why are they important?",
      tags: ["backend", "configuration"],
    },

    // Backend Developer - Hard (5)
    {
      role: "Backend Developer",
      difficulty: "Hard",
      prompt: "What is database sharding and when would you use it?",
      tags: ["database", "scaling"],
    },
    {
      role: "Backend Developer",
      difficulty: "Hard",
      prompt: "Explain CAP theorem and its implications for distributed systems.",
      tags: ["distributed-systems", "architecture"],
    },
    {
      role: "Backend Developer",
      difficulty: "Hard",
      prompt: "What are database deadlocks and how do you prevent them?",
      tags: ["database", "concurrency"],
    },
    {
      role: "Backend Developer",
      difficulty: "Hard",
      prompt: "Explain how to design a rate limiting system for an API.",
      tags: ["api", "scaling"],
    },
    {
      role: "Backend Developer",
      difficulty: "Hard",
      prompt: "What is eventual consistency in distributed databases?",
      tags: ["database", "distributed"],
    },

    // Full Stack Developer - Easy (5)
    {
      role: "Full Stack Developer",
      difficulty: "Easy",
      prompt: "What is the difference between authentication and authorization?",
      tags: ["security", "auth"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Easy",
      prompt: "Explain what HTTP and HTTPS are.",
      tags: ["http", "security"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Easy",
      prompt: "What is a client-server architecture?",
      tags: ["architecture", "basics"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Easy",
      prompt: "Explain what cookies are in web development.",
      tags: ["web", "storage"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Easy",
      prompt: "What is the purpose of version control (git)?",
      tags: ["git", "tools"],
    },

    // Full Stack Developer - Medium (5)
    {
      role: "Full Stack Developer",
      difficulty: "Medium",
      prompt: "How would you handle authentication securely in a web app?",
      tags: ["security", "auth"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Medium",
      prompt: "Explain CORS and how to handle it.",
      tags: ["security", "cors"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Medium",
      prompt: "What are webhooks and how do they work?",
      tags: ["webhooks", "api"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Medium",
      prompt: "Explain how session management works in web apps.",
      tags: ["auth", "sessions"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Medium",
      prompt: "What is the difference between monolithic and microservices architecture?",
      tags: ["architecture", "patterns"],
    },

    // Full Stack Developer - Hard (5)
    {
      role: "Full Stack Developer",
      difficulty: "Hard",
      prompt: "How would you design a real-time notification system?",
      tags: ["architecture", "realtime"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Hard",
      prompt: "Explain OAuth 2.0 flow and its components.",
      tags: ["security", "oauth"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Hard",
      prompt: "What strategies exist for handling API versioning?",
      tags: ["api", "design"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Hard",
      prompt: "How would you implement feature flags in a production app?",
      tags: ["deployment", "patterns"],
    },
    {
      role: "Full Stack Developer",
      difficulty: "Hard",
      prompt: "Explain how to handle file uploads securely in a web app.",
      tags: ["security", "file-upload"],
    },
  ];

  console.log(`🌱 Seeding ${questions.length} questions...`);

  for (const q of questions) {
    await prisma.question.upsert({
      where: {
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

  console.log("✅ Successfully seeded:", questions.length, "questions");
  console.log("📊 Distribution:");
  console.log("   - Frontend Developer: 15 (5 Easy, 5 Medium, 5 Hard)");
  console.log("   - Backend Developer: 15 (5 Easy, 5 Medium, 5 Hard)");
  console.log("   - Full Stack Developer: 15 (5 Easy, 5 Medium, 5 Hard)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });