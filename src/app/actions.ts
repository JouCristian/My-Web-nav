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

  await prisma.bookmark.create({
    data: { name, url, description }
  })

  revalidatePath("/")
}

export async function deleteBookmark(id: number) {
  await prisma.bookmark.delete({
    where: { id }
  })
  revalidatePath("/")
}

/**
 * 🚀 智能元数据抓取函数
 */
export async function fetchMetadata(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(5000) 
    });
    
    if (!response.ok) throw new Error("无法访问该网址");

    const html = await response.text();
    const $ = cheerio.load(html);

    // 提取标题并清洗 SEO 后缀
    let rawTitle = 
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[property="og:title"]').attr('content') || 
      $('title').text() || 
      '';

    let cleanTitle = rawTitle.split(/[-|_\—]/)[0].trim();
    if (cleanTitle.length > 15) {
      cleanTitle = cleanTitle.substring(0, 15) + '...';
    }

    // 提取描述
    let description = 
      $('meta[name="description"]').attr('content') || 
      $('meta[property="og:description"]').attr('content') || 
      '';
    
    if (description.length > 50) {
      description = description.substring(0, 50) + '...';
    }

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

/**
 * 🚀 更新新兵档案
 * 用于强制录入真实姓名、学号和飞书链接
 */
export async function updateRecruitProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("检测到非法访问请求：未识别的星际身份")

  const realName = formData.get("realName") as string
  const studentId = formData.get("studentId") as string
  const feishuLink = formData.get("feishuLink") as string

  if (!realName || !studentId) throw new Error("档案关键坐标缺失：真实姓名与学号为必填项")

  await prisma.user.update({
    where: { email: session.user.email },
    data: { 
      realName, 
      studentId, 
      feishuLink: feishuLink || null 
    }
  })

  revalidatePath("/dashboard")
}

/**
 * 🚀 撤销档案
 */
export async function revokeRecruitProfile() {
  const session = await auth()
  if (!session?.user?.email) throw new Error("未授权的操作")

  await prisma.user.update({
    where: { email: session.user.email },
    data: { 
      realName: null, 
      studentId: null, 
      feishuLink: null 
    }
  })

  revalidatePath("/dashboard")
}

/**
 * ==========================================
 * 👑 模块 3：指挥官行政指令 (Admin Operations)
 * 用于船员档案室的审核与权限任命
 * ==========================================
 */

/**
 * ✅ 1. 批准船员入舰
 * 将身份从 PENDING 提升为 MEMBER
 */
export async function approveCrew(userId: string) {
  const session = await auth()
  const operator = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } })
  
  if (operator?.role !== "OWNER" && operator?.role !== "ADMIN") {
    throw new Error("权限不足：只有管理层可执行此项重组序列")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "MEMBER" }
  })

  revalidatePath("/dashboard/crew")
}

/**
 * ❌ 2. 拒绝/退回申请
 * 重置其档案资料，使其回到 Status 1 重新填写
 */
export async function rejectCrew(userId: string) {
  const session = await auth()
  const operator = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } })
  
  if (operator?.role !== "OWNER" && operator?.role !== "ADMIN") {
    throw new Error("权限不足：非法覆盖申请序列")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { 
      realName: null, 
      studentId: null,
      feishuLink: null,
      role: "PENDING" 
    }
  })

  revalidatePath("/dashboard/crew")
}

/**
 * 🔱 3. 任命/撤销管理员身份
 * 仅限最高指挥官 (OWNER) 本人操作
 */
export async function toggleAdminRole(userId: string, makeAdmin: boolean) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("未授权访问")

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  
  // 🛡️ 绝对锁：只有舰长本人可以进行此操作
  if (currentUser?.role !== "OWNER") {
    throw new Error("权限溢出：只有最高指挥官可开启权限任命通道")
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser) throw new Error("目标坐标丢失")
  if (targetUser.role === "OWNER") throw new Error("无法修改最高指挥官自身的身份层级")

  await prisma.user.update({
    where: { id: userId },
    data: { role: makeAdmin ? "ADMIN" : "MEMBER" }
  })

  revalidatePath("/dashboard/crew")
}