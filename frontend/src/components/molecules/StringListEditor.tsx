import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs'
import { useTranslation } from '@/shared/lib/i18n'

interface StringListEditorProps {
  label: string
  hint?: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  max?: number
}

export function StringListEditor({
  label,
  hint,
  values,
  onChange,
  placeholder = 'Add an item',
  max = 20,
}: StringListEditorProps) {
  const [draft, setDraft] = useState('')
  const { t } = useTranslation()

  const add = () => {
    const value = draft.trim()

    if (!value || values.length >= max) return

    onChange([...values, value])
    setDraft('')
  }

  return (
    <div className="flex flex-col mb-4">
      <span className="block text-sm font-semibold text-text-main mb-2">{label}</span>

      {values.length > 0 ? (
        <ul className="flex flex-col gap-1.5 mb-2.5 p-0 list-none">
          {values.map((value, index) => (
            <li
              key={`${value}-${index}`}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface/90 backdrop-blur-md border border-border text-sm text-text-main group hover:border-border-hover transition-colors shadow-xs"
            >
              <span className="flex-1 min-w-0 break-words">{value}</span>
              <button
                type="button"
                className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger-light transition-colors cursor-pointer"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
                aria-label={`Remove ${value}`}
              >
                <IconTrash size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          icon={<IconPlus size={15} />}
          onClick={add}
          disabled={!draft.trim() || values.length >= max}
        >
          {t('editor.addItem')}
        </Button>
      </div>

      {hint ? <p className="text-xs text-text-muted mt-1.5">{hint}</p> : null}
      {values.length >= max ? (
        <p className="text-xs font-medium text-warning mt-1.5">Maximum of {max} items reached.</p>
      ) : null}
    </div>
  )
}
