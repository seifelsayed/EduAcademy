import { IconCheck, IconChevronDown, IconSearch } from '@tabler/icons-react'
import clsx from 'clsx'
import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type OptgroupHTMLAttributes,
  type OptionHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'

export interface SelectOption {
  value: string | number
  label: ReactNode
  disabled?: boolean
  group?: string
  icon?: ReactNode
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  invalid?: boolean
  options?: SelectOption[]
  children?: ReactNode
  searchable?: boolean
}

interface ParsedOption {
  value: string
  label: ReactNode
  disabled?: boolean
  group?: string
}

function parseChildrenToOptions(children: ReactNode): ParsedOption[] {
  const options: ParsedOption[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return

    if (child.type === 'option') {
      const props = child.props as OptionHTMLAttributes<HTMLOptionElement>
      const value = props.value !== undefined ? String(props.value) : String(props.children ?? '')
      options.push({
        value,
        label: props.children ?? value,
        disabled: props.disabled,
      })
    } else if (child.type === 'optgroup') {
      const groupProps = child.props as OptgroupHTMLAttributes<HTMLOptGroupElement>
      const groupLabel = groupProps.label ?? ''
      Children.forEach(groupProps.children, (groupChild) => {
        if (!isValidElement(groupChild)) return
        if (groupChild.type === 'option') {
          const props = groupChild.props as OptionHTMLAttributes<HTMLOptionElement>
          const value = props.value !== undefined ? String(props.value) : String(props.children ?? '')
          options.push({
            value,
            label: props.children ?? value,
            disabled: props.disabled,
            group: groupLabel,
          })
        }
      })
    }
  })

  return options
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    invalid,
    className,
    children,
    options: directOptions,
    disabled,
    value: controlledValue,
    defaultValue,
    onChange,
    searchable,
    name,
    id,
    ...rest
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLSelectElement>(null)
  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLSelectElement)

  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Parse options from children or directOptions prop
  const allOptions: ParsedOption[] = useMemo(() => {
    if (directOptions && directOptions.length > 0) {
      return directOptions.map((opt) => ({
        value: String(opt.value),
        label: opt.label,
        disabled: opt.disabled,
        group: opt.group,
      }))
    }
    return parseChildrenToOptions(children)
  }, [directOptions, children])

  // Track selected value (controlled vs uncontrolled)
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (controlledValue !== undefined) return String(controlledValue)
    if (defaultValue !== undefined) return String(defaultValue)
    return allOptions[0]?.value ?? ''
  })

  const currentValue = controlledValue !== undefined ? String(controlledValue) : internalValue

  const selectedOption = useMemo(() => {
    return allOptions.find((opt) => opt.value === currentValue) ?? allOptions[0]
  }, [allOptions, currentValue])

  // Handle outside click & escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelectOption = (optValue: string) => {
    setInternalValue(optValue)
    setIsOpen(false)
    setSearchQuery('')

    if (innerRef.current) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value',
      )?.set
      if (nativeSetter) {
        nativeSetter.call(innerRef.current, optValue)
      } else {
        innerRef.current.value = optValue
      }

      const nativeEvent = new Event('change', { bubbles: true })
      innerRef.current.dispatchEvent(nativeEvent)

      if (onChange) {
        const syntheticEvent = {
          target: innerRef.current,
          currentTarget: innerRef.current,
          nativeEvent,
          bubbles: true,
          cancelable: false,
          defaultPrevented: false,
          eventPhase: 3,
          isTrusted: true,
          preventDefault: () => {},
          isDefaultPrevented: () => false,
          stopPropagation: () => {},
          isPropagationStopped: () => false,
          persist: () => {},
          timeStamp: Date.now(),
          type: 'change',
        } as unknown as React.ChangeEvent<HTMLSelectElement>
        onChange(syntheticEvent)
      }
    }
  }


  // Filter options if searchable or if option count > 10
  const isSearchEnabled = searchable ?? allOptions.length > 8
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allOptions
    const q = searchQuery.toLowerCase()
    return allOptions.filter((opt) => {
      const text = typeof opt.label === 'string' ? opt.label : String(opt.value)
      return text.toLowerCase().includes(q)
    })
  }, [allOptions, searchQuery])

  // Group options if applicable
  const groupedOptions = useMemo(() => {
    const groups: { name?: string; items: ParsedOption[] }[] = []
    const ungrouped: ParsedOption[] = []

    filteredOptions.forEach((opt) => {
      if (opt.group) {
        let grp = groups.find((g) => g.name === opt.group)
        if (!grp) {
          grp = { name: opt.group, items: [] }
          groups.push(grp)
        }
        grp.items.push(opt)
      } else {
        ungrouped.push(opt)
      }
    })

    return { groups, ungrouped }
  }, [filteredOptions])

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      {/* Hidden native select for standard HTML forms / react-hook-form bindings */}
      <select
        ref={innerRef}
        name={name}
        id={id}
        value={currentValue}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
        {...rest}
      >

        {allOptions.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {typeof opt.label === 'string' ? opt.label : opt.value}
          </option>
        ))}
      </select>

      {/* Custom styled trigger button */}
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
          invalid && 'border-danger focus:ring-danger/20',
          disabled && 'opacity-50 cursor-not-allowed bg-surface-muted',
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-text-main font-semibold">
          {selectedOption ? selectedOption.label : <span className="text-text-subtle">Select...</span>}
        </span>

        <IconChevronDown
          size={16}
          className={clsx(
            'text-text-muted shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-primary',
          )}
        />
      </button>

      {/* Floating Glassmorphic Dropdown Menu */}
      {isOpen ? (
        <div
          role="listbox"
          className="absolute start-0 end-0 z-50 mt-1.5 max-h-72 overflow-hidden rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          {isSearchEnabled ? (
            <div className="p-2 border-b border-border/80 bg-surface-muted/30">
              <div className="relative">
                <IconSearch
                  size={14}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full ps-8 pe-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:border-primary"
                  autoFocus
                />
              </div>
            </div>
          ) : null}

          <div className="overflow-y-auto p-1.5 flex flex-col gap-0.5 max-h-60">
            {/* Ungrouped options */}
            {groupedOptions.ungrouped.map((opt) => {
              const isSelected = opt.value === currentValue

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onClick={() => handleSelectOption(opt.value)}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-start select-none',
                    isSelected
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'text-text-main hover:bg-surface-hover/80',
                    opt.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected ? <IconCheck size={15} className="shrink-0 text-white" /> : null}
                </button>
              )
            })}

            {/* Grouped options */}
            {groupedOptions.groups.map((group) => (
              <div key={group.name} className="flex flex-col gap-0.5 mt-1 pt-1 border-t border-border/40">
                {group.name ? (
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-text-muted select-none">
                    {group.name}
                  </span>
                ) : null}
                {group.items.map((opt) => {
                  const isSelected = opt.value === currentValue

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => handleSelectOption(opt.value)}
                      className={clsx(
                        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-start ps-5 select-none',
                        isSelected
                          ? 'bg-primary text-white font-bold shadow-xs'
                          : 'text-text-main hover:bg-surface-hover/80',
                        opt.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected ? <IconCheck size={15} className="shrink-0 text-white" /> : null}
                    </button>
                  )
                })}
              </div>
            ))}

            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-text-muted">No options found</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
})


