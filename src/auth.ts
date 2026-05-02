// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

// 🚀 启动时校验 Gitee 凭据，缺失时给出清晰错误（避免 NextAuth 抛模糊的 "Configuration" 错误）
const GITEE_CLIENT_ID = process.env.GITEE_CLIENT_ID
const GITEE_CLIENT_SECRET = process.env.GITEE_CLIENT_SECRET

if (!GITEE_CLIENT_ID || !GITEE_CLIENT_SECRET) {
  console.error(
    "[v0][auth] Gitee OAuth 凭据缺失：请在 Vercel 项目环境变量里配置 GITEE_CLIENT_ID 和 GITEE_CLIENT_SECRET",
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 🚀 开启 debug：错误会在 Vercel Runtime Logs 里打出来真实原因
  debug: true,
  providers: [
    GitHub({
      authorization: { params: { prompt: "consent" } },
    }),
    {
      id: "gitee",
      name: "Gitee",
      type: "oauth",
      // 🚀 安全修复：从环境变量读取，不再硬编码（原硬编码密钥已泄露，必须在 Gitee 控制台重置）
      clientId: GITEE_CLIENT_ID!,
      clientSecret: GITEE_CLIENT_SECRET!,
      checks: ["state"], 
      // 🚀 核心修改：将简单的字符串替换为对象结构，强行注入强制授权参数
      authorization: {
        url: "https://gitee.com/oauth/authorize",
        params: { 
          scope: "user_info",
          prompt: "consent",          // OIDC 标准强制授权参数
          approval_prompt: "force"    // 老版 OAuth2 强制授权参数
        }
      },
      token: "https://gitee.com/oauth/token",
      userinfo: "https://gitee.com/api/v5/user",
      profile(profile: any) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || null, // 允许邮箱为空
          image: profile.avatar_url,
        }
      }
    }
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ user }) {
      // 🚀 只要有 id 即可放行，不再强行要求 email
      if (!user.email && !user.id) return false;
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        // 🚀 核心修复 1：将数据库的真实 CUID 强绑定到 session
        session.user.id = user.id;
        
        // 🚀 核心修复 2：优先信任数据库记录的 role，兜底判断特定邮箱
        // 如果此账号在数据库已经是 OWNER，就直接认定为舰长；否则看看是不是舰长邮箱
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
