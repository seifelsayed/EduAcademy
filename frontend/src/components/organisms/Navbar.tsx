import {
  IconBell,
  IconBuildingBank,
  IconChalkboard,
  IconChevronDown,
  IconCoin,
  IconHeadset,
  IconHeart,
  IconLanguage,
  IconLayoutDashboard,
  IconLogout,
  IconMessageCircle,
  IconMoon,
  IconSettings,
  IconShieldLock,
  IconSun,
  IconUser,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { NavLink, useNavigate } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuDangerItem,
  DropdownMenuDivider,
  DropdownMenuHeader,
  DropdownMenuLink,
  DropdownMenuTrigger,
} from '@/components/atoms/DropdownMenu'
import { Logo } from '@/components/atoms/Logo'
import { SearchInput } from '@/components/molecules/SearchInput'
import { useLogout } from '@/features/auth/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useCanTeach, useCurrentUser, useIsAdmin } from '@/stores/authStore'
import { useCatalogFilterStore } from '@/stores/catalogFilterStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { toast } from '@/stores/toastStore'
import { useUiStore } from '@/stores/uiStore'

export function Navbar() {
  const user = useCurrentUser()
  const canTeach = useCanTeach()
  const isAdmin = useIsAdmin()
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const { t, isAr, toggleLanguage } = useTranslation()
  const setSearch = useCatalogFilterStore((state) => state.setSearch)
  const search = useCatalogFilterStore((state) => state.search ?? '')

  const hasUnreadOrders = useNotificationStore((s) => s.hasUnreadOrders)
  const readReviewIds = useNotificationStore((s) => s.readReviewIds)
  const clearedAllAt = useNotificationStore((s) => s.clearedAllAt)
  const clearAllNotifications = useNotificationStore((s) => s.clearAllNotifications)

  // Real-time unread items count
  const pendingPayouts = (() => {
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
    return 1
  })()

  const openTickets = (() => {
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
    return 2
  })()

  const unreadReviews = Math.max(0, 3 - readReviewIds.length)
  const unreadOrders = hasUnreadOrders && !clearedAllAt ? 2 : 0

  const totalNotifications = isAdmin
    ? pendingPayouts + openTickets + unreadReviews + unreadOrders
    : canTeach
      ? 1 + (openTickets > 0 ? 1 : 0)
      : openTickets > 0 ? 1 : 0

  const navigate = useNavigate()
  const logout = useLogout()

  const handleMarkAllRead = () => {
    clearAllNotifications()
    toast.success(isAr ? 'تم تحديد كافة التنبيهات كمقروءة بنجاح!' : 'All notifications marked as read!')
  }

  const onSearch = (value: string) => {
    setSearch(value)

    if (value.trim()) {
      navigate('/courses')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-xl border-b border-border transition-colors shadow-2xs">
      <div className="w-full px-3 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4 lg:gap-8 min-w-0 shrink-0">
          <Logo responsiveText />

          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" end className={navLinkClass}>
              {t('navigation.home')}
            </NavLink>

            <NavLink to="/courses" className={navLinkClass}>
              {t('navigation.courses')}
            </NavLink>

            {user ? (
              <NavLink to="/my-learning" className={navLinkClass}>
                {t('navigation.myLearning')}
              </NavLink>
            ) : null}

            {canTeach ? (
              <NavLink to="/teach/courses" className={navLinkClass}>
                {t('navigation.teach')}
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div className="hidden lg:flex flex-1 max-w-md mx-2 min-w-0">
          <SearchInput
            value={search}
            onChange={onSearch}
            placeholder={t('navigation.searchPlaceholder')}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Language Toggle Button: Displays the language the user will switch TO */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-text-muted hover:text-text-main hover:bg-surface-muted border border-border bg-surface transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
            onClick={toggleLanguage}
            title={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
            aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <IconLanguage size={16} className="text-primary shrink-0" />
            <span className={clsx('hidden sm:inline', isAr ? 'font-bold font-latin' : 'font-bold font-arabic')}>
              {isAr ? 'English' : 'العربية'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-muted border border-border bg-surface transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? t('navigation.themeToggleDark') : t('navigation.themeToggleLight')}
            title={theme === 'light' ? t('navigation.themeToggleDark') : t('navigation.themeToggleLight')}
          >
            {theme === 'light' ? <IconMoon size={18} className="text-secondary" /> : <IconSun size={18} className="text-amber-400" />}
          </button>

          {/* Real-time Notifications Bell Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div
                  className="relative p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-muted border border-border bg-surface transition-all duration-150 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                  aria-label={isAr ? 'مركز الإشعارات والتنبيهات' : 'Notifications'}
                  title={isAr ? 'مركز التنبيهات' : 'Notifications'}
                >
                  <IconBell size={18} className="text-text-muted hover:text-primary transition-colors" />
                  {totalNotifications > 0 ? (
                    <span className="absolute -top-1 -end-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                      {totalNotifications > 99 ? '99+' : totalNotifications}
                    </span>
                  ) : null}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent width="lg" align={isAr ? 'left' : 'right'}>
                <DropdownMenuHeader>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-text-main">{isAr ? 'التنبيهات والإشعارات' : 'Live Notifications'}</span>
                    {totalNotifications > 0 ? (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-primary hover:underline bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                      >
                        {isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-text-subtle font-bold">
                        {isAr ? 'كل التنبيهات مقروءة' : 'All caught up'}
                      </span>
                    )}
                  </div>
                </DropdownMenuHeader>

                {totalNotifications === 0 ? (
                  <div className="p-4 text-center text-xs text-text-muted">
                    {isAr ? 'لا توجد تنبيهات جديدة حالياً.' : 'No new notifications.'}
                  </div>
                ) : isAdmin ? (
                  <>
                    {pendingPayouts > 0 ? (
                      <DropdownMenuLink
                        to="/admin/payouts"
                        icon={<IconBuildingBank size={16} className="text-amber-500" />}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-xs text-text-main">
                            {isAr ? 'طلب سحب أرباح بانتظار الموافقة' : 'Pending Payout Approval'}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {isAr ? 'د. أحمد محمود - 35,000 ج.م.' : 'Dr. Ahmed - 35,000 EGP'}
                          </span>
                        </div>
                      </DropdownMenuLink>
                    ) : null}

                    {openTickets > 0 ? (
                      <DropdownMenuLink
                        to="/admin/support"
                        icon={<IconHeadset size={16} className="text-primary" />}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-xs text-text-main">
                            {isAr ? 'تذاكر دعم فني مفتوحة' : 'Open Support Tickets'}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {openTickets} {isAr ? 'تذاكر بانتظار الرد والمتابعة' : 'tickets awaiting action'}
                          </span>
                        </div>
                      </DropdownMenuLink>
                    ) : null}

                    {unreadReviews > 0 ? (
                      <DropdownMenuLink
                        to="/admin/reviews"
                        icon={<IconMessageCircle size={16} className="text-emerald-500" />}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-xs text-text-main">
                            {unreadReviews} {isAr ? 'تقييمات جديدة بانتظار الاعتماد' : 'New Reviews Pending'}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {isAr ? 'مراجعة وتقييمات دورات React' : 'React courses reviews'}
                          </span>
                        </div>
                      </DropdownMenuLink>
                    ) : null}

                    {unreadOrders > 0 ? (
                      <DropdownMenuLink
                        to="/admin/orders"
                        icon={<IconBuildingBank size={16} className="text-blue-500" />}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-xs text-text-main">
                            {unreadOrders} {isAr ? 'عمليات شراء جديدة' : 'New orders'}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {isAr ? 'سجل العمليات المالية والمبيعات' : 'Sales ledger'}
                          </span>
                        </div>
                      </DropdownMenuLink>
                    ) : null}
                  </>
                ) : canTeach ? (
                  <>
                    <DropdownMenuLink
                      to="/teach/earnings"
                      icon={<IconCoin size={16} className="text-emerald-500" />}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs text-text-main">
                          {isAr ? 'تقرير الأرباح والسحب البنكي' : 'Earnings & Payout Status'}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {isAr ? 'رصيد متاح للسحب: 119,115 ج.م.' : 'Available balance: 119,115 EGP'}
                        </span>
                      </div>
                    </DropdownMenuLink>

                    {openTickets > 0 ? (
                      <DropdownMenuLink
                        to="/support"
                        icon={<IconHeadset size={16} className="text-primary" />}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-xs text-text-main">
                            {isAr ? 'رد جديد من فريق الدعم الفني' : 'Reply from Support Team'}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            #TICK-2026-1042 - {isAr ? 'بخصوص التحويل البنكي' : 'Payout inquiry'}
                          </span>
                        </div>
                      </DropdownMenuLink>
                    ) : null}
                  </>
                ) : (
                  <DropdownMenuLink
                    to="/support"
                    icon={<IconHeadset size={16} className="text-primary" />}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs text-text-main">
                        {isAr ? 'تذكرة الدعم الفني الخاصة بك' : 'Your Support Ticket'}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        #TICK-2026-1089 - {isAr ? 'قيد المتابعة من الدعم' : 'In Progress'}
                      </span>
                    </div>
                  </DropdownMenuLink>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-2 p-1.5 pe-3 rounded-xl hover:bg-surface-hover border border-border bg-surface transition-all duration-150 shadow-xs group cursor-pointer active:scale-95">
                  <Avatar name={user.name} src={user.avatar_url} size="sm" />
                  <span className="hidden lg:inline text-xs font-bold text-text-main group-hover:text-primary transition-colors max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <IconChevronDown size={14} className="text-text-muted group-hover:text-primary transition-colors stroke-[2.5]" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent width="md" align={isAr ? 'left' : 'right'}>
                <DropdownMenuHeader>
                  <div className="font-bold text-sm text-text-main truncate">{user.name}</div>
                  <div className="text-xs text-text-muted truncate mt-0.5">{user.email}</div>
                </DropdownMenuHeader>

                <DropdownMenuLink to="/dashboard" icon={<IconLayoutDashboard size={16} />}>
                  {t('navigation.dashboard')}
                </DropdownMenuLink>
                <DropdownMenuLink to="/my-learning" icon={<IconUser size={16} />}>
                  {t('navigation.myLearning')}
                </DropdownMenuLink>
                <DropdownMenuLink to="/wishlist" icon={<IconHeart size={16} />}>
                  {t('navigation.wishlist')}
                </DropdownMenuLink>

                {canTeach ? (
                  <DropdownMenuLink to="/teach/courses" icon={<IconChalkboard size={16} />}>
                    {t('navigation.teach')}
                  </DropdownMenuLink>
                ) : null}

                {isAdmin ? (
                  <DropdownMenuLink to="/admin" icon={<IconShieldLock size={16} />}>
                    {t('navigation.admin')}
                  </DropdownMenuLink>
                ) : null}

                <DropdownMenuDivider />

                <DropdownMenuLink to="/settings" icon={<IconSettings size={16} />}>
                  {t('navigation.settings')}
                </DropdownMenuLink>

                <DropdownMenuDangerItem icon={<IconLogout size={16} />} onClick={() => logout.mutate()}>
                  {t('navigation.logout')}
                </DropdownMenuDangerItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  {t('navigation.login')}
                </Button>
              </span>
              <Button size="sm" onClick={() => navigate('/register')}>
                {t('navigation.register')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 no-underline ${
    isActive
      ? 'text-primary bg-primary-light border border-primary/20 shadow-xs'
      : 'text-text-muted hover:text-text-main hover:bg-surface-muted'
  }`
}
