"use client"

import { useEffect, useRef } from "react"
import { recordVisit } from "@/app/actions"

export function VisitTracker() {
  const hasRecorded = useRef(false)

  useEffect(() => {
    // 防止重复记录（开发模式下 useEffect 会运行两次）
    if (hasRecorded.current) return
    hasRecorded.current = true

    // 检查 sessionStorage 防止刷新重复计数
    const visitKey = `visited_${new Date().toISOString().split('T')[0]}`
    if (sessionStorage.getItem(visitKey)) return
    
    // 记录访问
    recordVisit().then(() => {
      sessionStorage.setItem(visitKey, 'true')
    })
  }, [])

  return null
}
