import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

// 🚀 Supabase Pooler (Supavisor) 会主动关闭空闲连接，serverless 场景下 pg.Pool
// 必须做以下配置，否则会出现 "Server has closed the connection" 错误：
// 1. max=1：serverless 函数单实例只需 1 条连接，避免连接数爆炸
// 2. idleTimeoutMillis=10s：客户端先于服务端关闭空闲连接，避免使用 stale 连接
// 3. connectionTimeoutMillis=10s：连接慢时尽早失败而不是无限等
// 4. keepAlive=true：开启 TCP keep-alive，第一时间感知连接被服务端关闭
// 5. pool.on('error')：必须监听，否则 stale 连接抛错时会 crash 整个 Node 进程
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaPool: Pool | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL
  if (!connectionString) {
    throw new Error("缺少 DATABASE_URL 或 DIRECT_URL，无法连接数据库。")
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
    allowExitOnIdle: true,
  })

  // 🚀 关键：监听 pool 错误事件，避免 idle 连接被服务端关闭时未捕获错误导致进程崩溃
  pool.on("error", (err) => {
    console.error("[v0][db] pg pool error (idle client likely closed by server):", err.message)
  })

  // dev 环境 HMR 时，把旧的 pool 也释放掉，防止句柄泄漏
  if (process.env.NODE_ENV !== "production" && globalForPrisma.prismaPool) {
    globalForPrisma.prismaPool.end().catch(() => {})
  }
  globalForPrisma.prismaPool = pool

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
