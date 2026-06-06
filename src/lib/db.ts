import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL
  if (!connectionString) {
    throw new Error("缺少 DATABASE_URL 或 DIRECT_URL，无法连接数据库。")
  }

  const pool = new Pool({
    connectionString,
    // Supabase pooler 需要 SSL，否则连接会被服务器重置（ECONNRESET / Server has closed the connection）
    ssl: { rejectUnauthorized: false },
  })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
