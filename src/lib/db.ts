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
    // 🚀 修复 ECONNRESET / P1017：Supabase 要求 SSL 连接，但环境无法验证其证书链，
    // 会在 SSL 握手阶段重置连接。这里显式开启 SSL 且不强制校验证书链。
    ssl: { rejectUnauthorized: false },
    // 缩短空闲超时让被 pgBouncer 关闭的死连接尽快回收，并开启 keepAlive 维持活性。
    max: 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
    allowExitOnIdle: true,
  })

  // 🚀 关键：监听池错误。否则后端关闭连接时会抛出未捕获错误并污染整个池。
  pool.on("error", (err) => {
    console.error("[v0][db] pg pool error（已忽略，连接将被自动重建）:", err.message)
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
