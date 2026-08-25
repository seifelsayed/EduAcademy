import { IconCheck, IconChevronDown, IconFolder, IconSearch } from '@tabler/icons-react'
import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { Category } from '@/core/domain/schemas/catalog'
import { useTranslation } from '@/shared/lib/i18n'

interface CategoryComboboxProps {
  categories: Category[]
  value?: number | null
  onChange: (categoryId: number | null) => void
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
  placeholder,
  error,
  disabled,
}: CategoryComboboxProps) {
  const { isAr } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Flatten categories with hierarchy indicators
  const flatList = useMemo(() => {
    const list: { category: Category; isChild: boolean; parentName?: string }[] = []

    for (const root of categories) {
      list.push({ category: root, isChild: false })
      if (root.children && root.children.length > 0) {
        for (const child of root.children) {
          list.push({ category: child, isChild: true, parentName: root.name })
        }
      }
    }

    return list
  }, [categories])

  const selectedItem = useMemo(() => {
    return flatList.find((item) => item.category.id === value)
  }, [flatList, value])

  const filteredList = useMemo(() => {
    if (!query.trim()) return flatList
    const q = query.toLowerCase()
    return flatList.filter(
      (item) =>
        item.category.name.toLowerCase().includes(q) ||
        (item.parentName && item.parentName.toLowerCase().includes(q)),
    )
  }, [flatList, query])

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer select-none text-start',
          'bg-surface/90 backdrop-blur-md shadow-xs',
          isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border hover:border-border-hover',
          error && 'border-danger focus:ring-danger/20',
          disabled && 'opacity-50 cursor-not-allowed bg-surface-muted',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedItem ? (
            <>
              <span className="w-5 h-5 rounded-md bg-primary-light text-primary flex items-center justify-center shrink-0">
                <IconFolder size={12} />
              </span>
              <span className="text-text-main font-bold truncate">
                {selectedItem.isChild && selectedItem.parentName ? (
                  <span className="text-text-muted font-normal me-1.5">
                    {selectedItem.parentName} /
                  </span>
                ) : null}
                {selectedItem.category.name}
              </span>
            </>
          ) : (
            <span className="text-text-subtle">
              {placeholder ?? (isAr ? 'اختر التخصص...' : 'Select a category...')}
            </span>
          )}
        </div>

        <IconChevronDown
          size={16}
          className={clsx(
            'text-text-muted shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-primary',
          )}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen ? (
        <div
          role="listbox"
          className="absolute start-0 end-0 z-50 mt-2 max-h-72 overflow-hidden rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Quick Search inside Combobox */}
          <div className="p-2.5 border-b border-border/80 bg-surface-muted/30">
            <div className="relative">
              <IconSearch
                size={14}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAr ? 'بحث في التخصصات...' : 'Filter categories...'}
                className="w-full ps-8 pe-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          {/* List of Categories */}
          <div className="overflow-y-auto p-1.5 flex flex-col gap-0.5 max-h-56">
            {filteredList.map((item) => {
              const isSelected = item.category.id === value

              return (
                <button
                  key={item.category.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(item.category.id)
                    setIsOpen(false)
                    setQuery('')
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start',
                    isSelected
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'text-text-main hover:bg-surface-hover/80',
                    item.isChild ? 'ps-7 text-[11px]' : '',
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.isChild ? (
                      <span className={clsx('text-xs select-none', isSelected ? 'text-white/80' : 'text-text-subtle')}>
                        ↳
                      </span>
                    ) : (
                      <span
                        className={clsx(
                          'w-4 h-4 rounded flex items-center justify-center shrink-0',
                          isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary',
                        )}
                      >
                        <IconFolder size={11} />
                      </span>
                    )}

                    <span className="truncate">{item.category.name}</span>
                  </div>

                  {isSelected ? <IconCheck size={14} className="shrink-0 text-white" /> : null}
                </button>
              )
            })}

            {filteredList.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted">
                {isAr ? 'لا توجد تخصصات مطابقة' : 'No matching categories'}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
