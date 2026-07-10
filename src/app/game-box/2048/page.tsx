import type { Metadata } from "next"
import { auth } from "@/auth"
import { Game2048Page } from "@/features/game-box/2048/components/Game2048Page"
import { safeDisplayName } from "@/features/game-box/2048/lib/format"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "2048 / Number Collision",
  description: "Neo-Swiss Arcade 2048 game in Game Box.",
}

export default async function Page() {
  const session = await auth().catch(() => null)
  const userId = session?.user?.id
  const hasAccount = Boolean(session?.user)
  const dbUser = userId
    ? await prisma.user
        .findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            nickname: true,
            realName: true,
            crewNickname: true,
          },
        })
        .catch(() => null)
    : null

  return <Game2048Page isLoggedIn={hasAccount} playerName={dbUser ? safeDisplayName(dbUser) : session?.user?.name || "Player"} />
}
