/**
 * 网站图标抓取脚本
 * 用于在添加书签时预抓取网站的 favicon 并转换为 Base64 存储
 * 
 * 使用方法:
 * npx tsx scripts/fetch-favicon.ts <url>
 * 
 * 示例:
 * npx tsx scripts/fetch-favicon.ts https://github.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 常见的 favicon 路径
const FAVICON_PATHS = [
  '/favicon.ico',
  '/favicon.png',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
]

/**
 * 从 HTML 中提取 favicon 链接
 */
function extractFaviconFromHtml(html: string, baseUrl: string): string[] {
  const links: string[] = []
  
  // 匹配 <link rel="icon" ...> 或 <link rel="shortcut icon" ...>
  const linkRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/gi
  const matches = html.match(linkRegex) || []
  
  for (const match of matches) {
    const hrefMatch = match.match(/href=["']([^"']+)["']/)
    if (hrefMatch) {
      let href = hrefMatch[1]
      // 处理相对路径
      if (href.startsWith('//')) {
        href = 'https:' + href
      } else if (href.startsWith('/')) {
        const url = new URL(baseUrl)
        href = url.origin + href
      } else if (!href.startsWith('http')) {
        const url = new URL(baseUrl)
        href = url.origin + '/' + href
      }
      links.push(href)
    }
  }
  
  // 匹配 apple-touch-icon
  const appleRegex = /<link[^>]*rel=["']apple-touch-icon[^"']*["'][^>]*>/gi
  const appleMatches = html.match(appleRegex) || []
  
  for (const match of appleMatches) {
    const hrefMatch = match.match(/href=["']([^"']+)["']/)
    if (hrefMatch) {
      let href = hrefMatch[1]
      if (href.startsWith('//')) {
        href = 'https:' + href
      } else if (href.startsWith('/')) {
        const url = new URL(baseUrl)
        href = url.origin + href
      } else if (!href.startsWith('http')) {
        const url = new URL(baseUrl)
        href = url.origin + '/' + href
      }
      links.push(href)
    }
  }
  
  return links
}

/**
 * 将图片转换为 Base64 Data URL
 */
async function imageToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) return null
    
    const contentType = response.headers.get('content-type') || 'image/x-icon'
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

/**
 * 抓取网站的 favicon
 */
export async function fetchFavicon(websiteUrl: string): Promise<string | null> {
  try {
    const url = new URL(websiteUrl)
    const baseUrl = url.origin
    
    // 1. 首先尝试从 HTML 中提取
    try {
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        const faviconLinks = extractFaviconFromHtml(html, baseUrl)
        
        for (const link of faviconLinks) {
          const base64 = await imageToBase64(link)
          if (base64) {
            console.log(`[SUCCESS] 从 HTML 中找到图标: ${link}`)
            return base64
          }
        }
      }
    } catch {
      console.log('[INFO] 无法从 HTML 提取，尝试常见路径...')
    }
    
    // 2. 尝试常见的 favicon 路径
    for (const path of FAVICON_PATHS) {
      const faviconUrl = baseUrl + path
      const base64 = await imageToBase64(faviconUrl)
      if (base64) {
        console.log(`[SUCCESS] 从常见路径找到图标: ${faviconUrl}`)
        return base64
      }
    }
    
    // 3. 使用 Google Favicon 服务作为后备
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`
    const base64 = await imageToBase64(googleFaviconUrl)
    if (base64) {
      console.log(`[SUCCESS] 从 Google 服务获取图标`)
      return base64
    }
    
    console.log('[FAILED] 无法获取图标')
    return null
  } catch (error) {
    console.error('[ERROR]', error)
    return null
  }
}

/**
 * 更新指定书签的图标
 */
export async function updateBookmarkIcon(bookmarkId: number): Promise<boolean> {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId }
    })
    
    if (!bookmark) {
      console.error(`[ERROR] 书签 ID ${bookmarkId} 不存在`)
      return false
    }
    
    console.log(`[INFO] 正在抓取 ${bookmark.name} (${bookmark.url}) 的图标...`)
    
    const iconData = await fetchFavicon(bookmark.url)
    
    if (iconData) {
      await prisma.bookmark.update({
        where: { id: bookmarkId },
        data: { iconSvg: iconData }
      })
      console.log(`[SUCCESS] 已更新书签 "${bookmark.name}" 的图标`)
      return true
    }
    
    return false
  } catch (error) {
    console.error('[ERROR]', error)
    return false
  }
}

/**
 * 更新所有缺失图标的书签
 */
export async function updateAllMissingIcons(): Promise<void> {
  const bookmarks = await prisma.bookmark.findMany({
    where: { iconSvg: null }
  })
  
  console.log(`[INFO] 找到 ${bookmarks.length} 个缺失图标的书签`)
  
  for (const bookmark of bookmarks) {
    await updateBookmarkIcon(bookmark.id)
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('[DONE] 图标更新完成')
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2)
  
  if (args[0] === '--all') {
    // 更新所有缺失图标
    await updateAllMissingIcons()
  } else if (args[0] === '--id' && args[1]) {
    // 更新指定 ID 的书签
    await updateBookmarkIcon(parseInt(args[1]))
  } else if (args[0]) {
    // 测试抓取指定 URL
    const icon = await fetchFavicon(args[0])
    if (icon) {
      console.log('\n[RESULT] Base64 图标数据 (前100字符):')
      console.log(icon.substring(0, 100) + '...')
    }
  } else {
    console.log(`
使用方法:
  npx tsx scripts/fetch-favicon.ts <url>          # 测试抓取指定 URL 的图标
  npx tsx scripts/fetch-favicon.ts --all          # 更新所有缺失图标的书签
  npx tsx scripts/fetch-favicon.ts --id <id>      # 更新指定 ID 的书签图标
    `)
  }
  
  await prisma.$disconnect()
}

main()
