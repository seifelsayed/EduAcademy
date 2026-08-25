import {
  IconMessageCircle,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Select } from '@/components/atoms/inputs'
import { StarRating } from '@/components/molecules/StarRating'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ConfirmDialog } from '@/components/molecules/Modal'
import { PageHeader } from '@/components/templates/PageHeader'
import { useTranslation } from '@/shared/lib/i18n'
import { useNotificationStore } from '@/stores/notificationStore'
import { toast } from '@/stores/toastStore'

export function AdminReviewsPage() {
  const { t, isAr, formatDate } = useTranslation()
  const [search, setSearch] = useState('')
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<{ id: number; author: string } | null>(null)

  const markAllReviewsAsRead = useNotificationStore((s) => s.markAllReviewsAsRead)

  useEffect(() => {
    markAllReviewsAsRead([101, 102, 103, 104, 105])
  }, [markAllReviewsAsRead])

  // Mock aggregated reviews from catalog data for admin moderation
  const allReviews = [
    {
      id: 101,
      author: 'أحمد محمود',
      email: 'ahmed.m@example.com',
      courseTitle: 'Full-Stack Web Development with React & Laravel',
      courseSlug: 'full-stack-web-development-react-laravel',
      rating: 5,
      comment: 'دورة ممتازة وشاملة جداً! الشرح واضح والتطبيقات العملية ساعدتني على بناء مشاريع حقيقية.',
      date: '2026-08-20T10:30:00Z',
      hasReply: true,
    },
    {
      id: 102,
      author: 'سارة عبد الله',
      email: 'sara.a@example.com',
      courseTitle: 'UI/UX Design Masterclass: Figma to Prototype',
      courseSlug: 'ui-ux-design-masterclass-figma-prototype',
      rating: 5,
      comment: 'أفضل دورة لتصميم واجهات المستخدم! التنظيم رائع والتمارين التفاعلية ممتعة ومفيدة للغاية.',
      date: '2026-08-19T14:15:00Z',
      hasReply: false,
    },
    {
      id: 103,
      author: 'عمر خالد',
      email: 'omar.k@example.com',
      courseTitle: 'Data Science & Machine Learning with Python',
      courseSlug: 'data-science-machine-learning-python',
      rating: 4,
      comment: 'محتوى قيم جداً وغني بالمعلومات، أتمنى إضافة المزيد من الأمثلة في جزئية الشبكات العصبية.',
      date: '2026-08-18T09:00:00Z',
      hasReply: true,
    },
    {
      id: 104,
      author: 'مريم حسن',
      email: 'mariam.h@example.com',
      courseTitle: 'Mobile App Development with Flutter',
      courseSlug: 'mobile-app-development-flutter',
      rating: 5,
      comment: 'شرح احترافي ومتابعة ممتازة من المدرب، أنصح بهذه الدورة لكل من يريد تعلم فلاتر من الصفر.',
      date: '2026-08-16T18:45:00Z',
      hasReply: false,
    },
    {
      id: 105,
      author: 'يوسف إبراهيم',
      email: 'youssef.i@example.com',
      courseTitle: 'Cybersecurity Fundamentals & Network Defense',
      courseSlug: 'cybersecurity-fundamentals-network-defense',
      rating: 4,
      comment: 'دورة قوية جداً للمبتدئين في مجال أمن المعلومات والاختراق الأخلاقي.',
      date: '2026-08-15T12:00:00Z',
      hasReply: false,
    },
  ]

  const filteredReviews = allReviews.filter((r) => {
    if (minRating && r.rating < minRating) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.author.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      r.courseTitle.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'الرقابة وإدارة الجودة' : 'Quality & Moderation'}
        title={isAr ? 'إدارة التقييمات والمراجعات' : 'Course Reviews Moderation'}
        description={
          isAr
            ? 'مراجعة آراء وتقييمات الطلاب لجميع الدورات التدريبية وإدارة المحتوى والردود.'
            : 'Audit student reviews, manage feedback, and moderate content across all catalog tracks.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'التقييمات' : 'Reviews' },
        ]}
      />

      <div className="flex flex-col gap-5">
        {/* Toolbar */}
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-8 relative">
            <IconSearch
              size={16}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث في نص التقييم، اسم الطالب، أو اسم الدورة...' : 'Search by comment text, student name, or course...'}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <Select
              value={minRating ?? ''}
              onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
              aria-label={isAr ? 'تصفية حسب التقييم' : 'Filter by rating'}
            >
              <option value="">{isAr ? 'جميع التقييمات (All Ratings)' : 'All Ratings'}</option>
              <option value="5">{isAr ? '5 نجوم فقط' : '5 Stars Only'}</option>
              <option value="4">{isAr ? '4 نجوم فأعلى' : '4 Stars & Up'}</option>
              <option value="3">{isAr ? '3 نجوم فأعلى' : '3 Stars & Up'}</option>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <EmptyState
            icon={<IconMessageCircle size={36} stroke={1.5} />}
            title={isAr ? 'لا توجد تقييمات مطابقة' : 'No reviews match filters'}
            description={isAr ? 'جرب تعديل خيارات البحث أو تصفية النجوم.' : 'Try changing your search terms or star rating filters.'}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <Avatar name={rev.author} size="md" />

                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-text-main text-xs sm:text-sm">{rev.author}</span>
                      <span className="text-[11px] text-text-muted font-mono">{rev.email}</span>
                      <span className="text-[11px] text-text-subtle">·</span>
                      <span className="text-[11px] text-text-muted">{formatDate(rev.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StarRating value={rev.rating} size={14} showValue={false} />
                      <span className="text-xs font-bold text-amber-500">{rev.rating}.0</span>
                      {rev.hasReply ? (
                        <Badge tone="success" className="text-[10px] py-0 px-1.5">
                          {isAr ? 'تم الرد من المدرب' : 'Instructor Replied'}
                        </Badge>
                      ) : null}
                    </div>

                    <p className="text-xs sm:text-sm text-text-main m-0 leading-relaxed bg-surface-muted/40 p-3 rounded-xl border border-border/60">
                      "{rev.comment}"
                    </p>

                    <div className="text-[11px] text-text-muted mt-1">
                      <span>{isAr ? 'الدورة التدريبية: ' : 'Course: '}</span>
                      <Link to={`/courses/${rev.courseSlug}`} className="font-bold text-primary hover:underline">
                        {rev.courseTitle}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<IconTrash size={15} />}
                    className="text-text-muted hover:text-danger hover:bg-danger-light"
                    onClick={() => setPendingDelete({ id: rev.id, author: rev.author })}
                    title={isAr ? 'حذف المراجعة' : 'Delete review'}
                  >
                    {isAr ? 'حذف' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={isAr ? 'حذف هذا التقييم نهائياً؟' : 'Delete this review permanently?'}
        message={
          isAr
            ? `سيتم إزالة مراجعة الطالب “${pendingDelete?.author ?? ''}” وإعادة احتساب متوسط تقييم الدورة.`
            : `Review by ${pendingDelete?.author ?? ''} will be permanently removed.`
        }
        confirmLabel={isAr ? 'حذف التقييم' : 'Delete Review'}
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          toast.success(isAr ? 'تم حذف التقييم بنجاح.' : 'Review deleted.')
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
