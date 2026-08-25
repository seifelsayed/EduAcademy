import { IconCheck, IconCopy, IconCreditCard, IconReceipt } from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { InvoiceModal } from '@/components/organisms/InvoiceModal'
import { PageHeader } from '@/components/templates/PageHeader'
import type { Order, OrderStatus } from '@/core/domain/schemas/engagement'
import { useMyOrders } from '@/features/billing/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { toast } from '@/stores/toastStore'

const STATUS_TONE: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'muted'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'muted',
}

export function OrdersPage() {
  const [page, setPage] = useState(1)
  const [copiedRef, setCopiedRef] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { data, isLoading } = useMyOrders(page)
  const { t, isAr, formatMoney, formatDate } = useTranslation()

  const copyRef = (reference: string) => {
    navigator.clipboard.writeText(reference)
    setCopiedRef(reference)
    toast.success(isAr ? 'تم نسخ رقم الطلب!' : 'Order reference copied!')
    setTimeout(() => setCopiedRef(null), 2500)
  }

  const statusLabels: Record<OrderStatus, string> = {
    paid: isAr ? 'تم الدفع بنجاح' : 'Paid',
    pending: isAr ? 'قيد انتظار الدفع' : 'Pending',
    failed: isAr ? 'فشلت العملية' : 'Failed',
    refunded: isAr ? 'مسترجع' : 'Refunded',
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'الفواتير والمدفوعات' : 'Billing & Purchases'}
        title={t('navigation.orders')}
        description={
          isAr
            ? 'استعراض الإيصالات والعمليات المالية لجميع الكورسات المشترك بها.'
            : 'Review transaction receipts and invoice history for all enrolled courses.'
        }
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.orders') }]}
      />

      {isLoading ? (
        <CenteredSpinner label={t('common.loading')} />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={<IconReceipt size={36} stroke={1.5} />}
          title={isAr ? 'لا توجد عمليات شراء بعد' : 'No purchases recorded yet'}
          description={
            isAr
              ? 'ستظهر هنا إيصالات وفواتير الكورسات المدفوعة التي تشترك بها مستقبلاً.'
              : 'Receipts for your purchased courses and subscriptions will be recorded here.'
          }
          action={
            <Link to="/courses" className="no-underline">
              <Button size="sm">{t('home.browseAllCourses')}</Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                  <th className="py-3.5 px-5 text-start">{isAr ? 'رقم الطلب' : 'Order Reference'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'عنوان الدورة' : 'Course Item'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'المبلغ الإجمالي' : 'Total Amount'}</th>
                  <th className="py-3.5 px-5 text-start">{t('common.status')}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.items.map((order) => (
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
                      {order.course ? (
                        <Link
                          to={`/courses/${order.course.slug}`}
                          className="font-bold text-text-main hover:text-primary transition-colors no-underline line-clamp-1 max-w-sm"
                        >
                          {order.course.title}
                        </Link>
                      ) : (
                        <span className="text-text-subtle italic">
                          {isAr ? 'الدورة غير متاحة حالياً' : 'Unavailable item'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 font-black tabular-nums text-text-main text-sm">
                      {formatMoney(order.total_cents, order.currency)}
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<IconReceipt size={14} />}
                          onClick={() => setSelectedOrder(order)}
                        >
                          {isAr ? 'عرض الفاتورة' : 'View Invoice'}
                        </Button>

                        {order.status === 'pending' ? (
                          <Link to={`/checkout/${order.reference}`} className="no-underline">
                            <Button size="sm" icon={<IconCreditCard size={14} />}>
                              {isAr ? 'إتمام الدفع' : 'Pay Now'}
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
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

      <InvoiceModal
        open={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}

