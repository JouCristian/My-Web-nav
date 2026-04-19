'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import * as cheerio from 'cheerio'

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
  // 根据唯一标识 ID 删除数据
  await prisma.bookmark.delete({
    where: { id }
  })

  // 同样，告诉页面：数据变了，重新渲染
  revalidatePath("/")
}

// 🚀 新增的爬虫函数
export async function fetchMetadata(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      // 增加超时限制，防止被一直卡住
      signal: AbortSignal.timeout(5000) 
    });
    
    if (!response.ok) throw new Error("无法访问该网址");

    const html = await response.text();
    const $ = cheerio.load(html);

    // ==========================================
    // 🧠 核心升级：智能提取与清洗逻辑
    // ==========================================

    // 1. 优先获取专为分享设计的 OpenGraph 标题（通常比 <title> 干净得多）
    let rawTitle = 
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[property="og:title"]').attr('content') || 
      $('title').text() || 
      '';

    // 2. 清洗恶心的 SEO 后缀 (遇到 | - _ 等符号直接砍掉后面的)
    // 比如 "一生一芯 | 中国科学院..." -> "一生一芯"
    let cleanTitle = rawTitle.split(/[-|_\—]/)[0].trim();

    // 3. 如果网站没用分隔符，纯纯是一长串，我们就强行截断 (比如最长保留 15 个字)
    if (cleanTitle.length > 15) {
      cleanTitle = cleanTitle.substring(0, 15) + '...';
    }

    // 4. 清洗描述 (如果太长也截断)
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