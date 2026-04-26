"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// 🔒 权限校验引擎：只允许 OWNER 和 ADMIN 操作
async function verifyCommandAuth() {
  const session = await auth()
  if (!session?.user?.email) return null
  
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  })
  
  if (user?.role === "OWNER" || user?.role === "ADMIN") {
    return user
  }
  return null
}

// 🚀 1. 发布全舰广播
export async function createBroadcast(formData: FormData) {
  const commander = await verifyCommandAuth()
  if (!commander) throw new Error("Access Denied: 指挥权限不足")

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const type = formData.get("type") as string // "INFO" | "UPDATE" | "ALERT"

  if (!title || !content || !type) {
    throw new Error("参数不完整，无法发射广播信号")
  }

  await prisma.announcement.create({
    data: {
      title,
      content,
      type,
      authorId: commander.id
    }
  })

  // 刷新公告大屏缓存
  revalidatePath("/dashboard/board")
}

// 🚀 2. 销毁过期广播
export async function deleteBroadcast(announcementId: string) {
  const commander = await verifyCommandAuth()
  if (!commander) throw new Error("Access Denied: 指挥权限不足")

  await prisma.announcement.delete({
    where: { id: announcementId }
  })

  revalidatePath("/dashboard/board")
}