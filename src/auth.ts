// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      // 🚀 核心修改：强制每次都要求同意授权，打断 GitHub 的自动放行
      authorization: {
        params: { prompt: "consent" },
      },
    }),
  ],
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = user.id;
        // @ts-ignore
        session.user.isCaptain = user.email === "zoujunyi869@gmail.com";
      }
      return session
    },
  },
})