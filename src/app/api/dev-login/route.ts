// src/app/api/dev-login/route.ts
// ⚠️ 开发环境快速登录通道
// 不依赖 OAuth 回调，直接在数据库创建 Session 行并下发 cookie。
// 生产环境（NODE_ENV === "production"）此路由会立即返回 403，安全可控。

import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/db"

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

export async function POST(req: NextRequest) {
  // 🛡️ 生产环境严禁使用
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev-login is disabled in production" }, { status: 403 })
  }

  const formData = await req.formData().catch(() => null)
  const role = String(formData?.get("role") || "MEMBER").toUpperCase()
  const preset = ROLE_PRESETS[role]

  if (!preset) {
    return NextResponse.json({ error: `invalid role: ${role}` }, { status: 400 })
  }

  // 同一角色复用同一账号
  const user = await prisma.user.upsert({
    where: { email: preset.email },
    update: {
      role: role as "OWNER" | "ADMIN" | "MEMBER" | "PENDING",
      name: preset.name,
      realName: preset.realName,
      studentId: preset.studentId,
    },
    create: {
      email: preset.email,
      name: preset.name,
      realName: preset.realName,
      studentId: preset.studentId,
      role: role as "OWNER" | "ADMIN" | "MEMBER" | "PENDING",
    },
  })

  // 在数据库写入 NextAuth Session 行
  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 天
  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  })

  // 根据协议选择 cookie 名（HTTPS 必须用 __Secure- 前缀）
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (req.nextUrl.protocol.replace(":", "") || "http")
  const isSecure = proto === "https"
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token"

  const res = NextResponse.redirect(new URL("/", req.url), { status: 303 })
  res.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    expires,
    path: "/",
  })
  return res
}
