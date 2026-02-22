//sst.config.ts is basicallyan instruction file that tells SST the name my app, to remove my data or not during production, tell what kind of app is this? new sst.aws.Nextjs("Web") tells SST "this is a Next.js app, deploy it accordingly", What secret keys does your app need

/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ai-interview-platform",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs("MyWeb", {
      // Pass server env vars to Lambda + build
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL!,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
      },

      //runtime node version
      server: { runtime: "nodejs20.x" },
    });
  },
});
