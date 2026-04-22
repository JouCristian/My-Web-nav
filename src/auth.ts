// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db" //

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  pages: {
    signIn: '/login', // 🚀 所有的登录请求都会被重定向到我们自定义的登录页
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // @ts-ignore 将数据库中的 ID 存入 Session
        session.user.id = user.id;
        // 🔒 定义真正的“舰长”权限：只有该邮箱登录，isCaptain 才会为真
        // @ts-ignore
        session.user.isCaptain = user.email === "zoujunyi869@gmail.com";
      }
      return session
    },
  },
})