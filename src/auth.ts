// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import type { Session } from "next-auth"

const nextAuthInstance = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 显式声明 secret + trustHost，避免依赖外部环境变量在预览环境失效。
  // 生产环境会被 Vercel 项目环境变量 AUTH_SECRET 自动覆盖，dev/preview 走 fallback 字符串。
  secret: process.env.AUTH_SECRET ?? "dev-preview-fallback-secret-not-for-production-use-32chars",
  trustHost: true,
  providers: [
    GitHub({
      authorization: { params: { prompt: "consent" } },
    }),
    {
      id: "gitee",
      name: "Gitee",
      type: "oauth",
      clientId: "96896797496af99879527f0e725286efc03d879624525c08eec27002d3a728e2",
      clientSecret: "3ee1da994bc4e54fcedc0098293756e456d8b19cc3340be504422e96f394dcf2",
      checks: ["state"],
      authorization: {
        url: "https://gitee.com/oauth/authorize",
        params: {
          scope: "user_info",
          prompt: "consent",
          approval_prompt: "force"
        }
      },
      token: "https://gitee.com/oauth/token",
      userinfo: "https://gitee.com/api/v5/user",
      profile(profile: any) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || null,
          image: profile.avatar_url,
        }
      }
    }
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ user }) {
      if (!user.email && !user.id) return false;
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const isCaptainEmail = user.email === "zoujunyi869@gmail.com";
        const finalRole = (user.role === "OWNER" || isCaptainEmail) ? "OWNER" : (user.role || "PENDING");

        // @ts-ignore
        session.user.role = finalRole;
        // @ts-ignore
        session.user.isCaptain = finalRole === "OWNER";
        // @ts-ignore
        session.user.realName = user.realName;
        // @ts-ignore
        session.user.studentId = user.studentId;
        // @ts-ignore
        session.user.feishuLink = user.feishuLink;
      }
      return session;
    },
  },
})

export const handlers = nextAuthInstance.handlers
export const signIn = nextAuthInstance.signIn
export const signOut = nextAuthInstance.signOut

// 原 NextAuth 的 auth() 函数（仅在内部使用）
const _authReal = nextAuthInstance.auth

// === 开发环境快速登录支持 ===
// 业务 cookie：v0-dev-role（值为 OWNER/ADMIN/MEMBER/PENDING），由 dev-login Server Action 写入
// 此机制仅在 NODE_ENV !== "production" 时启用，生产构建零开销
const DEV_EMAIL_BY_ROLE: Record<string, string> = {
  OWNER: "dev-owner@v0.local",
  ADMIN: "dev-admin@v0.local",
  MEMBER: "dev-member@v0.local",
  PENDING: "dev-pending@v0.local",
}

async function buildDevSession(role: string): Promise<Session | null> {
  const email = DEV_EMAIL_BY_ROLE[role.toUpperCase()]
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const isCaptain = user.role === "OWNER" || user.email === "zoujunyi869@gmail.com"
  return {
    user: {
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
      // @ts-ignore
      role: isCaptain ? "OWNER" : user.role ?? "PENDING",
      // @ts-ignore
      isCaptain,
      // @ts-ignore
      realName: user.realName ?? null,
      // @ts-ignore
      studentId: user.studentId ?? null,
      // @ts-ignore
      feishuLink: user.feishuLink ?? null,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  } as Session
}

// 包装后的 auth()：先走真实 NextAuth，失败时在 dev 环境检查 v0-dev-role cookie
// 调用方完全无感，所有 30+ 个 await auth() 调用点不需要改动
export const auth: typeof _authReal = (async (...args: any[]) => {
  // 真实路径
  // @ts-ignore - args 透传
  const real = await _authReal(...args)
  if (real?.user?.id) return real

  // 仅 dev 环境兜底
  if (process.env.NODE_ENV === "production") return real

  try {
    const cookieStore = await cookies()
    const role = cookieStore.get("v0-dev-role")?.value
    if (!role) return real
    const dev = await buildDevSession(role)
    return dev ?? real
  } catch {
    return real
  }
}) as typeof _authReal
