"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function checkManager() {
  const session = await auth()
  if (!session?.user?.email) return false
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  return user?.role === "OWNER" || user?.role === "ADMIN"
}

export async function approveUser(userId: string) {
  const isManager = await checkManager()
  if (!isManager) throw new Error("Unauthorized: 权限不足")

  await prisma.user.update({
    where: { id: userId },
    data: { role: "MEMBER" }
  })

  revalidatePath("/dashboard/crew")
}

export async function rejectUser(userId: string) {
  const isManager = await checkManager()
  if (!isManager) throw new Error("Unauthorized: 权限不足")

  await prisma.user.delete({
    where: { id: userId }
  })

  revalidatePath("/dashboard/crew")
}