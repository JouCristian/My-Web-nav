export type ImagePromptCategory = string
export type ImagePromptGenerationMode = "image-to-image" | "text-to-image"

export const imagePromptGenerationModes = [
  {
    value: "image-to-image",
    label: "图生图",
    description: "适合基于参考图进行风格转换、重绘、修图、二创。",
  },
  {
    value: "text-to-image",
    label: "直接生成创意图片",
    description: "适合无参考图，直接通过提示词生成新画面。",
  },
] as const

export interface ImagePromptItem {
  id: string
  title: string
  description: string
  category: ImagePromptCategory
  tags: string[]
  generationMode: ImagePromptGenerationMode
  modelTarget: string
  previewImage?: string
  previewGradient?: string
  prompt: string
  promptSummary: string
  useCase: string
  tips?: string[]
}
