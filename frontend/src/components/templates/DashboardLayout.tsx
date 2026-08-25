import {
  IconChevronRight,
  IconCircleCheck,
  IconMenu2,
  IconSparkles,
  IconX,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Footer } from '@/components/organisms/Footer'
import { Navbar } from '@/components/organisms/Navbar'
import { useDashboardNav, type NavGroup } from '@/features/dashboard/useDashboardNav'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'

/**
 * Shell for every signed-in area: learning, teaching, and administration.
 * Features a unified, responsive sidebar with role-filtered workspaces,
 * active indicator pills, live pending task counters, and a sleek mobile drawer.
 */
export function DashboardLayout() {
  const groups = useDashboardNav()
  const { t, isAr } = useTranslation()
  const location = useLocation()

  const [isDrawerOpen, setDrawerOpen] = useState(false)

  // Navigating from inside the drawer closes it
  useEffect(() => setDrawerOpen(false), [location.pathname])

  // Lock the page behind the drawer while it is open
  useEffect(() => {
    if (!isDrawerOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isDrawerOpen])

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main">
      <Navbar />

      <main
        className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7"
        id="main-content"
      >
        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-5 p-3 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-xs">
          <button
            type="button"
            className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-primary-light text-primary border border-primary/20 text-xs font-bold shadow-xs hover:bg-primary hover:text-white transition-all cursor-pointer"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={isDrawerOpen}
            aria-controls="dashboard-nav"
          >
            <IconMenu2 size={17} />
            <span>{t('dash.menu')}</span>
          </button>

          <MobileUserBadge />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[19.5rem_minmax(0,1fr)] gap-6 xl:gap-8 items-start">
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-4">
              <UserCard />
              <SidebarNav groups={groups} isAr={isAr} />
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <div className="min-w-0 w-full">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Off-canvas Drawer */}
      {isDrawerOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          <div
            id="dashboard-nav"
            role="dialog"
            aria-modal="true"
            aria-label={t('dash.workspace')}
            className={clsx(
              'relative w-[88vw] max-w-sm h-full bg-surface border-e border-border shadow-2xl overflow-y-auto p-4 flex flex-col gap-4 z-10',
              isAr ? 'ms-auto' : 'me-auto',
            )}
          >
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="font-heading text-sm font-black text-text-main tracking-tight">
                  {t('dash.workspace')}
                </span>
              </div>

              <button
                type="button"
                className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                onClick={() => setDrawerOpen(false)}
                aria-label={t('dash.closeMenu')}
              >
                <IconX size={18} />
              </button>
            </div>

            <UserCard />
            <SidebarNav groups={groups} isAr={isAr} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** User Card displaying profile summary, active role, and verification badge */
function UserCard() {
  const user = useCurrentUser()
  const { t, isAr } = useTranslation()

  if (!user) return null

  const roleConfig =
    user.role === 'admin'
      ? { label: t('dash.roleAdmin'), bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
      : user.role === 'instructor'
        ? { label: t('dash.roleInstructor'), bg: 'bg-secondary-light text-secondary border-secondary/20' }
        : { label: t('dash.roleStudent'), bg: 'bg-primary-light text-primary border-primary/20' }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface/90 backdrop-blur-md border border-border p-4 shadow-xs hover:border-primary/30 transition-all group">
      {/* Decorative accent glow */}
      <div className="absolute top-0 end-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

      <div className="relative z-10 flex items-center gap-3.5">
        <div className="relative shrink-0">
          <Avatar name={user.name} src={user.avatar_url} size="md" />
          <span
            className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface"
            title="Online"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="block text-sm font-black text-text-main truncate leading-tight">
              {user.name}
            </span>
            <IconCircleCheck size={14} className="text-primary shrink-0" />
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border',
                roleConfig.bg,
              )}
            >
              <IconSparkles size={11} />
              <span>{roleConfig.label}</span>
            </span>

            <Link
              to="/settings"
              className="text-[11px] font-bold text-text-muted hover:text-primary transition-colors no-underline"
            >
              {isAr ? 'تعديل' : 'Edit'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileUserBadge() {
  const user = useCurrentUser()
  const { t } = useTranslation()
  if (!user) return null

  const roleLabel =
    user.role === 'admin'
      ? t('dash.roleAdmin')
      : user.role === 'instructor'
        ? t('dash.roleInstructor')
        : t('dash.roleStudent')

  return (
    <div className="flex items-center gap-2.5">
      <div className="text-end">
        <span className="block text-xs font-black text-text-main leading-tight truncate max-w-[140px]">
          {user.name}
        </span>
        <span className="text-[10px] font-bold text-text-muted">{roleLabel}</span>
      </div>
      <Avatar name={user.name} src={user.avatar_url} size="sm" />
    </div>
  )
}


function SidebarNav({ groups, isAr }: { groups: NavGroup[]; isAr: boolean }) {
  return (
    <nav className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-3 shadow-xs flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <div className="px-3 pt-1.5 pb-1 flex items-center justify-between">
            <span className="font-heading text-[10px] font-black uppercase tracking-wider text-text-subtle">
              {group.title}
            </span>
          </div>

          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 no-underline',
                  isActive
                    ? 'bg-primary text-white shadow-sm font-extrabold'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-hover',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={clsx(
                      'shrink-0 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-white' : 'text-text-muted group-hover:text-primary',
                    )}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1 truncate tracking-tight">{item.label}</span>

                  {item.badge ? (
                    <span
                      className={clsx(
                        'shrink-0 min-w-5 px-1.5 py-0.5 text-[10px] font-black rounded-full text-center tabular-nums shadow-xs',
                        isActive
                          ? 'bg-white text-primary'
                          : 'bg-rose-500 text-white animate-pulse',
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : (
                    <IconChevronRight
                      size={14}
                      className={clsx(
                        'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                        isAr ? 'rotate-180' : '',
                        isActive ? 'text-white/70 opacity-100' : 'text-text-subtle',
                      )}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

