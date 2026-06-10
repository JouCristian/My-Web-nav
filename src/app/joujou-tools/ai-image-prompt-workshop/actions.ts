"use server"

import { auth } from "@/auth"
import { aiImagePrompts, promptCategories } from "@/lib/ai-image-prompts"
import { prisma } from "@/lib/db"
import type { ImagePromptCategory, ImagePromptGenerationMode, ImagePromptItem } from "@/types/ai-image-prompt"
import { revalidatePath, unstable_cache, updateTag } from "next/cache"

const WORKSHOP_PATH = "/joujou-tools/ai-image-prompt-workshop"
const WORKSHOP_CACHE_TAG = "prompt-workshop"
const DEFAULT_GENERATION_MODE: ImagePromptGenerationMode = "text-to-image"

export interface PromptWorkshopData {
  categories: Array<"全部" | ImagePromptCategory>
  items: ImagePromptItem[]
}

function fallbackWorkshopData(): PromptWorkshopData {
  return {
    categories: promptCategories,
    items: aiImagePrompts,
  }
}

function slugifyCategory(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "")
    .replace(/^-+|-+$/g, "") || `category-${Date.now()}`
}

function normalizeGenerationMode(value: string | null | undefined): ImagePromptGenerationMode {
  return value === "image-to-image" || value === "text-to-image" ? value : DEFAULT_GENERATION_MODE
}

async function assertPromptManager() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("未登录")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== "OWNER" && user?.role !== "ADMIN") {
    throw new Error("权限不足")
  }

  return user
}

async function readPromptWorkshopDataFromDb(): Promise<PromptWorkshopData> {
  const [categories, cards] = await Promise.all([
    prisma.promptCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.promptCard.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ])

  if (!categories.length || !cards.length) return fallbackWorkshopData()

  return {
    categories: ["全部", ...categories.map((category) => category.name)],
    items: cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      category: card.category.name,
      tags: card.tags,
      generationMode: normalizeGenerationMode(card.generationMode),
      modelTarget: card.modelTarget,
      previewImage: card.previewImage ?? undefined,
      previewGradient: card.previewGradient ?? undefined,
      prompt: card.prompt,
      promptSummary: card.promptSummary,
      useCase: card.useCase,
      tips: card.tips,
    })),
  }
}

const readCachedPromptWorkshopData = unstable_cache(
  async () => readPromptWorkshopDataFromDb(),
  ["prompt-workshop-data"],
  {
    revalidate: 300,
    tags: [WORKSHOP_CACHE_TAG],
  },
)

function revalidatePromptWorkshop() {
  updateTag(WORKSHOP_CACHE_TAG)
  revalidatePath(WORKSHOP_PATH)
}

export async function getPromptWorkshopData(): Promise<PromptWorkshopData> {
  try {
    return await readCachedPromptWorkshopData()
  } catch (error) {
    console.warn("[prompt-workshop] Falling back to mock data:", error)
    return fallbackWorkshopData()
  }
}

async function findOrCreateCategory(categoryName: ImagePromptCategory) {
  const name = categoryName.trim()
  if (!name || name === "全部") throw new Error("分类名称无效")

  const existing = await prisma.promptCategory.findUnique({ where: { name } })
  if (existing) return existing

  const sortOrder = await prisma.promptCategory.count()
  return prisma.promptCategory.create({
    data: {
      name,
      slug: slugifyCategory(name),
      sortOrder,
    },
  })
}

export async function savePromptCard(item: ImagePromptItem): Promise<PromptWorkshopData> {
  const user = await assertPromptManager()
  const category = await findOrCreateCategory(item.category)
  const existing = await prisma.promptCard.findUnique({ where: { id: item.id } })
  const sortOrder = existing?.sortOrder ?? (await prisma.promptCard.count())

  await prisma.promptCard.upsert({
    where: { id: item.id },
    update: {
      title: item.title,
      description: item.description,
      categoryId: category.id,
      tags: item.tags,
      generationMode: item.generationMode || DEFAULT_GENERATION_MODE,
      modelTarget: item.modelTarget || "AI 通用",
      previewImage: item.previewImage ?? null,
      previewGradient: item.previewGradient ?? null,
      prompt: item.prompt,
      promptSummary: item.promptSummary,
      useCase: item.useCase,
      tips: item.tips ?? [],
      isActive: true,
      updatedById: user.id,
    },
    create: {
      id: item.id,
      title: item.title,
      description: item.description,
      categoryId: category.id,
      tags: item.tags,
      generationMode: item.generationMode || DEFAULT_GENERATION_MODE,
      modelTarget: item.modelTarget || "AI 通用",
      previewImage: item.previewImage ?? null,
      previewGradient: item.previewGradient ?? null,
      prompt: item.prompt,
      promptSummary: item.promptSummary,
      useCase: item.useCase,
      tips: item.tips ?? [],
      sortOrder,
      createdById: user.id,
      updatedById: user.id,
    },
  })

  revalidatePromptWorkshop()
  return readPromptWorkshopDataFromDb()
}

export async function deletePromptCard(id: string): Promise<PromptWorkshopData> {
  await assertPromptManager()

  const activeCount = await prisma.promptCard.count({ where: { isActive: true } })
  if (activeCount <= 1) throw new Error("至少保留一张 card")

  await prisma.promptCard.delete({ where: { id } })
  revalidatePromptWorkshop()
  return readPromptWorkshopDataFromDb()
}

export async function createPromptCategory(name: string): Promise<PromptWorkshopData> {
  await assertPromptManager()
  await findOrCreateCategory(name)
  revalidatePromptWorkshop()
  return readPromptWorkshopDataFromDb()
}

export async function deletePromptCategory(name: ImagePromptCategory): Promise<PromptWorkshopData> {
  await assertPromptManager()

  const categories = await prisma.promptCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] })
  if (categories.length <= 1) throw new Error("至少保留一个分类")

  const target = categories.find((category) => category.name === name)
  if (!target) return readPromptWorkshopDataFromDb()

  const fallback = categories.find((category) => category.id !== target.id)
  if (!fallback) throw new Error("至少保留一个分类")

  await prisma.promptCard.updateMany({
    where: { categoryId: target.id },
    data: { categoryId: fallback.id },
  })
  await prisma.promptCategory.delete({ where: { id: target.id } })

  revalidatePromptWorkshop()
  return readPromptWorkshopDataFromDb()
}
