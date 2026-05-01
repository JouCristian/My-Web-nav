"use server"

// ⚠️ 开发环境快速登录 Server Action
// 用 Next.js 官方 cookies() API 写入 cookie，比 NextResponse.redirect + 手动 set-cookie 更可靠，
// 尤其在 v0 沙箱预览环境（多层代理）下。生产环境立即抛错保护安全。

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/db"
import type { Role } from "@prisma/client"

const ROLE_PRESETS: Record<
  string,
  { email: string; name: string; realName: string | null; studentId: string | null }
> = {
  OWNER: {
    email: "dev-owner@v0.local",
    name: "[DEV] 测试舰长",
    realName: "测试舰长",
    studentId: "DEV-CAPTAIN-001",
  },
  ADMIN: {
    email: "dev-admin@v0.local",
    name: "[DEV] 测试管理员",
    realName: "测试管理员",
    studentId: "DEV-ADMIN-001",
  },
  MEMBER: {
    email: "dev-member@v0.local",
    name: "[DEV] 测试船员",
    realName: "测试船员",
    studentId: "DEV-MEMBER-001",
  },
  PENDING: {
    email: "dev-pending@v0.local",
    name: "[DEV] 待审核访客",
    realName: null,
    studentId: null,
  },
}

export async function devLoginAction(formData: FormData) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("dev-login is disabled in production")
  }

  const role = String(formData.get("role") || "MEMBER").toUpperCase() as keyof typeof ROLE_PRESETS
  const redirectTo = String(formData.get("redirectTo") || "/dashboard")
  const preset = ROLE_PRESETS[role]
  if (!preset) throw new Error(`invalid role: ${role}`)

  // upsert 测试用户（同角色复用）
  const user = await prisma.user.upsert({
    where: { email: preset.email },
    update: {
      role: role as Role,
      name: preset.name,
      realName: preset.realName,
      studentId: preset.studentId,
    },
    create: {
      email: preset.email,
      name: preset.name,
      realName: preset.realName,
      studentId: preset.studentId,
      role: role as Role,
    },
  })

  // 在 DB 写入 NextAuth Session 行（与 PrismaAdapter database session 策略对齐）
  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 天
  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  })

  // 同时下发两个可能的 cookie 名（NextAuth v5 在 HTTPS 用 __Secure- 前缀，HTTP 不带）
  // 双写消除协议判断歧义，auth() 读哪个都能命中
  const cookieStore = await cookies()
  const baseOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    expires,
    path: "/",
  }
  cookieStore.set("authjs.session-token", sessionToken, { ...baseOptions, secure: false })
  cookieStore.set("__Secure-authjs.session-token", sessionToken, { ...baseOptions, secure: true })

  console.log("[v0] dev-login Server Action success", {
    role,
    userId: user.id,
    email: user.email,
    sessionToken: sessionToken.slice(0, 8) + "...",
    redirectTo,
  })

  redirect(redirectTo)
}
