export type ImagePromptCategory = string

export interface ImagePromptItem {
  id: string
  title: string
  description: string
  category: ImagePromptCategory
  tags: string[]
  modelTarget: string
  previewImage?: string
  previewGradient?: string
  prompt: string
  promptSummary: string
  useCase: string
  tips?: string[]
}
