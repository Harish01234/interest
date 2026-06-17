import { PrismaClient } from './generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({ adapter })
}

function getPrismaClient() {
  const cached = globalThis.__prisma

  // Recreate when the cached client is from an older Prisma schema
  // (e.g. before Member was added) so delegates like `member` exist.
  if (cached && 'member' in cached) {
    return cached
  }

  const client = createPrismaClient()
  globalThis.__prisma = client
  return client
}

export const prisma = getPrismaClient()
