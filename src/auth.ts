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
      // 🚀 保持物理直连，确保线上环境 100% 成功
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
        const isCaptain = user.email === "zoujunyi869@gmail.com";
        
        // 🚀 恢复：核心军衔与皇冠标识字段
        // @ts-ignore
        session.user.role = isCaptain ? "OWNER" : (user.role || "PENDING");
        // @ts-ignore
        session.user.isCaptain = isCaptain;
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