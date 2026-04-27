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
  
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") {
    throw new Error("权限不足：非法操作指挥序列")
  }

  await prisma.announcement.delete({
    where: { id }
  })

  // 🚀 核心修复：刷新当前主中枢路径，彻底解决崩溃问题
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

/**
 * ==========================================
 * 🚀 模块 C：亚空间通讯协议 (实时集结接口)
 * ==========================================
 */

// 1. 发起全舰集结 (仅舰长/管理员)
export async function startGlobalRollCall(durationSeconds: number) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("Permission Denied")

  // 先把之前所有活跃的会话强行关闭
  await prisma.rollCallSession.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  })

  // 创建新会话
  const endTime = new Date(Date.now() + durationSeconds * 1000)
  const newSession = await prisma.rollCallSession.create({
    data: {
      creatorId: user.id,
      endTime: endTime,
      isActive: true
    }
  })

  revalidatePath("/dashboard/attendance")
  return newSession
}

// 2. 船员签到动作
export async function submitAttendance(sessionId: string) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) throw new Error("User not found")

  try {
    await prisma.attendanceRecord.create({
      data: {
        userId: user.id,
        sessionId: sessionId
      }
    })
    return { success: true }
  } catch (e) {
    return { success: false, error: "Already synced or expired" }
  }
}

// 3. 实时信号广播 (供全体船员雷达监听)
export async function checkLiveRollCall() {
  const now = new Date()
  const activeSession = await prisma.rollCallSession.findFirst({
    where: {
      isActive: true,
      endTime: { gt: now } // 必须未过期
    },
    include: {
      records: { include: { user: true } }
    }
  })

  if (!activeSession) return null

  return {
    id: activeSession.id,
    endTime: activeSession.endTime.getTime(),
    presentNames: activeSession.records.map(r => r.user.realName).filter(Boolean) as string[]
  }
}

/**
 * ==========================================
 * 🚀 模块 C-2：请假审批亚空间通讯协议
 * ==========================================
 */

// 1. 船员提交请假申请
export async function submitLeaveRequestAction(reason: string, startTime: string, endTime: string) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) throw new Error("User not found")

  await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      reason,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    }
  })
  revalidatePath("/dashboard/attendance")
}

// 2. 舰长/船员拉取实时请假列表
export async function getLeaveRequestsAction() {
  const session = await auth()
  if (!session?.user?.email) return []
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return []

  const isManager = user.role === "OWNER" || user.role === "ADMIN"
  
  let requests;
  if (isManager) {
    // 舰长能看到全舰所有的申请
    requests = await prisma.leaveRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })
  } else {
    // 普通船员只能看到自己的申请
    requests = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  return requests.map(r => ({
    id: r.id,
    applicant: r.user.realName || r.user.name || "Unknown",
    reason: r.reason,
    startTime: r.startTime.toISOString(),
    endTime: r.endTime.toISOString(),
    status: r.status,
    createdAt: r.createdAt.getTime()
  }))
}

// 3. 舰长执行审批动作
export async function updateLeaveStatusAction(id: string, status: "APPROVED" | "REJECTED") {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { email: session?.user?.email || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("Permission Denied")

  await prisma.leaveRequest.update({
    where: { id },
    data: { status, handledBy: user.id }
  })
  revalidatePath("/dashboard/attendance")
}