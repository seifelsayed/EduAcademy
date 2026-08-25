import {
  IconChevronDown,
  IconChevronRight,
  IconCircleCheckFilled,
  IconClipboardText,
  IconFileText,
  IconLock,
  IconPaperclip,
  IconPlayerPlay,
  IconQuestionMark,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { useState, type ReactNode } from 'react'

import { Badge } from '@/components/atoms/Badge'
import type { Lesson, LessonType, Section } from '@/core/domain/schemas/catalog'
import { useTranslation } from '@/shared/lib/i18n'

const LESSON_ICON: Record<LessonType, ReactNode> = {
  video: <IconPlayerPlay size={16} />,
  article: <IconFileText size={16} />,
  quiz: <IconQuestionMark size={16} />,
  assignment: <IconClipboardText size={16} />,
  resource: <IconPaperclip size={16} />,
}

interface CurriculumAccordionProps {
  sections: Section[]
  /** Ids of lessons the learner has finished. */
  completedLessonIds?: number[]
  activeLessonId?: number
  onSelectLesson?: (lesson: Lesson) => void
  /** Expand every section on first render — useful on the course sales page. */
  defaultExpanded?: boolean
}

export function CurriculumAccordion({
  sections,
  completedLessonIds = [],
  activeLessonId,
  onSelectLesson,
  defaultExpanded = false,
}: CurriculumAccordionProps) {
  const { tPlural, isAr, formatDuration, formatNumber } = useTranslation()
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    if (defaultExpanded) return new Set(sections.map((section) => section.id))

    const activeSection = sections.find((section) =>
      section.lessons?.some((lesson) => lesson.id === activeLessonId),
    )

    return new Set(activeSection ? [activeSection.id] : sections[0] ? [sections[0].id] : [])
  })

  const toggle = (id: number) =>
    setExpanded((current) => {
      const next = new Set(current)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })

  return (
    <div className="flex flex-col border border-border rounded-2xl overflow-hidden bg-surface shadow-xs divide-y divide-border">
      {sections.map((section, idx) => {
        const isOpen = expanded.has(section.id)
        const lessons = section.lessons ?? []
        const done = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length

        return (
          <div key={section.id} className="flex flex-col">
            <button
              type="button"
              className="flex items-center justify-between gap-3 w-full text-start p-4 sm:p-5 hover:bg-surface-hover/60 transition-colors cursor-pointer select-none"
              onClick={() => toggle(section.id)}
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-text-muted shrink-0">
                  {isOpen ? <IconChevronDown size={18} className="text-primary" /> : <IconChevronRight size={18} />}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm sm:text-base text-text-main truncate">
                    {isAr
                      ? `الوحدة ${formatNumber(idx + 1)}: ${section.title}`
                      : `Module ${idx + 1}: ${section.title}`}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5 font-medium">
                    {tPlural(lessons.length, 'lessons')}
                    {section.duration_minutes ? ` · ${formatDuration(section.duration_minutes)}` : ''}
                    {completedLessonIds.length > 0
                      ? isAr
                        ? ` · ${formatNumber(done)}/${formatNumber(lessons.length)} مكتمل`
                        : ` · ${done}/${lessons.length} completed`
                      : ''}
                  </div>
                </div>
              </div>
            </button>

            {isOpen ? (
              <ul className="flex flex-col list-none p-0 m-0 bg-surface-muted/30 divide-y divide-border/60">
                {lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.includes(lesson.id)
                  const isActive = lesson.id === activeLessonId
                  const isLocked = lesson.is_locked && !onSelectLesson

                  return (
                    <li
                      key={lesson.id}
                      className={clsx(
                        'flex items-center gap-3.5 px-5 sm:px-8 py-3 transition-colors select-none text-xs sm:text-sm',
                        isActive
                          ? 'bg-primary-light text-primary font-bold border-s-4 border-primary'
                          : 'hover:bg-surface-hover text-text-main border-s-4 border-transparent',
                        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                      )}
                      onClick={() => {
                        if (!lesson.is_locked) onSelectLesson?.(lesson)
                      }}
                      role={onSelectLesson ? 'button' : undefined}
                      tabIndex={onSelectLesson && !lesson.is_locked ? 0 : undefined}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !lesson.is_locked) onSelectLesson?.(lesson)
                      }}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span className={clsx('shrink-0', isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary')}>
                        {isCompleted ? (
                          <IconCircleCheckFilled size={18} />
                        ) : lesson.is_locked ? (
                          <IconLock size={16} className="text-text-subtle" />
                        ) : (
                          LESSON_ICON[lesson.type]
                        )}
                      </span>

                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-medium">{lesson.title}</span>
                      </span>

                      {lesson.is_preview && isLocked ? (
                        <Badge tone="success">{isAr ? 'معاينة مجانية' : 'Free Preview'}</Badge>
                      ) : null}

                      <span className="text-xs text-text-muted shrink-0 tabular-nums">
                        {formatDuration(lesson.duration_minutes)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
