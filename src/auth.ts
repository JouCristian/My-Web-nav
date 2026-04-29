// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
      authorization: "https://gitee.com/oauth/authorize?scope=user_info",
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