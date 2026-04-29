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
    // 🚀 手写原生 Gitee 跃迁引擎：使用标准的 OAuth2 协议对接
    {
      id: "gitee",
      name: "Gitee",
      type: "oauth",
      clientId: process.env.GITEE_CLIENT_ID,
      clientSecret: process.env.GITEE_CLIENT_SECRET,
      authorization: {
        url: "https://gitee.com/oauth/authorize",
        params: { scope: "user_info" } // 申请获取用户的基础信息
      },
      token: "https://gitee.com/oauth/token",
      userinfo: "https://gitee.com/api/v5/user",
      profile(profile: any) {
        // 将 Gitee 的数据结构转化为星舰识别的标准格式
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || null, // Gitee 邮箱可能是私密的
          image: profile.avatar_url,
        }
      }
    }
  ],
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    // 1. 准入拦截逻辑
    async signIn({ user, account }) {
      // 🚀 核心修复：如果是普通登录且没有邮箱，或者没有ID，才拦截。
      // 因为 Gitee 用户可能没有公开邮箱，我们不能盲目拦截，只要有合法的第三方授权 ID 就放行
      if (!user.email && !user.id) return false;

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