import { IconCompass, IconHeart } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { CourseGrid } from '@/components/organisms/CourseGrid'
import { PageHeader } from '@/components/templates/PageHeader'
import { useToggleWishlist, useWishlist } from '@/features/engagement/hooks'
import { useTranslation } from '@/shared/lib/i18n'

export function WishlistPage() {
  const { data, isLoading } = useWishlist()
  const toggle = useToggleWishlist()
  const { t, isAr, formatNumber } = useTranslation()

  const count = data?.length ?? 0

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'الكورسات المحفوظة' : 'Saved Courses'}
        title={t('navigation.wishlist')}
        description={
          count > 0
            ? isAr
              ? `لديك ${formatNumber(count)} دورة تدريبية محفوظة في قائمة رغباتك الخاصة.`
              : `You have ${formatNumber(count)} courses saved to your personal wishlist.`
            : isAr
              ? 'الدورات التي قمت بحفظها للرجوع إليها أو الاشتراك بها لاحقاً.'
              : 'Courses you have bookmarked to explore or enroll in later.'
        }
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.wishlist') }]}
        actions={
          <Link to="/courses" className="no-underline">
            <Button variant="outline" size="sm" icon={<IconCompass size={15} />}>
              {t('dash.browseCourses')}
            </Button>
          </Link>
        }
      />

      <div>
        <CourseGrid
          courses={data ?? []}
          loading={isLoading}
          columns={3}
          onToggleWishlist={(slug) => toggle.mutate(slug)}
          emptyTitle={isAr ? 'قائمة الرغبات فارغة حالياً' : 'Your wishlist is currently empty'}
          emptyDescription={
            isAr
              ? 'انقر على أيقونة القلب على أي بطاقة كورس في الدليل لحفظها والرجوع إليها بسهولة.'
              : 'Click the heart icon on any course card in the catalogue to save it.'
          }
          emptyAction={
            <Link to="/courses" className="no-underline">
              <Button size="md" icon={<IconHeart size={16} />}>
                {t('home.exploreCourses')}
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  )
}

