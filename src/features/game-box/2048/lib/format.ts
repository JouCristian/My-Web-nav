export function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export function safeDisplayName(user: {
  name?: string | null
  nickname?: string | null
  realName?: string | null
  crewNickname?: string | null
  id: string
}) {
  return user.nickname || user.name || user.realName || user.crewNickname || `User ${user.id.slice(0, 6).toUpperCase()}`
}

export function safeAvatarUrl(user: { customAvatar?: string | null; image?: string | null }) {
  return user.customAvatar || user.image || null
}
