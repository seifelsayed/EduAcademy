import { IconVideoOff } from '@tabler/icons-react'
import { useEffect, useRef } from 'react'

import { resolveEmbed } from '@/shared/lib/video'

interface VideoPlayerProps {
  url: string | null | undefined
  title: string
  startAtSeconds?: number
  /** Called every few seconds with the current position, for progress saving. */
  onProgress?: (watchedSeconds: number, positionSeconds: number) => void
  onEnded?: () => void
}

const HEARTBEAT_MS = 15_000

export function VideoPlayer({ url, title, startAtSeconds = 0, onProgress, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const embed = resolveEmbed(url)

  useEffect(() => {
    const element = videoRef.current

    if (!element || embed?.kind !== 'file') return

    if (startAtSeconds > 0) {
      element.currentTime = startAtSeconds
    }

    if (!onProgress) return

    const timer = window.setInterval(() => {
      if (element.paused || element.ended) return

      onProgress(Math.floor(element.currentTime), Math.floor(element.currentTime))
    }, HEARTBEAT_MS)

    return () => window.clearInterval(timer)
  }, [embed?.kind, startAtSeconds, onProgress])

  if (!embed) {
    return (
      <div className="relative w-full aspect-video bg-black/90 rounded-lg overflow-hidden flex items-center justify-center text-text-muted border border-border shadow-md">
        <div className="flex flex-col items-center gap-2">
          <IconVideoOff size={32} stroke={1.5} />
          <span className="text-sm font-medium">No video available for this lesson.</span>
        </div>
      </div>
    )
  }

  if (embed.kind === 'iframe') {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-md border border-border">
        <iframe
          src={embed.src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-md border border-border">
      <video
        ref={videoRef}
        src={embed.src}
        controls
        preload="metadata"
        className="absolute inset-0 w-full h-full object-contain"
        onEnded={() => {
          const element = videoRef.current

          if (element && onProgress) {
            onProgress(Math.floor(element.duration), Math.floor(element.duration))
          }

          onEnded?.()
        }}
      >
        <track kind="captions" />
      </video>
    </div>
  )
}
