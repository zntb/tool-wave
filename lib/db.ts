// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { getEnv } from './env';

// Validate all required environment variables on first import
getEnv();

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
