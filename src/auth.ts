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
      // 🚀 核心防御：强制附带兜底字符串。防止环境变量未加载时，引擎物理销毁通道导致无限弹回登录页！
      clientId: process.env.GITEE_CLIENT_ID || "fall_back_id_to_prevent_crash",
      clientSecret: process.env.GITEE_CLIENT_SECRET || "fall_back_secret_to_prevent_crash",
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