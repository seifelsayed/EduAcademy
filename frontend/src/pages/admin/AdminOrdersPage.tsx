import { IconCheck, IconCopy, IconReceipt, IconRefresh, IconSearch } from '@tabler/icons-react'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ConfirmDialog } from '@/components/molecules/Modal'
import { Pagination } from '@/components/molecules/Pagination'
import { InvoiceModal } from '@/components/organisms/InvoiceModal'
import { PageHeader } from '@/components/templates/PageHeader'
import type { Order, OrderStatus } from '@/core/domain/schemas/engagement'
import { useAdminOrders, useRefundOrder } from '@/features/billing/hooks'
import { getLocalizedCourse } from '@/features/catalog/localizedCatalog'
import { useTranslation } from '@/shared/lib/i18n'
import { useNotificationStore } from '@/stores/notificationStore'
import { toast } from '@/stores/toastStore'

const STATUS_TONE: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'muted'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'muted',
}

export function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [copiedRef, setCopiedRef] = useState<string | null>(null)
  const [pendingRefund, setPendingRefund] = useState<Order | null>(null)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null)
  const { t, isAr, language, formatMoney, formatDate } = useTranslation()

  const markOrdersAsRead = useNotificationStore((s) => s.markOrdersAsRead)

  useEffect(() => {
    markOrdersAsRead()
  }, [markOrdersAsRead])

  const { data, isLoading } = useAdminOrders(status, page)
  const refund = useRefundOrder()

  const totalRevenue = data?.extra.total_revenue_cents as number | undefined

  const copyRef = (reference: string) => {
    navigator.clipboard.writeText(reference)
    setCopiedRef(reference)
    toast.success(isAr ? 'تم نسخ رقم المعاملة!' : 'Order reference copied!')
    setTimeout(() => setCopiedRef(null), 2500)
  }

  const statusLabels: Record<OrderStatus, string> = {
    paid: isAr ? 'تم الدفع بنجاح' : 'Paid',
    pending: isAr ? 'قيد الانتظار' : 'Pending',
    failed: isAr ? 'فشلت العملية' : 'Failed',
    refunded: isAr ? 'مسترجع' : 'Refunded',
  }

  const tabs: { label: string; value: OrderStatus | undefined }[] = [
    { label: t('common.all'), value: undefined },
    { label: isAr ? 'مدفوعة' : 'Paid', value: 'paid' },
    { label: isAr ? 'قيد الانتظار' : 'Pending', value: 'pending' },
    { label: isAr ? 'مسترجعة' : 'Refunded', value: 'refunded' },
  ]

  const filteredItems = useMemo(() => {
    if (!data?.items) return []
    if (!search.trim()) return data.items

    const query = search.toLowerCase()
    return data.items.filter(
      (order) =>
        order.reference.toLowerCase().includes(query) ||
        order.buyer?.name?.toLowerCase().includes(query) ||
        order.buyer?.email?.toLowerCase().includes(query),
    )
  }, [data?.items, search])

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'السجل المالي والمحاسبي' : 'Financial Ledger'}
        title={isAr ? 'العمليات والطلبات المالية' : 'Transactions & Orders'}
        description={
          totalRevenue !== undefined
            ? isAr
              ? `إجمالي إيرادات المنصة المحصلة: ${formatMoney(totalRevenue)}`
              : `Total platform gross receipts: ${formatMoney(totalRevenue)}`
            : isAr
              ? 'استعراض عمليات الدفع وعمولات المنصة وطلبات الاسترجاع.'
              : 'Review platform-wide customer orders, fees, refunds, and financial transaction ledger.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'العمليات المالية' : 'Transactions' },
        ]}
      />

      <div className="flex flex-col gap-6">
        {/* Navigation Tabs and Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface/90 backdrop-blur-md border border-border w-fit shadow-xs">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
                  status === tab.value
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-hover',
                )}
                onClick={() => {
                  setStatus(tab.value)
                  setPage(1)
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <IconSearch
              size={16}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث برقم الطلب أو العميل...' : 'Search by reference or customer...'}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <CenteredSpinner label={t('common.loading')} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<IconReceipt size={36} stroke={1.5} />}
            title={
              search
                ? isAr
                  ? 'لا توجد معاملات مطابقة لبحثك'
                  : 'No transactions match your search'
                : isAr
                  ? 'لا توجد عمليات في هذا القسم'
                  : 'No transactions found'
            }
            description={
              isAr
                ? 'ستظهر هنا جميع المعاملات المالية فور قيام الطلاب بالدفع والتسجيل في الدورات.'
                : 'All financial activities, receipts, and platform invoices will appear here.'
            }
          />
        ) : (
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                    <th className="py-3.5 px-5 text-start">{isAr ? 'رقم المعاملة' : 'Order Reference'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'الدورة التدريبية' : 'Course Item'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'المبلغ الإجمالي' : 'Total'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'عمولة المنصة' : 'Platform Fee'}</th>
                    <th className="py-3.5 px-5 text-start">{t('common.status')}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((order) => {
                    const course = order.course ? getLocalizedCourse(order.course, language) : null
                    return (
                      <tr key={order.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-text-main">
                            <span>{order.reference}</span>
                            <button
                              type="button"
                              onClick={() => copyRef(order.reference)}
                              className="p-1 rounded text-text-subtle hover:text-text-main transition-colors cursor-pointer"
                              title={isAr ? 'نسخ رقم الطلب' : 'Copy reference'}
                            >
                              {copiedRef === order.reference ? (
                                <IconCheck size={13} className="text-emerald-600" />
                              ) : (
                                <IconCopy size={13} />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-bold text-text-main text-xs sm:text-sm">{order.buyer?.name ?? '—'}</div>
                          <div className="text-[11px] text-text-muted font-mono">{order.buyer?.email}</div>
                        </td>

                        <td className="py-3.5 px-5">
                          {course ? (
                            <Link
                              to={`/courses/${course.slug}`}
                              className="font-bold text-text-main hover:text-primary transition-colors no-underline line-clamp-1 max-w-xs"
                            >
                              {course.title}
                            </Link>
                          ) : (
                            <span className="text-text-subtle italic">{isAr ? 'الدورة غير متاحة حالياً' : 'Course no longer available'}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 font-black tabular-nums text-text-main text-sm">
                          {formatMoney(order.total_cents, order.currency)}
                        </td>

                        <td className="py-3.5 px-5 tabular-nums text-text-muted text-xs font-semibold">
                          {order.platform_fee_cents !== undefined
                            ? formatMoney(order.platform_fee_cents, order.currency)
                            : '—'}
                        </td>

                        <td className="py-3.5 px-5">
                          <Badge tone={STATUS_TONE[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-5 text-xs text-text-muted">
                          {formatDate(order.paid_at ?? order.created_at)}
                        </td>

                        <td className="py-3.5 px-5 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<IconReceipt size={14} />}
                              onClick={() => setSelectedInvoiceOrder(order)}
                              title={isAr ? 'عرض الفاتورة' : 'View Invoice'}
                            >
                              {isAr ? 'الفاتورة' : 'Invoice'}
                            </Button>

                            {order.status === 'paid' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<IconRefresh size={14} />}
                                className="text-text-muted hover:text-danger hover:bg-danger-light"
                                onClick={() => setPendingRefund(order)}
                                title={isAr ? 'استرجاع الطلب' : 'Refund Order'}
                              >
                                {isAr ? 'استرجاع' : 'Refund'}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {data ? (
              <div className="p-4 border-t border-border bg-surface-muted/30">
                <Pagination meta={data.meta} onChange={setPage} />
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingRefund !== null}
        title={isAr ? 'استرجاع مبلغ هذا الطلب؟' : 'Process Refund for Order?'}
        message={
          isAr
            ? `سيتم تحويل حالة الطلب ${pendingRefund?.reference ?? ''} إلى مسترجع وإلغاء تسجيل الطالب من الدورة.`
            : `Order ${pendingRefund?.reference ?? ''} will be marked as refunded and the learner's course enrollment revoked.`
        }
        confirmLabel={isAr ? 'تأكيد الاسترجاع' : 'Process Refund'}
        destructive
        loading={refund.isPending}
        onCancel={() => setPendingRefund(null)}
        onConfirm={() => {
          if (pendingRefund) refund.mutate(pendingRefund.reference)
          setPendingRefund(null)
        }}
      />

      <InvoiceModal
        open={selectedInvoiceOrder !== null}
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  )
}

