import { IconError404 } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-lg bg-surface-muted border border-border flex items-center justify-center text-primary mb-5 shadow-xs">
        <IconError404 size={40} stroke={1.5} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
        The page you were looking for doesn't exist, was renamed, or has moved to another link.
      </p>
      <Link to="/" className="no-underline">
        <Button size="sm">Return to Homepage</Button>
      </Link>
    </div>
  )
}
