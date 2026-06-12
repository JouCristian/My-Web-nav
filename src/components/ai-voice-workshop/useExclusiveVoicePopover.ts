"use client"

import { useCallback, useEffect, useState } from "react"

const popoverEventName = "joujou-voice-popover-open"

export function useExclusiveVoicePopover(id: string) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleOtherPopover(event: Event) {
      const detail = (event as CustomEvent<string>).detail
      if (detail !== id) setOpen(false)
    }

    window.addEventListener(popoverEventName, handleOtherPopover)
    return () => window.removeEventListener(popoverEventName, handleOtherPopover)
  }, [id])

  const openPopover = useCallback(() => {
    window.dispatchEvent(new CustomEvent(popoverEventName, { detail: id }))
    setOpen(true)
  }, [id])

  const closePopover = useCallback(() => setOpen(false), [])
  const togglePopover = useCallback(() => {
    if (open) closePopover()
    else openPopover()
  }, [closePopover, open, openPopover])

  return { open, openPopover, closePopover, togglePopover }
}
