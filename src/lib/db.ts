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
    // 🚀 修复 P1017「Server has closed the connection」：
    // Supabase/pgBouncer 会主动关闭空闲连接，池里残留的死连接会让每个请求都失败。
    // 通过缩短空闲超时让死连接被尽快回收，并开启 TCP keepAlive 维持活性。
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
