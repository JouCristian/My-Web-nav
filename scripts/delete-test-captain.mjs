import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // 通过 studentId 精确查找该测试舰长（也兼容 nickname/realName 命中的情况）
  const targets = await prisma.user.findMany({
    where: {
      OR: [
        { studentId: "DEV-CAPTAIN-001" },
        { nickname: "测试舰长" },
        { realName: "测试舰长" },
        { name: "测试舰长" },
      ],
    },
    select: { id: true, nickname: true, realName: true, name: true, studentId: true, role: true },
  })

  if (targets.length === 0) {
    console.log("[v0] 未找到任何测试舰长账户，可能已被删除。")
    return
  }

  console.log("[v0] 找到以下测试账户：", targets)

  const ids = targets.map((u) => u.id)
  const result = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  })

  console.log(`[v0] 已永久销毁 ${result.count} 个测试账户（关联签到/请假/广播会通过级联自动清理）。`)
}

main()
  .catch((e) => {
    console.error("[v0] 删除失败：", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
