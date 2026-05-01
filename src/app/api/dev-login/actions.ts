"use server"

// 开发环境快速登录 Server Action
// 不再走 NextAuth 的 sessionToken / database session 路径（在 v0 沙箱代理下 cookie 不稳）
// 改为：upsert dev 测试用户 + 设置一个简单的 v0-dev-role cookie，
// 所有页面通过 src/lib/get-session.ts 的 getSession() 来识别 dev 角色

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
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

  // 确保 dev 测试用户在数据库中存在且角色正确
  await prisma.user.upsert({
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

  // 设置非 httpOnly 业务 cookie，所有页面通过 getSession() 识别
  const cookieStore = await cookies()
  cookieStore.set("v0-dev-role", role, {
    httpOnly: false, // 非 httpOnly，方便在 DevTools 验证
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  })

  redirect(redirectTo)
}

export async function devLogoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("v0-dev-role")
  redirect("/login")
}
