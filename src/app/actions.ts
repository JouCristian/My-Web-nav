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
 * 🛡️ 模块 2：指挥中枢权限与档案管理
 * ==========================================
 */

/**
 * 🚀 新增：处理新兵档案补全的 Server Action 
 * 该函数用于强制录入真实姓名与学号，这是进入指挥中枢的先决条件
 */
export async function updateRecruitProfile(formData: FormData) {
  // 1. 获取当前会话，确保操作者已登录
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("检测到非法访问请求：未识别的星际身份")
  }

  // 2. 提取并校验表单数据 [cite: 76-84]
  const realName = formData.get("realName") as string
  const studentId = formData.get("studentId") as string
  const feishuLink = formData.get("feishuLink") as string

  // 严格执行白皮书要求的必填项校验 
  if (!realName || !studentId) {
    throw new Error("档案关键坐标缺失：真实姓名与学号为必填项")
  }

  // 3. 同步至星际数据库 (Prisma User 表) [cite: 62]
  await prisma.user.update({
    where: { email: session.user.email },
    data: { 
      realName, 
      studentId, 
      feishuLink: feishuLink || null 
    }
  })

  // 4. 指令刷新：通知 dashboard 页面重新校验状态 [cite: 20]
  // 提交后，拦截器会检测到 realName 已存在，从而进入“待核准”或“放行”状态
  revalidatePath("/dashboard")
}