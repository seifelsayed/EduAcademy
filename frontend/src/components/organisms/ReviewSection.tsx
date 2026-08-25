import { IconMessage2, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { Input, Textarea } from '@/components/atoms/inputs'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { StarInput, StarRating } from '@/components/molecules/StarRating'
import type { RatingBreakdown } from '@/core/domain/schemas/engagement'
import {
  useDeleteReview,
  useReplyToReview,
  useReviews,
  useSubmitReview,
} from '@/features/engagement/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'

interface ReviewSectionProps {
  slug: string
  averageRating: number
  ratingCount: number
  breakdown: RatingBreakdown
  /** Only enrolled learners see the write-a-review form. */
  canReview: boolean
  /** The course author may reply to reviews. */
  canReply: boolean
}

export function ReviewSection({
  slug,
  averageRating,
  ratingCount,
  breakdown,
  canReview,
  canReply,
}: ReviewSectionProps) {
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined)
  const { t, tPlural, isAr, formatRelative, formatNumber } = useTranslation()

  const reviews = useReviews(slug, ratingFilter, page)
  const currentUser = useCurrentUser()
  const deleteReview = useDeleteReview(slug)

  const myReview = reviews.data?.items.find((review) => review.is_mine)

  return (
    <section className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-3xl sm:text-5xl font-black text-text-main tabular-nums tracking-tight mb-2">
            {isAr ? formatNumber(parseFloat(averageRating.toFixed(1))) : averageRating.toFixed(1)}
          </div>
          <StarRating value={averageRating} showValue={false} size={22} className="mb-2" />
          <p className="text-xs font-bold text-text-muted m-0">
            {isAr
              ? `مبني على ${tPlural(ratingCount, 'reviews')} من الطلاب`
              : `Based on ${tPlural(ratingCount, 'reviews')}`}
          </p>
        </div>

        <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[String(star)] ?? 0
            const percent = ratingCount > 0 ? (count / ratingCount) * 100 : 0
            const isActive = ratingFilter === star

            return (
              <button
                key={star}
                type="button"
                className={`flex items-center gap-3 p-1.5 rounded-xl transition-colors cursor-pointer text-start ${
                  isActive ? 'bg-primary-light font-bold text-primary' : 'hover:bg-surface-hover'
                }`}
                onClick={() => {
                  setRatingFilter(isActive ? undefined : star)
                  setPage(1)
                }}
                aria-pressed={isActive}
              >
                <span className="w-16 text-xs font-bold text-text-main shrink-0">
                  {isAr ? `${formatNumber(star)} نجوم` : `${star} stars`}
                </span>
                <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-10 text-xs text-text-muted tabular-nums text-end shrink-0">
                  {formatNumber(count)}
                </span>
              </button>
            )
          })}

          {ratingFilter ? (
            <div className="pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setRatingFilter(undefined)}>
                {isAr ? 'عرض جميع التقييمات' : 'Show All Reviews'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {canReview ? <ReviewForm slug={slug} existing={myReview?.comment ?? undefined} /> : null}

      {reviews.isLoading ? (
        <p className="text-sm text-text-muted">{t('common.loading')}</p>
      ) : (reviews.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={<IconMessage2 size={36} stroke={1.5} />}
          title={isAr ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
          description={
            canReview
              ? isAr ? 'كن أول طالب يشارك تجربته وتقييمه لهذا الكورس.' : 'Be the first student to review this course.'
              : isAr ? 'ستظهر التقييمات بمجرد أن يبدأ الطلاب في دراسة الكورس وتقييمه.' : 'Student reviews will appear here once submitted.'
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.data?.items.map((review) => (
            <article
              key={review.id}
              className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-3.5 hover:border-border-hover transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <Avatar
                    name={review.author?.name ?? (isAr ? 'طالب' : 'Student')}
                    src={review.author?.avatar_url}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="font-bold text-sm text-text-main">{review.author?.name ?? (isAr ? 'طالب' : 'Student')}</span>
                      <StarRating value={review.rating} showValue={false} size={14} />
                      <span className="text-xs text-text-subtle">
                        {formatRelative(review.created_at)}
                      </span>
                    </div>

                    {review.title ? <h4 className="font-bold text-sm text-text-main mb-1">{review.title}</h4> : null}
                    {review.comment ? (
                      <p className="text-sm text-text-muted leading-relaxed mb-0">{review.comment}</p>
                    ) : null}

                    {review.instructor_reply ? (
                      <div className="mt-3 p-3.5 rounded-xl bg-primary-light border border-primary/20 text-xs">
                        <strong className="block font-bold text-primary mb-1">{isAr ? 'رد المدرس:' : 'Instructor Reply:'}</strong>
                        <p className="text-text-main mb-0 leading-relaxed">{review.instructor_reply}</p>
                      </div>
                    ) : canReply ? (
                      <ReplyForm slug={slug} reviewId={review.id} />
                    ) : null}
                  </div>
                </div>

                {review.is_mine || currentUser?.role === 'admin' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<IconTrash size={15} />}
                    onClick={() => deleteReview.mutate(review.id)}
                    aria-label={isAr ? 'حذف التقييم' : 'Delete review'}
                    className="text-text-muted hover:text-danger hover:bg-danger-light"
                  />
                ) : null}
              </div>
            </article>
          ))}

          {reviews.data ? <Pagination meta={reviews.data.meta} onChange={setPage} /> : null}
        </div>
      )}
    </section>
  )
}

function ReviewForm({ slug, existing }: { slug: string; existing?: string }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState(existing ?? '')
  const { isAr } = useTranslation()

  const submit = useSubmitReview(slug)

  return (
    <form
      className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        submit.mutate({ rating, title: title || undefined, comment: comment || undefined })
      }}
    >
      <h3 className="text-base font-bold text-text-main m-0">
        {existing
          ? isAr ? 'تعديل تقييمك للكورس' : 'Edit Your Review'
          : isAr ? 'أضف تقييمك ورأيك في الكورس' : 'Write a Review'}
      </h3>

      <div className="flex flex-col gap-3.5">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            {isAr ? 'التقييم بالنجوم' : 'Star Rating'}
          </span>
          <StarInput value={rating} onChange={setRating} />
        </div>

        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={isAr ? 'عنوان ملخص لتقييمك (اختياري)...' : 'Headline for your review (optional)...'}
          aria-label={isAr ? 'عنوان التقييم' : 'Review title'}
        />

        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={isAr ? 'ما أكثر ما أعجبك في الكورس؟ وما الذي يمكن تحسينه؟' : 'What did you like or dislike about this course?'}
          aria-label={isAr ? 'نص التقييم' : 'Review comment'}
          rows={3}
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" size="sm" loading={submit.isPending} disabled={rating === 0}>
          {existing
            ? isAr ? 'حفظ التعديلات' : 'Save Changes'
            : isAr ? 'نشر التقييم' : 'Submit Review'}
        </Button>
      </div>
    </form>
  )
}

function ReplyForm({ slug, reviewId }: { slug: string; reviewId: number }) {
  const [body, setBody] = useState('')
  const [open, setOpen] = useState(false)
  const reply = useReplyToReview(slug)
  const { isAr } = useTranslation()

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="mt-2 text-primary hover:bg-primary-light" onClick={() => setOpen(true)}>
        {isAr ? 'الرد على الطالب' : 'Reply to Student'}
      </Button>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <Textarea
        rows={2}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={isAr ? 'اكتب ردك التوضيحي أو الترحيبي للطالب...' : 'Write your response to the student...'}
        aria-label={isAr ? 'رد المدرس' : 'Instructor response'}
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          loading={reply.isPending}
          disabled={!body.trim()}
          onClick={() => reply.mutate({ id: reviewId, body })}
        >
          {isAr ? 'نشر الرد' : 'Post Reply'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </div>
  )
}
