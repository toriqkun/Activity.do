// Last updated: 2026-02-27T15:25:00
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
console.log("Initializing Prisma Client...");
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Neon serverless WebSocket setup
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  
  // Prevent build crash if DATABASE_URL is missing on Vercel dashboard
  if (!url) {
    console.warn("⚠️ DATABASE_URL is missing. If this is a build phase, it's expected unless you need DB access during pre-rendering.");
    // Return a dummy client or handle based on phase
    if (process.env.NEXT_PHASE === "phase-production-build") {
        return null as any;
    }
    throw new Error("DATABASE_URL is missing. Please add it to your environment variables.");
  }
  
  const adapter = new PrismaNeon({ connectionString: url });
  
  return new PrismaClient({
    adapter,
    log: ["query"],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
