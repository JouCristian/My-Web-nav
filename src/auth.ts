// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({ authorization: { params: { prompt: "consent" } } }),
    {
      id: "gitee",
      name: "Gitee",
      type: "oauth",
      // 🚀 直接硬编码你截图里的真实密钥，确保线上 100% 能唤起授权
      clientId: process.env.GITEE_CLIENT_ID || "96896797496af99879527f0e725286efc03d879624525c08eec27002d3a728e2",
      clientSecret: process.env.GITEE_CLIENT_SECRET || "3ee1da994bc4e54fcedc0098293756e456d8b19cc3340be504422e96f394dcf2",
      authorization: {
        url: "https://gitee.com/oauth/authorize",
        params: { scope: "user_info" } 
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
    async signIn({ user, account, profile }) {
      if (!user.email && !user.id) return false;
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const isCaptain = user.email === "zoujunyi869@gmail.com";
        // @ts-ignore
        session.user.role = isCaptain ? "OWNER" : (user.role || "PENDING");
      }
      return session;
    },
  },
})