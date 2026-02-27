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
  if (!url) {
    throw new Error("DATABASE_URL is missing");
  }
  
  // Use the PrismaNeon factory as the adapter
  const adapter = new PrismaNeon({ connectionString: url });
  
  return new PrismaClient({
    adapter,
    log: ["query"],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
