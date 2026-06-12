import type { VoicePreset } from "./types"

export const defaultVoicePresets: VoicePreset[] = [
  {
    id: "tech-male",
    name: "科技男声",
    prompt: "男声，沉稳，科技感，语速适中",
    description: "适合产品介绍、技术演示、工具说明",
  },
  {
    id: "gentle-female",
    name: "温柔女声",
    prompt: "年轻女性，温柔，清晰，带一点微笑感",
    description: "适合教程讲解、陪伴感内容、温暖旁白",
  },
  {
    id: "documentary",
    name: "纪录片旁白",
    prompt: "纪录片旁白风格，低沉，缓慢，富有故事感",
    description: "适合历史、人文、城市、自然类视频",
  },
  {
    id: "short-video",
    name: "短视频解说",
    prompt: "年轻男声，清晰，有节奏感，表达自然，适合短视频解说",
    description: "适合抖音、小红书、B站口播解说",
  },
  {
    id: "news",
    name: "新闻播报",
    prompt: "标准普通话，新闻播报风格，清晰，正式，语速稳定",
    description: "适合通知、公告、正式介绍",
  },
  {
    id: "storyteller",
    name: "故事讲述",
    prompt: "温和，叙事感，语速偏慢，像在讲一个故事",
    description: "适合故事、微电影旁白、睡前内容",
  },
]
