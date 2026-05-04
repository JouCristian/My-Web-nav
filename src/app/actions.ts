// src/app/actions.ts
'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import * as cheerio from 'cheerio'
import { auth, signIn} from "@/auth"

/**
 * ==========================================
 * 🔖 模块 1：导航书签管理
 * ==========================================
 */

// 图标抓取辅助函数
async function fetchFaviconForBookmark(websiteUrl: string): Promise<string | null> {
  const FAVICON_PATHS = ['/favicon.ico', '/favicon.png', '/favicon.svg', '/apple-touch-icon.png']
  
  const imageToBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(3000)
      })
      if (!response.ok) return null
      const contentType = response.headers.get('content-type') || 'image/x-icon'
      const buffer = await response.arrayBuffer()
      return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`
    } catch { return null }
  }

  try {
    const urlObj = new URL(websiteUrl)
    const baseUrl = urlObj.origin

    // 从 HTML 中提取
    try {
      const response = await fetch(websiteUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        const html = await response.text()
        const linkRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/gi
        let match
        while ((match = linkRegex.exec(html)) !== null) {
          let href = match[1]
          if (href.startsWith('//')) href = 'https:' + href
          else if (href.startsWith('/')) href = baseUrl + href
          else if (!href.startsWith('http')) href = baseUrl + '/' + href
          const base64 = await imageToBase64(href)
          if (base64) return base64
        }
      }
    } catch { /* continue */ }

    // 尝试常见路径
    for (const path of FAVICON_PATHS) {
      const base64 = await imageToBase64(baseUrl + path)
      if (base64) return base64
    }

    // Google Favicon 服务作为后备
    return await imageToBase64(`https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`)
  } catch { return null }
}

type BookmarkCategory = 'TOOL' | 'DOC' | 'TUTORIAL' | 'RESOURCE' | 'COMMUNITY' | 'OTHER'

export async function addBookmark(formData: FormData) {
  const name = formData.get("name") as string
  const url = formData.get("url") as string
  const description = formData.get("description") as string
  const category = (formData.get("category") as BookmarkCategory) || 'OTHER'
  
  // 异步抓取图标
  const iconSvg = await fetchFaviconForBookmark(url)
  
  await prisma.bookmark.create({ 
    data: { name, url, description, category, iconSvg } 
  })
  revalidatePath("/")
}

// 手动更新书签图标
export async function refreshBookmarkIcon(id: number) {
  const bookmark = await prisma.bookmark.findUnique({ where: { id } })
  if (!bookmark) return { error: "书签不存在" }
  
  const iconSvg = await fetchFaviconForBookmark(bookmark.url)
  await prisma.bookmark.update({ where: { id }, data: { iconSvg } })
  revalidatePath("/")
  return { success: true }
}

// 获取统计数据
export async function getStats() {
  try {
    const [bookmarkCount, crewCount] = await Promise.all([
      prisma.bookmark.count(),
      prisma.user.count({ where: { role: { in: ['MEMBER', 'ADMIN', 'OWNER'] } } })
    ])
    
    // 今日访问次数 - 简化版本，可后续扩展为真实统计
    const todayVisits = Math.floor(Math.random() * 50) + 10 // 临时模拟数据
    
    return { bookmarkCount, crewCount, todayVisits }
  } catch (error) {
    console.error("Failed to get stats:", error)
    return { bookmarkCount: 0, crewCount: 0, todayVisits: 0 }
  }
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
  if (!session?.user?.id) throw new Error("检测到非法访问请求")
  const realName = formData.get("realName") as string
  const studentId = formData.get("studentId") as string
  const feishuLink = formData.get("feishuLink") as string
  if (!realName || !studentId) throw new Error("档案关键坐标缺失")
  await prisma.user.update({
    where: { id: session.user.id },
    data: { realName, studentId, feishuLink: feishuLink || null }
  })
  revalidatePath("/dashboard")
}

export async function revokeRecruitProfile() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("未授权的操作")
  await prisma.user.update({
    where: { id: session.user.id },
    data: { realName: null, studentId: null, feishuLink: null }
  })
  revalidatePath("/dashboard")
}

/**
 * ==========================================
 * 👑 模块 3：指挥官行政指令 (Admin Operations)
 * ==========================================
 */
export async function deleteBroadcast(id: string) {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("权限不足：非法操作指挥序列")
  await prisma.announcement.delete({ where: { id } })
  revalidatePath("/dashboard") 
}

export async function approveCrew(userId: string) {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("权限不足")
  await prisma.user.update({ where: { id: userId }, data: { role: "MEMBER" } })
  revalidatePath("/dashboard/crew")
}

export async function rejectCrew(userId: string) {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("权限不足")
  await prisma.user.update({ where: { id: userId }, data: { realName: null, studentId: null, feishuLink: null, role: "PENDING" } })
  revalidatePath("/dashboard/crew")
}

export async function toggleAdminRole(userId: string, makeAdmin: boolean) {
  const session = await auth()
  const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
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

export async function startGlobalRollCall(durationSeconds: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("Permission Denied")

  await prisma.rollCallSession.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  })

  const endTime = new Date(Date.now() + durationSeconds * 1000)
  const newSession = await prisma.rollCallSession.create({
    data: { creatorId: user.id, endTime: endTime, isActive: true }
  })

  revalidatePath("/dashboard/attendance")
  return newSession
}

export async function submitAttendance(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("User not found")

  const existingRecord = await prisma.attendanceRecord.findFirst({
    where: { userId: user.id, sessionId: sessionId }
  })

  if (existingRecord) {
    return { success: true } 
  }

  try {
    await prisma.attendanceRecord.create({
      data: { userId: user.id, sessionId: sessionId }
    })
    revalidatePath("/dashboard/attendance")
    return { success: true }
  } catch (e) {
    return { success: false, error: "Sync failed" }
  }
}

export async function checkLiveRollCall() {
  const now = new Date()
  const activeSession = await prisma.rollCallSession.findFirst({
    where: { isActive: true, endTime: { gt: now } },
    include: { records: { include: { user: true } } }
  })

  if (!activeSession) return null

  return {
    id: activeSession.id,
    endTime: activeSession.endTime.getTime(),
    presentNames: activeSession.records.map(r => r.user.realName || r.user.nickname || r.user.name).filter(Boolean) as string[]
  }
}

export async function getRollCallHistoryAction() {
  const session = await auth()
  if (!session?.user?.id) return []

  const sessions = await prisma.rollCallSession.findMany({
    include: { records: { include: { user: true } } },
    orderBy: { startTime: 'desc' }
  })

  return sessions.map(s => ({
    id: s.id,
    timestamp: s.startTime.getTime(),
    present: s.records.map(r => r.user.realName || r.user.nickname || r.user.name || "Unknown").filter(Boolean) as string[],
    isActive: s.isActive
  }))
}

export async function deleteRollCallSessionAction(sessionId: string) {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("Permission Denied")
  await prisma.rollCallSession.delete({ where: { id: sessionId } })
  revalidatePath("/dashboard/attendance")
}

export async function markCrewPresentAction(sessionId: string, crewName: string) {
  const session = await auth()
  const admin = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
  if (admin?.role !== "OWNER" && admin?.role !== "ADMIN") throw new Error("Permission Denied")
  
  const targetUser = await prisma.user.findFirst({
    where: { OR: [{ realName: crewName }, { nickname: crewName }, { name: crewName }] }
  })
  if (!targetUser) throw new Error("Target crew not found")

  const existing = await prisma.attendanceRecord.findFirst({
    where: { userId: targetUser.id, sessionId: sessionId }
  })

  if (!existing) {
    await prisma.attendanceRecord.create({
      data: { userId: targetUser.id, sessionId: sessionId }
    })
  }
  revalidatePath("/dashboard/attendance")
}

/**
 * ==========================================
 * 🚀 模块 C-2：请假审批亚空间通讯协议
 * ==========================================
 */
export async function submitLeaveRequestAction(reason: string, startTime: string, endTime: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("User not found")

  await prisma.leaveRequest.create({
    data: { userId: user.id, reason, startTime: new Date(startTime), endTime: new Date(endTime) }
  })
  revalidatePath("/dashboard/attendance")
}

export async function getLeaveRequestsAction() {
  const session = await auth()
  if (!session?.user?.id) return []
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return []

  const isManager = user.role === "OWNER" || user.role === "ADMIN"
  
  let requests;
  if (isManager) {
    requests = await prisma.leaveRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })
  } else {
    requests = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  return requests.map(r => ({
    id: r.id,
    applicant: r.user.realName || r.user.name || r.user.nickname || r.user.githubName || "Unknown",
    reason: r.reason,
    startTime: r.startTime.toISOString(),
    endTime: r.endTime.toISOString(),
    status: r.status,
    createdAt: r.createdAt.getTime()
  }))
}

export async function updateLeaveStatusAction(id: string, status: "APPROVED" | "REJECTED") {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") throw new Error("Permission Denied")

  await prisma.leaveRequest.update({
    where: { id },
    data: { status, handledBy: user.id }
  })
  revalidatePath("/dashboard/attendance")
}

export async function revokeLeaveRequestAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  await prisma.leaveRequest.delete({ where: { id } })
  revalidatePath("/dashboard/attendance")
}

export async function bindOAuthAction(formData: FormData) {
  const provider = formData.get("provider") as string
  await signIn(provider, { redirectTo: "/profile" })
}

export async function mergeAccountsAction() {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "未授权的访问" }
    await new Promise(resolve => setTimeout(resolve, 1500))
    return { success: true }
  } catch (error) {
    return { success: false, error: "数据合并失败，存在引力波干扰" }
  }
}

export async function removeCrewAction(userId: string) {
  const session = await auth()
  const admin = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
  if (admin?.role !== "OWNER" && admin?.role !== "ADMIN") {
    throw new Error("权限不足：非法操作指挥序列")
  }
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (targetUser?.role === "OWNER") {
    throw new Error("指令驳回：无法对最高指挥官执行抹除操作")
  }
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath("/dashboard/crew")
}

/**
 * ==========================================
 * 🌌 航行日志 (Flight Log Sync)
 * ==========================================
 */

// 🚀 1. 获取全舰共享日志 (面向全体船员)
export async function getFlightLogs() {
  const session = await auth()
  if (!session?.user?.id) return { error: "未授权" }

  try {
    const logs = await prisma.flightLog.findMany()
    
    const logRecord: Record<string, any> = {}
    logs.forEach(log => {
      logRecord[log.date] = {
        title: log.title,
        time: log.time,
        content: log.content
      }
    })
    return { data: logRecord }
  } catch (error) {
    return { error: "获取日志失败" }
  }
}

// 🚀 2. 同步/创建日志 (严格验证指挥官权限)
export async function syncFlightLog(date: string, title: string, time: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "未授权" }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (dbUser?.role !== "OWNER" && dbUser?.role !== "ADMIN") {
    return { error: "权限不足：仅指挥序列可录入航行日志" }
  }

  try {
    await prisma.flightLog.upsert({
      where: { date: date },
      update: { title, time, content, userId: session.user.id },
      create: {
        userId: session.user.id,
        date: date,
        title: title,
        time: time,
        content: content,
      }
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "数据库写入失败" }
  }
}

// 🚀 3. 删除日志 (严格验证指挥官权限)
export async function deleteFlightLog(date: string) {
  const session = await auth()
  
  const dbUser = await prisma.user.findUnique({ where: { id: session?.user?.id || "" } })
  if (dbUser?.role !== "OWNER" && dbUser?.role !== "ADMIN") {
    return { error: "权限不足：仅指挥序列可销毁档案" }
  }

  try {
    await prisma.flightLog.delete({
      where: { date: date }
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "删除失败" }
  }
}
