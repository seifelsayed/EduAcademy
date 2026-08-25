import {
  IconBuildingBank,
  IconCategory,
  IconCertificate,
  IconChartBar,
  IconClipboardCheck,
  IconCoin,
  IconCompass,
  IconCreditCard,
  IconHeadset,
  IconHeart,
  IconLayoutDashboard,
  IconMessageCircle,
  IconPercentage,
  IconPlus,
  IconReceipt,
  IconSchool,
  IconSettings,
  IconShieldLock,
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'

import { useInstructorDashboard } from '@/features/dashboard/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useCanTeach, useIsAdmin } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

export interface NavItem {
  label: string
  to: string
  icon: ReactNode
  /** Match the exact path only — for section index routes. */
  end?: boolean
  /** Live count rendered as a pill; hidden when zero. */
  badge?: number
}

export interface NavGroup {
  id: string
  title: string
  items: NavItem[]
}

/**
 * The dashboard side navigation, assembled from the signed-in user's roles.
 *
 * Every area a user is entitled to appears in one list, grouped by purpose —
 * an instructor who also learns, or an admin who also teaches, no longer has
 * to hop between three separate sidebars to find their own work.
 */
export function useDashboardNav(): NavGroup[] {
  const { t, isAr } = useTranslation()
  const canTeach = useCanTeach()
  const isAdmin = useIsAdmin()

  const hasUnreadOrders = useNotificationStore((s) => s.hasUnreadOrders)
  const readReviewIds = useNotificationStore((s) => s.readReviewIds)
  const clearedAllAt = useNotificationStore((s) => s.clearedAllAt)

  // Shares the cache with the teaching overview page
  const instructorStats = useInstructorDashboard(30, { enabled: canTeach })
  const pendingGrading = instructorStats.data?.stats.pending_submissions ?? 0

  // Dynamic calculation of pending administrative and user items
  const pendingPayoutsCount = (() => {
    if (clearedAllAt) return 0
    try {
      const raw = localStorage.getItem('admin_payouts_queue_egp')
      if (raw) {
        const list = JSON.parse(raw)
        return Array.isArray(list) ? list.filter((p: { status: string }) => p.status === 'pending').length : 0
      }
    } catch {
      // ignore
    }
    return 1 // default pending payout item
  })()

  const openSupportTicketsCount = (() => {
    if (clearedAllAt) return 0
    try {
      const raw = localStorage.getItem('platform_support_tickets_v1')
      if (raw) {
        const list = JSON.parse(raw)
        return Array.isArray(list)
          ? list.filter((t: { status: string }) => t.status === 'open' || t.status === 'in_progress').length
          : 0
      }
    } catch {
      // ignore
    }
    return 2 // default open tickets
  })()

  const instructorEarningsBadge = (() => {
    if (clearedAllAt) return 0
    try {
      const cardRaw = localStorage.getItem('platform_instructor_bank_card_v2')
      if (cardRaw) {
        const card = JSON.parse(cardRaw)
        if (card.approval_status === 'pending_admin_approval') return 1
      }
    } catch {
      // ignore
    }
    return 0
  })()

  const pendingBankApprovalsCount = (() => {
    if (clearedAllAt) return 0
    try {
      const raw = localStorage.getItem('admin_bank_applications_v2')
      if (raw) {
        const list = JSON.parse(raw)
        return Array.isArray(list)
          ? list.filter((a: { approval_status: string }) => a.approval_status === 'pending_admin_approval').length
          : 0
      }
    } catch {
      // ignore
    }
    return 1 // default pending
  })()

  const pendingReviewsCount = Math.max(0, 3 - readReviewIds.length)
  const ordersBadgeCount = hasUnreadOrders && !clearedAllAt ? 2 : 0

  const groups: NavGroup[] = [
    {
      id: 'learning',
      title: t('dash.groupLearning'),
      items: [
        { label: t('dash.overview'), to: '/dashboard', icon: <IconLayoutDashboard size={18} />, end: true },
        { label: t('dash.myLearning'), to: '/my-learning', icon: <IconSchool size={18} /> },
        { label: t('dash.wishlist'), to: '/wishlist', icon: <IconHeart size={18} /> },
        { label: t('dash.certificates'), to: '/certificates', icon: <IconCertificate size={18} /> },
        { label: t('dash.browseCourses'), to: '/courses', icon: <IconCompass size={18} /> },
      ],
    },
  ]

  if (canTeach) {
    groups.push({
      id: 'teaching',
      title: t('dash.groupTeaching'),
      items: [
        { label: t('dash.teachOverview'), to: '/teach', icon: <IconLayoutDashboard size={18} />, end: true },
        { label: t('dash.myTaughtCourses'), to: '/teach/courses', icon: <IconSchool size={18} /> },
        { label: t('dash.newCourse'), to: '/teach/courses/new', icon: <IconPlus size={18} /> },
        {
          label: t('dash.gradingQueue'),
          to: '/teach/grading',
          icon: <IconClipboardCheck size={18} />,
          badge: pendingGrading > 0 ? pendingGrading : undefined,
        },
        {
          label: isAr ? 'الأرباح وسحب المستحقات' : 'Earnings & Payouts',
          to: '/teach/earnings',
          icon: <IconCoin size={18} />,
          badge: instructorEarningsBadge > 0 ? instructorEarningsBadge : undefined,
        },
      ],
    })
  }

  if (isAdmin) {
    groups.push({
      id: 'admin',
      title: t('dash.groupAdmin'),
      items: [
        { label: t('dash.adminOverview'), to: '/admin', icon: <IconShieldLock size={18} />, end: true },
        { label: t('dash.users'), to: '/admin/users', icon: <IconUsers size={18} /> },
        { label: t('dash.categories'), to: '/admin/categories', icon: <IconCategory size={18} /> },
        {
          label: t('dash.orders'),
          to: '/admin/orders',
          icon: <IconShoppingCart size={18} />,
          badge: ordersBadgeCount > 0 ? ordersBadgeCount : undefined,
        },
        {
          label: isAr ? 'اعتماد الحسابات البنكية' : 'Bank Approvals',
          to: '/admin/bank-approvals',
          icon: <IconCreditCard size={18} />,
          badge: pendingBankApprovalsCount > 0 ? pendingBankApprovalsCount : undefined,
        },
        {
          label: isAr ? 'طلبات السحب والتحويل' : 'Payout Approvals',
          to: '/admin/payouts',
          icon: <IconBuildingBank size={18} />,
          badge: pendingPayoutsCount > 0 ? pendingPayoutsCount : undefined,
        },
        {
          label: isAr ? 'تذاكر الدعم الفني' : 'Support Tickets',
          to: '/admin/support',
          icon: <IconHeadset size={18} />,
          badge: openSupportTicketsCount > 0 ? openSupportTicketsCount : undefined,
        },
        {
          label: isAr ? 'المراجعات والتقييمات' : 'Reviews Moderation',
          to: '/admin/reviews',
          icon: <IconMessageCircle size={18} />,
          badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
        },
        { label: isAr ? 'سجل الشهادات' : 'Certificates Registry', to: '/admin/certificates', icon: <IconCertificate size={18} /> },
        { label: isAr ? 'التقارير المالية' : 'Analytics & Reports', to: '/admin/reports', icon: <IconChartBar size={18} /> },
        { label: isAr ? 'إعدادات العمولة والمنصة' : 'Platform Settings', to: '/admin/settings', icon: <IconPercentage size={18} /> },
      ],
    })
  }

  groups.push({
    id: 'account',
    title: t('dash.groupAccount'),
    items: [
      { label: t('dash.purchases'), to: '/orders', icon: <IconReceipt size={18} /> },
      {
        label: isAr ? 'الدعم الفني والمساعدة' : 'Help & Support',
        to: '/support',
        icon: <IconHeadset size={18} />,
        badge: openSupportTicketsCount > 0 ? 1 : undefined,
      },
      { label: t('dash.settings'), to: '/settings', icon: <IconSettings size={18} /> },
    ],
  })

  return groups
}
