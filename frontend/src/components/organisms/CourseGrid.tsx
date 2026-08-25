import { IconSearchOff } from '@tabler/icons-react'
import type { ReactNode } from 'react'

import { Skeleton, SkeletonText } from '@/components/atoms/Skeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { CourseCard } from '@/components/organisms/CourseCard'
import type { Course } from '@/core/domain/schemas/catalog'

interface CourseGridProps {
  courses: Course[]
  loading?: boolean
  skeletonCount?: number
  columns?: 2 | 3 | 4 | 5
  onToggleWishlist?: (slug: string) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  /** Per-course progress, keyed by course id — turns cards into learning cards. */
  progressById?: Record<number, number>
}

const GRID_CLASSES: Record<2 | 3 | 4 | 5, string> = {
  2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  5: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6',
}

export function CourseGrid({
  courses,
  loading = false,
  skeletonCount = 8,
  columns = 4,
  onToggleWishlist,
  emptyTitle = 'لا توجد كورسات مطابقة للبحث',
  emptyDescription = 'جرّب تعديل معايير التصفية أو البحث عن مهارة أخرى.',
  emptyAction,
  progressById,
}: CourseGridProps) {
  if (loading) {
    return (
      <div className={GRID_CLASSES[columns]}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div
            key={index}
            className="flex flex-col h-full bg-surface border border-border rounded-3xl overflow-hidden shadow-xs"
          >
            <div className="w-full aspect-video border-b border-border">
              <Skeleton width="100%" height="100%" />
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex gap-2">
                <Skeleton width="30%" height="1rem" className="rounded-full" />
                <Skeleton width="20%" height="1rem" className="rounded-full" />
              </div>
              <Skeleton width="85%" height="1.25rem" />
              <SkeletonText lines={2} />
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <Skeleton width="40%" height="1rem" />
                <Skeleton width="25%" height="1.25rem" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<IconSearchOff size={36} stroke={1.5} />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div className={GRID_CLASSES[columns]}>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onToggleWishlist={onToggleWishlist}
          progressPercent={progressById?.[course.id]}
        />
      ))}
    </div>
  )
}
