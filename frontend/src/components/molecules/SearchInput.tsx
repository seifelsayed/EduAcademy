import { IconSearch, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  autoFocus?: boolean
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  debounceMs = 350,
  autoFocus,
  className,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value)
  const [lastExternalValue, setLastExternalValue] = useState(value)

  if (value !== lastExternalValue) {
    setLastExternalValue(value)
    setDraft(value)
  }

  useEffect(() => {
    if (draft === value) return

    const timer = window.setTimeout(() => onChange(draft), debounceMs)

    return () => window.clearTimeout(timer)
  }, [draft, value, debounceMs, onChange])

  return (
    <div className={`relative flex items-center w-full ${className ?? ''}`}>
      <span className="absolute left-3 text-text-subtle pointer-events-none flex items-center">
        <IconSearch size={16} />
      </span>

      <input
        type="search"
        className="w-full bg-surface/90 backdrop-blur-md text-text-main placeholder:text-text-subtle border border-border rounded-md pl-9 pr-8 py-2 text-sm shadow-xs transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-border-hover"
        placeholder={placeholder}
        value={draft}
        autoFocus={autoFocus}
        onChange={(event) => setDraft(event.target.value)}
        aria-label={placeholder}
      />

      {draft ? (
        <button
          type="button"
          className="absolute right-2 text-text-muted hover:text-text-main p-1 rounded hover:bg-surface-muted transition-colors cursor-pointer flex items-center"
          aria-label="Clear search"
          onClick={() => setDraft('')}
        >
          <IconX size={14} />
        </button>
      ) : null}
    </div>
  )
}
