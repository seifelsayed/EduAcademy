/**
 * Turns a pasted YouTube or Vimeo link into an embeddable URL. Anything else is
 * treated as a direct media file and played with a <video> element.
 */

export type EmbedKind = 'iframe' | 'file'

export interface Embed {
  kind: EmbedKind
  src: string
}

const YOUTUBE_PATTERNS = [
  /youtube\.com\/watch\?v=([\w-]{6,})/,
  /youtu\.be\/([\w-]{6,})/,
  /youtube\.com\/embed\/([\w-]{6,})/,
  /youtube\.com\/shorts\/([\w-]{6,})/,
]

export function resolveEmbed(url: string | null | undefined): Embed | null {
  if (!url) return null

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern)

    if (match?.[1]) {
      // `rel=0` keeps YouTube from suggesting unrelated videos mid-lesson.
      return { kind: 'iframe', src: `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` }
    }
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)

  if (vimeo?.[1]) {
    return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` }
  }

  return { kind: 'file', src: url }
}
