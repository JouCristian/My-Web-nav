'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

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