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

// 🚀 3. 强制驱逐：将正式船员直接抹除
export async function expelUser(userId: string) {
  const isManager = await checkManager()
  if (!isManager) throw new Error("Unauthorized: 权限不足")

  // 🛡️ 安全锁：防止误删最高指挥官
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (targetUser?.role === "OWNER") {
    throw new Error("Access Denied: 无法驱逐舰队最高指挥官")
  }

  // 执行物理抹除
  await prisma.user.delete({
    where: { id: userId }
  })

  revalidatePath("/dashboard/crew")
}
// 🚀 4. 任命/撤销管理员：舰长专属特权
export async function toggleAdminRole(userId: string, makeAdmin: boolean) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  // 🛡️ 绝对安全锁：只有舰长本人可以进行此操作
  if (currentUser?.role !== "OWNER") {
    throw new Error("Access Denied: 只有最高指挥官可以任命管理员")
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser) throw new Error("Target missing")
  if (targetUser.role === "OWNER") throw new Error("Cannot modify OWNER role")

  // 执行神级权限重写
  await prisma.user.update({
    where: { id: userId },
    data: { role: makeAdmin ? "ADMIN" : "MEMBER" }
  })

  revalidatePath("/dashboard/crew")
}

// 🚀 5. 更新档案室显示信息：每个船员可以编辑自己的档案室信息
export async function updateCrewProfile(data: {
  crewNickname?: string
  crewStudentId?: string
  crewFeishuLink?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized: 请先登录")

  // 验证飞书链接格式（如果提供）
  if (data.crewFeishuLink && data.crewFeishuLink.trim()) {
    const feishuPattern = /^https?:\/\/(.*\.)?(feishu\.cn|larksuite\.com)/i
    if (!feishuPattern.test(data.crewFeishuLink.trim())) {
      throw new Error("Invalid: 请输入有效的飞书链接")
    }
  }

  // 更新当前用户的档案室信息
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      crewNickname: data.crewNickname?.trim() || null,
      crewStudentId: data.crewStudentId?.trim() || null,
      crewFeishuLink: data.crewFeishuLink?.trim() || null,
    }
  })

  revalidatePath("/dashboard/crew")
}

// 🚀 6. 获取当前用户的档案室信息
export async function getMyCrewProfile() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      crewNickname: true,
      crewStudentId: true,
      crewFeishuLink: true,
      realName: true,
      studentId: true,
      feishuLink: true,
    }
  })

  return user
}
