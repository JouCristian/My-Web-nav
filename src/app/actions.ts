'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import * as cheerio from 'cheerio'
import { auth } from "@/auth"

/**
 * ==========================================
 * 🔖 模块 1：导航书签管理
 * ==========================================
 */
export async function addBookmark(formData: FormData) {
  const name = formData.get("name") as string
  const url = formData.get("url") as string
  const description = formData.get("description") as string
  await prisma.bookmark.create({ data: { name, url, description } })
  revalidatePath("/")
}

export async function deleteBookmark(id: number) {
  await prisma.bookmark.delete({ where: { id } })
  revalidatePath("/")
}

export async function fetchMetadata(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(5000) 
    });
    if (!response.ok) throw new Error("无法访问该网址");
    const html = await response.text();
    const $ = cheerio.load(html);
    let rawTitle = $('meta[property="og:site_name"]').attr('content') || $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    let cleanTitle = rawTitle.split(/[-|_\—]/)[0].trim();
    if (cleanTitle.length > 15) cleanTitle = cleanTitle.substring(0, 15) + '...';
    let description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    if (description.length > 50) description = description.substring(0, 50) + '...';
    return { success: true, title: cleanTitle, description };
  } catch (error) {
    console.error("抓取失败:", error);
    return { success: false, title: '', description: '' };
  }
}

/**
 * ==========================================
 * 🛡️ 模块 2：个人档案管理
 * ==========================================
 */
export async function updateRecruitProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("检测到非法访问请求")
  const realName = formData.get("realName") as string
  const studentId = formData.get("studentId") as string
  const feishuLink = formData.get("feishuLink") as string
  if (!realName || !studentId) throw new Error("档案关键坐标缺失")
  await prisma.user.update({
    where: { email: session.user.email },
    data: { realName, studentId, feishuLink: feishuLink || null }
  })
  revalidatePath("/dashboard")
}

export async function revokeRecruitProfile() {
  const session = await auth()
  if (!session?.user?.email) throw new Error("未授权的操作")
  await prisma.user.update({
    where: { email: session.user.email },
    data: { realName: null, studentId: null, feishuLink: null }
  })
  revalidatePath("/dashboard")
}

/**
 * ==========================================
 * 👑 模块 3：指挥官行政指令 (Admin Operations)
 * ==========================================
 */

// 🚀 核心修复：执行销毁并刷新主中枢，解决 image_a937ba.png 的 crash
export async function deleteBroadcast(id: string) {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("权限不足")

  await prisma.announcement.delete({ where: { id } })
  
  // 必须刷新 /dashboard 路径
  revalidatePath("/dashboard") 
}

export async function approveCrew(userId: string) {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("权限不足")
  await prisma.user.update({ where: { id: userId }, data: { role: "MEMBER" } })
  revalidatePath("/dashboard/crew")
}

export async function rejectCrew(userId: string) {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("权限不足")
  await prisma.user.update({ where: { id: userId }, data: { realName: null, studentId: null, feishuLink: null, role: "PENDING" } })
  revalidatePath("/dashboard/crew")
}

export async function toggleAdminRole(userId: string, makeAdmin: boolean) {
  const session = await auth()
  const currentUser = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } })
  if (currentUser?.role !== "OWNER") throw new Error("仅最高指挥官可进行任命")
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser || targetUser.role === "OWNER") throw new Error("无法修改目标")
  await prisma.user.update({ where: { id: userId }, data: { role: makeAdmin ? "ADMIN" : "MEMBER" } })
  revalidatePath("/dashboard/crew")
}