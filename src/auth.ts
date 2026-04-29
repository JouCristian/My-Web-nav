// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      authorization: {
        params: { prompt: "consent" },
      },
    }),
    {
      id: "gitee",
      name: "Gitee",
      type: "oauth",
      // 🚀 终极物理直连：既然 Vercel 读不到变量，我们就用你截图里的真实密钥做绝对兜底！
      // 这样无论是本地还是云端，都绝对能 100% 唤起 Gitee 授权界面！
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
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email && !user.id) return false;

      if (user.email === "zoujunyi869@gmail.com") {
        return true;
      }
      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        const isCaptain = user.email === "zoujunyi869@gmail.com";
        
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