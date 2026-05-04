/**
 * 书签分类更新脚本
 * 根据网站URL自动分类书签
 * 
 * 运行方式: npx tsx scripts/update-categories.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 分类规则映射
const CATEGORY_RULES: Record<string, { patterns: RegExp[], category: 'TOOL' | 'DOC' | 'TUTORIAL' | 'RESOURCE' | 'COMMUNITY' | 'OTHER' }> = {
  // 工具类
  TOOL: {
    patterns: [
      /github\.com/i,
      /gitee\.com/i,
      /gitlab/i,
      /vercel\.com/i,
      /netlify/i,
      /supabase/i,
      /figma\.com/i,
      /notion\.so/i,
      /trello/i,
      /slack/i,
      /discord/i,
      /vscode/i,
      /postman/i,
      /docker/i,
      /npm/i,
      /yarn/i,
      /webpack/i,
      /vite/i,
      /codepen/i,
      /codesandbox/i,
      /replit/i,
      /deepseek/i,
      /chatgpt|openai/i,
      /claude|anthropic/i,
      /gemini/i,
      /copilot/i,
      /cursor/i,
      /v0\.dev/i,
    ],
    category: 'TOOL'
  },
  // 文档类
  DOC: {
    patterns: [
      /docs\./i,
      /documentation/i,
      /developer\./i,
      /devdocs/i,
      /mdn/i,
      /w3schools/i,
      /reactjs\.org/i,
      /vuejs\.org/i,
      /angular\.io/i,
      /nextjs\.org/i,
      /tailwindcss\.com/i,
      /typescriptlang/i,
      /nodejs\.org/i,
      /python\.org/i,
      /rust-lang/i,
      /go\.dev/i,
      /swift\.org/i,
      /kotlinlang/i,
      /apple\.com\/developer/i,
      /developer\.android/i,
      /microsoft\.com\/.*docs/i,
    ],
    category: 'DOC'
  },
  // 教程类
  TUTORIAL: {
    patterns: [
      /tutorial/i,
      /learn/i,
      /course/i,
      /udemy/i,
      /coursera/i,
      /freecodecamp/i,
      /codecademy/i,
      /pluralsight/i,
      /egghead/i,
      /frontendmasters/i,
      /bilibili\.com/i,
      /youtube\.com/i,
      /zhihu\.com/i,
      /juejin/i,
      /csdn/i,
      /segmentfault/i,
      /medium\.com/i,
      /dev\.to/i,
      /hackernoon/i,
    ],
    category: 'TUTORIAL'
  },
  // 资源类
  RESOURCE: {
    patterns: [
      /unsplash/i,
      /pexels/i,
      /dribbble/i,
      /behance/i,
      /awwwards/i,
      /flaticon/i,
      /iconfont/i,
      /fontawesome/i,
      /google.*fonts/i,
      /coolors/i,
      /colorhunt/i,
      /gradients/i,
      /patterns/i,
      /illustrations/i,
      /lottie/i,
      /animista/i,
      /csseffects/i,
      /uiverse/i,
      /shadcn/i,
      /radix/i,
      /headless/i,
      /chakra/i,
      /ant\.design/i,
      /material/i,
      /bootstrap/i,
    ],
    category: 'RESOURCE'
  },
  // 社区类
  COMMUNITY: {
    patterns: [
      /reddit\.com/i,
      /stackoverflow/i,
      /hackernews/i,
      /producthunt/i,
      /indiehackers/i,
      /twitter\.com|x\.com/i,
      /linkedin/i,
      /facebook/i,
      /instagram/i,
      /weibo/i,
      /xiaohongshu|xhs/i,
      /douban/i,
      /v2ex/i,
      /lobste\.rs/i,
      /spectrum/i,
      /gitter/i,
    ],
    category: 'COMMUNITY'
  }
}

// 根据URL确定分类
function determineCategory(url: string, name: string): 'TOOL' | 'DOC' | 'TUTORIAL' | 'RESOURCE' | 'COMMUNITY' | 'OTHER' {
  const combined = `${url} ${name}`.toLowerCase()
  
  for (const [, rule] of Object.entries(CATEGORY_RULES)) {
    for (const pattern of rule.patterns) {
      if (pattern.test(combined)) {
        return rule.category
      }
    }
  }
  
  return 'OTHER'
}

async function main() {
  console.log('开始更新书签分类...\n')
  
  const bookmarks = await prisma.bookmark.findMany()
  
  let updated = 0
  for (const bookmark of bookmarks) {
    const newCategory = determineCategory(bookmark.url, bookmark.name)
    
    if (bookmark.category !== newCategory) {
      await prisma.bookmark.update({
        where: { id: bookmark.id },
        data: { category: newCategory }
      })
      console.log(`[更新] ${bookmark.name}: ${bookmark.category} → ${newCategory}`)
      updated++
    } else {
      console.log(`[保持] ${bookmark.name}: ${bookmark.category}`)
    }
  }
  
  console.log(`\n完成! 共更新 ${updated} 个书签分类`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
