"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function verifyCommandAuth() {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } })
  return (user?.role === "OWNER" || user?.role === "ADMIN") ? user : null
}

export async function createBroadcast(formData: FormData) {
  const commander = await verifyCommandAuth()
  if (!commander) throw new Error("指挥权限不足")

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const type = formData.get("type") as string
  const isPinned = formData.get("isPinned") === "true" // 🚀 接收置顶状态

  await prisma.announcement.create({
    data: { title, content, type, isPinned, authorId: commander.id }
  })
  revalidatePath("/dashboard/board")
}

export async function deleteBroadcast(announcementId: string) {
  const commander = await verifyCommandAuth()
  if (!commander) throw new Error("权限不足")
  await prisma.announcement.delete({ where: { id: announcementId } })
  revalidatePath("/dashboard/board")
}