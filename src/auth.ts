// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Gitee from "next-auth/providers/gitee" // 🚀 1. 新增：引入 Gitee 核心引擎
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      // 强制每次要求授权，确保账号切换灵活性
      authorization: {
        params: { prompt: "consent" },
      },
    }),
    // 🚀 2. 新增：激活 Gitee 跃迁通道
    Gitee({
      clientId: process.env.GITEE_CLIENT_ID,
      clientSecret: process.env.GITEE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    // 1. 准入拦截逻辑
    async signIn({ user }) {
      if (!user.email) return false;

      // 舰长绝对直通车：识别硬编码邮箱，无视任何拦截
      if (user.email === "zoujunyi869@gmail.com") {
        return true;
      }

      // 普通船员目前允许登录，后续可以在此处增加黑名单或邀请制校验
      return true;
    },

    // 2. 身份与军衔注入
    async session({ session, user }) {
      if (session.user) {
        // 注入基础 ID
        session.user.id = user.id;

        // 识别是否为舰长 (Lv3 OWNER)
        const isCaptain = user.email === "zoujunyi869@gmail.com";
        
        // 注入白皮书要求的核心档案字段 
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