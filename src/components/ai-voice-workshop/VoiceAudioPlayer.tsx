"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react"
import { voiceFastSpring, voiceTap } from "@/components/ai-voice-workshop/motion"

const playerStartedEvent = "joujou-voice-player-started"
const togglePrimaryPlayerEvent = "joujou-voice-toggle-primary-player"
const playbackRates = [1, 1.25, 1.5, 0.75]

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}:${remainder.toString().padStart(2, "0")}`
}

interface VoiceAudioPlayerProps {
  id: string
  src: string
  compact?: boolean
  primary?: boolean
  disabled?: boolean
  disabledMessage?: string
  unavailableMessage?: string
}

export function VoiceAudioPlayer({
  id,
  src,
  compact = false,
  primary = false,
  disabled = false,
  disabledMessage,
  unavailableMessage,
}: VoiceAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loadError, setLoadError] = useState(false)

  const progress = useMemo(() => (duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0), [currentTime, duration])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setLoadError(false)
  }, [src])

  useEffect(() => {
    function pauseWhenAnotherPlayerStarts(event: Event) {
      if ((event as CustomEvent<string>).detail === id) return
      audioRef.current?.pause()
      setPlaying(false)
    }

    function togglePrimary() {
      if (primary) void togglePlayback()
    }

    window.addEventListener(playerStartedEvent, pauseWhenAnotherPlayerStarts)
    window.addEventListener(togglePrimaryPlayerEvent, togglePrimary)
    return () => {
      window.removeEventListener(playerStartedEvent, pauseWhenAnotherPlayerStarts)
      window.removeEventListener(togglePrimaryPlayerEvent, togglePrimary)
    }
  })

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio || disabled || !src) return
    if (audio.paused) {
      try {
        if (loadError) {
          setLoadError(false)
          audio.load()
        }
        window.dispatchEvent(new CustomEvent(playerStartedEvent, { detail: id }))
        await audio.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
        setLoadError(true)
      }
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  function seekBy(seconds: number) {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds))
  }

  function cyclePlaybackRate() {
    const currentIndex = playbackRates.indexOf(playbackRate)
    const nextRate = playbackRates[(currentIndex + 1) % playbackRates.length]
    setPlaybackRate(nextRate)
    if (audioRef.current) audioRef.current.playbackRate = nextRate
  }

  const inactive = disabled || loadError || !src
  const buttonDisabled = disabled || !src
  const message = disabled
    ? disabledMessage || "本地引擎未连接，启动后可播放历史音频。"
    : unavailableMessage || "音频文件已被清理或移动。"

  return (
    <div className={`rounded-xl border border-cyan-100/15 bg-[#07101d]/85 ${compact ? "p-2.5" : "p-3.5"}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration)
          setLoadError(false)
        }}
        onError={() => {
          setPlaying(false)
          setLoadError(true)
        }}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={() => void togglePlayback()}
          disabled={buttonDisabled}
          whileTap={buttonDisabled ? undefined : voiceTap}
          transition={voiceFastSpring}
          className={`${compact ? "h-9 w-9" : "h-11 w-11"} grid shrink-0 cursor-pointer place-items-center rounded-full border border-cyan-100/25 bg-cyan-200/[0.12] text-cyan-50 transition-colors hover:bg-cyan-200/[0.18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.045] disabled:text-zinc-500`}
          aria-label={playing ? "暂停音频" : "播放音频"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </motion.button>

        <div className="min-w-0 flex-1">
          {inactive ? (
            <div className="rounded-lg border border-amber-100/15 bg-amber-300/[0.055] px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-50/80">
              {message}
            </div>
          ) : (
            <>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.01}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  setCurrentTime(next)
                  if (audioRef.current) audioRef.current.currentTime = next
                }}
                className="h-1.5 w-full cursor-pointer rounded-full bg-white/10 accent-cyan-300"
                style={{ background: `linear-gradient(90deg, rgba(103,232,249,.9) ${progress}%, rgba(255,255,255,.1) ${progress}%)` }}
                aria-label="音频播放进度"
              />
              <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-cyan-50/55">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>

        {!compact && !inactive ? (
          <div className="flex shrink-0 items-center gap-1">
            <PlayerIconButton label="后退 5 秒" onClick={() => seekBy(-5)}><RotateCcw className="h-3.5 w-3.5" /></PlayerIconButton>
            <PlayerIconButton label="前进 5 秒" onClick={() => seekBy(5)}><RotateCw className="h-3.5 w-3.5" /></PlayerIconButton>
            <motion.button type="button" onClick={cyclePlaybackRate} whileTap={voiceTap} transition={voiceFastSpring} className="min-h-8 min-w-10 cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-2 font-mono text-[10px] font-bold text-zinc-300 transition-colors hover:border-cyan-100/25 hover:text-white" aria-label="切换播放速度">{playbackRate}x</motion.button>
          </div>
        ) : <Volume2 className="h-3.5 w-3.5 shrink-0 text-cyan-100/45" />}
      </div>
    </div>
  )
}

function PlayerIconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <motion.button type="button" onClick={onClick} whileTap={voiceTap} transition={voiceFastSpring} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50" aria-label={label}>{children}</motion.button>
}
