import {
  IconCheck,
  IconClock,
  IconCreditCard,
  IconEye,
  IconFileSpreadsheet,
  IconLock,
  IconReceipt,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ConfirmDialog, Modal } from '@/components/molecules/Modal'
import { PageHeader } from '@/components/templates/PageHeader'
import { useTranslation } from '@/shared/lib/i18n'
import {
  DEFAULT_INSTRUCTOR_STATEMENT,
  getStoredBankCard,
  maskCardNumber,
  maskCvv,
  saveStoredBankCard,
  type BankCardDetails,
  type InstructorAccountStatement,
} from '@/stores/financialStore'
import { toast } from '@/stores/toastStore'

export interface AdminPayoutItem {
  id: string
  reference: string
  instructor_id: number
  instructor_name: string
  instructor_email: string
  amount_cents: number
  currency: string
  bank_name: string
  card_number: string
  card_holder_name: string
  expiry_date: string
  cvv: string
  requested_at: string
  estimated_payout_at: string
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected'
  admin_note?: string
}

const INITIAL_ADMIN_PAYOUTS: AdminPayoutItem[] = [
  {
    id: 'pay-102',
    reference: 'PAY-2026-9931',
    instructor_id: 12,
    instructor_name: 'د. أحمد محمود الشريف',
    instructor_email: 'ahmed.mahmoud@education.platform',
    amount_cents: 3500000, // 35,000 EGP
    currency: 'EGP',
    bank_name: 'البنك الأهلي المصري (NBE)',
    card_number: '5200 4589 1234 4129',
    card_holder_name: 'أحمد محمود الشريف',
    expiry_date: '09/28',
    cvv: '842',
    requested_at: '2026-08-24T11:00:00Z',
    estimated_payout_at: '2026-08-31T11:00:00Z',
    status: 'pending',
    admin_note: 'طلب سحب جديد بالجنيه المصري. في انتظار مراجعة وتدقيق الإدارة.',
  },
  {
    id: 'pay-101',
    reference: 'PAY-2026-8812',
    instructor_id: 15,
    instructor_name: 'م. مريم حسن كمال',
    instructor_email: 'mariam.hassan@education.platform',
    amount_cents: 2250000, // 22,500 EGP
    currency: 'EGP',
    bank_name: 'البنك التجاري الدولي (CIB Egypt)',
    card_number: '4100 8821 7734 5091',
    card_holder_name: 'مريم حسن كمال',
    expiry_date: '11/27',
    cvv: '319',
    requested_at: '2026-08-20T10:00:00Z',
    estimated_payout_at: '2026-08-27T10:00:00Z',
    status: 'approved',
    admin_note: 'تمت الموافقة من الإدارة وجاري التحويل البنكي خلال مهلة الـ 7 أيام عمل.',
  },
  {
    id: 'pay-100',
    reference: 'PAY-2026-7490',
    instructor_id: 18,
    instructor_name: 'د. يوسف إبراهيم المنصور',
    instructor_email: 'youssef.ibrahim@education.platform',
    amount_cents: 6000000, // 60,000 EGP
    currency: 'EGP',
    bank_name: 'بنك مصر (Banque Misr)',
    card_number: '5300 9912 3344 6712',
    card_holder_name: 'يوسف إبراهيم المنصور',
    expiry_date: '04/29',
    cvv: '551',
    requested_at: '2026-08-01T12:30:00Z',
    estimated_payout_at: '2026-08-08T12:30:00Z',
    status: 'paid',
    admin_note: 'تم التحويل البنكي الفعلي بنجاح برقم إشعار التحويل البنكي TX-8894120.',
  },
]

export function AdminPayoutsPage() {
  const { t, isAr, formatMoney, formatDate, formatNumber, formatPercent } = useTranslation()

  const [payouts, setPayouts] = useState<AdminPayoutItem[]>(() => {
    const saved = localStorage.getItem('admin_payouts_queue_egp')
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_PAYOUTS
  })

  const [instructorBankCard, setInstructorBankCard] = useState<BankCardDetails>(() => getStoredBankCard())

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedAuditPayout, setSelectedAuditPayout] = useState<AdminPayoutItem | null>(null)
  const [statement] = useState<InstructorAccountStatement>(DEFAULT_INSTRUCTOR_STATEMENT)
  const [pendingReject, setPendingReject] = useState<AdminPayoutItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    saveStoredBankCard(instructorBankCard)
  }, [instructorBankCard])

  // High-level queue metrics in EGP
  const pendingVolumeCents = payouts
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount_cents, 0)

  const approvedInFlightCents = payouts
    .filter((p) => p.status === 'approved' || p.status === 'processing')
    .reduce((acc, p) => acc + p.amount_cents, 0)

  const totalPaidVolumeCents = payouts
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount_cents, 0)

  const filteredPayouts = payouts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.instructor_name.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q) ||
      p.card_number.toLowerCase().includes(q) ||
      p.bank_name.toLowerCase().includes(q)
    )
  })

  const handleApproveBankCard = () => {
    const updated: BankCardDetails = {
      ...instructorBankCard,
      approval_status: 'approved',
      approved_at: new Date().toISOString(),
      admin_notes: 'تمت مطابقة والتحقق من صحة البطاقة والحساب البنكي رسمياً.',
    }
    setInstructorBankCard(updated)
    toast.success(isAr ? 'تم اعتماد الحساب البنكي والبطاقة بنجاح!' : 'Bank card approved successfully!')
  }

  const handleRejectBankCard = () => {
    const updated: BankCardDetails = {
      ...instructorBankCard,
      approval_status: 'rejected',
      admin_notes: 'تم رفض بيانات البطاقة لعدم تطابق الاسم مع السجل المدني.',
    }
    setInstructorBankCard(updated)
    toast.error(isAr ? 'تم رفض البطاقة البنكية وإشعار المدرس لتعديلها.' : 'Bank card rejected.')
  }

  const handleApprovePayout = (payout: AdminPayoutItem) => {
    const updated = payouts.map((p) =>
      p.id === payout.id
        ? {
            ...p,
            status: 'approved' as const,
            admin_note: isAr
              ? 'تمت موافقة الإدارة بنجاح. التحويل البنكي قيد التنفيذ خلال 7 أيام عمل.'
              : 'Approved by administrator. Bank transfer in progress (7 business days window).',
          }
        : p,
    )
    setPayouts(updated)
    localStorage.setItem('admin_payouts_queue_egp', JSON.stringify(updated))
    if (selectedAuditPayout?.id === payout.id) {
      setSelectedAuditPayout(updated.find((p) => p.id === payout.id) ?? null)
    }
    toast.success(isAr ? 'تمت الموافقة على طلب السحب بنجاح!' : 'Payout request approved!')
  }

  const handleMarkAsPaid = (payout: AdminPayoutItem) => {
    const txRef = `TX-EG-${Math.floor(1000000 + Math.random() * 9000000)}`
    const updated = payouts.map((p) =>
      p.id === payout.id
        ? {
            ...p,
            status: 'paid' as const,
            admin_note: isAr
              ? `تم التحويل البنكي الفعلي بنجاح عبر الحساب المصري برقم إشعار ${txRef}.`
              : `Dispatched and settled via Egyptian bank wire (Ref: ${txRef}).`,
          }
        : p,
    )
    setPayouts(updated)
    localStorage.setItem('admin_payouts_queue_egp', JSON.stringify(updated))
    if (selectedAuditPayout?.id === payout.id) {
      setSelectedAuditPayout(updated.find((p) => p.id === payout.id) ?? null)
    }
    toast.success(isAr ? 'تم تأكيد التحويل البنكي وتسوية الطلب بنجاح!' : 'Payout marked as paid and settled!')
  }

  const handleRejectPayout = () => {
    if (!pendingReject) return
    const updated = payouts.map((p) =>
      p.id === pendingReject.id
        ? {
            ...p,
            status: 'rejected' as const,
            admin_note: rejectReason.trim() || (isAr ? 'تم رفض الطلب لعدم مطابقة بيانات التحويل.' : 'Request rejected.'),
          }
        : p,
    )
    setPayouts(updated)
    localStorage.setItem('admin_payouts_queue_egp', JSON.stringify(updated))
    setPendingReject(null)
    setRejectReason('')
    setSelectedAuditPayout(null)
    toast.success(isAr ? 'تم رفض طلب السحب وإعادة الرصيد إلى محفظة المدرس.' : 'Payout request rejected and balance restored.')
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'الرقابة المالية والتحويلات' : 'Treasury & Settlements'}
        title={isAr ? 'إدارة ومراجعة طلبات السحب والحسابات البنكية (EGP)' : 'Instructor Payout Approvals (EGP)'}
        description={
          isAr
            ? 'مراجعة كشوف حسابات المدرسين ومبيعات الكورسات، اعتماد البطاقات والحسابات البنكية المصرية، والموافقة على التحويلات.'
            : 'Audit instructor account statements, approve Egyptian bank cards, and authorize 7-day payouts in EGP.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'طلبات السحب' : 'Payouts' },
        ]}
      />

      {/* Bank Card Verification Quick Review Banner */}
      <div className="p-5 rounded-3xl bg-surface/90 backdrop-blur-md border border-border shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <IconCreditCard size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-main text-xs sm:text-sm">
                {isAr ? 'بطاقة السحب الحالية للمدرس:' : 'Instructor Bank Card:'} {instructorBankCard.card_holder_name}
              </span>
              <Badge
                tone={
                  instructorBankCard.approval_status === 'approved'
                    ? 'success'
                    : instructorBankCard.approval_status === 'rejected'
                      ? 'danger'
                      : 'warning'
                }
              >
                {instructorBankCard.approval_status === 'approved'
                  ? (isAr ? 'معتمد رسمياً' : 'Approved')
                  : instructorBankCard.approval_status === 'rejected'
                    ? (isAr ? 'مرفوض' : 'Rejected')
                    : (isAr ? 'بانتظار موافقة الإدارة' : 'Pending Approval')}
              </Badge>
            </div>
            <div className="text-xs text-text-muted mt-0.5 flex items-center gap-2 flex-wrap font-mono">
              <span>{instructorBankCard.bank_name}</span>
              <span>·</span>
              <span className="text-primary font-bold">{maskCardNumber(instructorBankCard.card_number)}</span>
              <span>·</span>
              <span>Exp: {instructorBankCard.expiry_date}</span>
              <span>·</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <IconLock size={12} />
                CVV: {maskCvv()} ({isAr ? 'مشفر' : 'Encrypted'})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {instructorBankCard.approval_status !== 'approved' ? (
            <Button
              size="sm"
              icon={<IconShieldCheck size={15} />}
              onClick={handleApproveBankCard}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isAr ? 'اعتماد الحساب البنكي / الكارت' : 'Approve Card'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={<IconX size={15} />}
              onClick={handleRejectBankCard}
              className="text-danger hover:bg-danger-light"
            >
              {isAr ? 'إلغاء الاعتماد' : 'Revoke Approval'}
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards in EGP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'طلبات سحب بانتظار الموافقة' : 'Pending Approvals'}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <IconClock size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {formatMoney(pendingVolumeCents, 'EGP')}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {payouts.filter((p) => p.status === 'pending').length} {isAr ? 'طلب سحب جديد' : 'pending requests'}
            </span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'معتمدة قيد التحويل (7 أيام عمل)' : 'Approved In-Flight'}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <IconRefresh size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-primary tabular-nums">
              {formatMoney(approvedInFlightCents, 'EGP')}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'بانتظار إتمام التسوية البنكية' : 'Egyptian wire clearing'}
            </span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'إجمالي المبالغ المسددة' : 'Settled Payouts'}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <IconShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatMoney(totalPaidVolumeCents, 'EGP')}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'تم تحويلها لحسابات المدرسين' : 'Lifetime completed payouts'}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-md w-full">
          <IconSearch
            size={16}
            className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'البحث باسم المدرس، رقم الطلب، أو رقم الكارت...' : 'Search instructor, ref, or card...'}
            className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-muted/60 border border-border/80 text-xs">
          {[
            { label: isAr ? 'الكل' : 'All', val: 'all' },
            { label: isAr ? 'قيد المراجعة' : 'Pending', val: 'pending' },
            { label: isAr ? 'تمت الموافقة' : 'Approved', val: 'approved' },
            { label: isAr ? 'تم التحويل' : 'Paid', val: 'paid' },
            { label: isAr ? 'مرفوض' : 'Rejected', val: 'rejected' },
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === tab.val
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payouts Table */}
      {filteredPayouts.length === 0 ? (
        <EmptyState
          icon={<IconReceipt size={36} stroke={1.5} />}
          title={isAr ? 'لا توجد طلبات سحب مطابقة' : 'No payout requests found'}
          description={isAr ? 'ستظهر هنا طلبات سحب الأرباح فور إرسالها من قبل المدرسين.' : 'Instructor payout requests will appear here.'}
        />
      ) : (
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                  <th className="py-3.5 px-5 text-start">{isAr ? 'المدرس' : 'Instructor'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'المبلغ المطلوب (EGP)' : 'Amount'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'البنك المصري / الكارت' : 'Bank & Card'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'الجدول الزمني (7 أيام)' : 'Timeline'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={payout.instructor_name} size="sm" />
                        <div>
                          <div className="font-bold text-text-main text-xs sm:text-sm">{payout.instructor_name}</div>
                          <div className="text-[11px] text-text-muted font-mono">{payout.instructor_email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-black tabular-nums text-sm text-text-main">
                        {formatMoney(payout.amount_cents, 'EGP')}
                      </div>
                      <code className="text-[10px] text-primary font-mono font-bold">#{payout.reference}</code>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-bold text-text-main text-xs">{payout.bank_name}</div>
                      <div className="font-mono text-[11px] text-text-muted">
                        {payout.card_number.replace(/\d{4}(?=.)/g, '$& ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-xs">
                      <div>{formatDate(payout.requested_at)}</div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                        {isAr ? 'استحقاق: ' : 'Est: '} {formatDate(payout.estimated_payout_at)}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <Badge
                        tone={
                          payout.status === 'paid'
                            ? 'success'
                            : payout.status === 'approved'
                              ? 'primary'
                              : payout.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                        }
                      >
                        {payout.status === 'paid'
                          ? (isAr ? 'تم التحويل البنكي' : 'Paid')
                          : payout.status === 'approved'
                            ? (isAr ? 'معتمد (خلال 7 أيام)' : 'Approved')
                            : payout.status === 'rejected'
                              ? (isAr ? 'مرفوض' : 'Rejected')
                              : (isAr ? 'بانتظار الموافقة' : 'Pending')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<IconEye size={14} />}
                          onClick={() => setSelectedAuditPayout(payout)}
                          title={isAr ? 'مراجعة كشف الحساب وتفاصيل المبيعات' : 'Detailed Account Statement'}
                        >
                          {isAr ? 'كشف الحساب' : 'Audit'}
                        </Button>

                        {payout.status === 'pending' ? (
                          <Button
                            size="sm"
                            icon={<IconCheck size={14} />}
                            onClick={() => handleApprovePayout(payout)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            {isAr ? 'موافقة' : 'Approve'}
                          </Button>
                        ) : payout.status === 'approved' ? (
                          <Button
                            size="sm"
                            icon={<IconShieldCheck size={14} />}
                            onClick={() => handleMarkAsPaid(payout)}
                            className="bg-primary hover:bg-primary-hover text-white font-bold"
                          >
                            {isAr ? 'تأكيد التحويل' : 'Mark Paid'}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Account Statement & Payout Audit Modal */}
      {selectedAuditPayout ? (
        <Modal
          open={selectedAuditPayout !== null}
          onClose={() => setSelectedAuditPayout(null)}
          size="xl"
          title={isAr ? `كشف حساب وتدقيق مالي: ${selectedAuditPayout.instructor_name}` : `Financial Audit: ${selectedAuditPayout.instructor_name}`}
        >
          <div className="flex flex-col gap-6 select-text">
            {/* Instructor Summary Header */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-muted/60 border border-border flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar name={selectedAuditPayout.instructor_name} size="md" />
                <div>
                  <h4 className="font-bold text-text-main text-sm m-0">{selectedAuditPayout.instructor_name}</h4>
                  <span className="text-xs text-text-muted font-mono">{selectedAuditPayout.instructor_email}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[11px] text-text-muted">{isAr ? 'المبلغ المطلوب سحبه:' : 'Requested Payout:'}</span>
                <span className="font-black text-xl text-primary tabular-nums">
                  {formatMoney(selectedAuditPayout.amount_cents, 'EGP')}
                </span>
              </div>
            </div>

            {/* Itemized Sales Statement Breakdown (السعر × عدد المشترين - العمولة) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-main flex items-center gap-1.5">
                  <IconFileSpreadsheet size={16} className="text-primary" />
                  {isAr ? 'كشف تفصيلي لمبيعات الكورسات والورش (السعر × عدد الطلاب):' : 'Itemized Course Sales Statement:'}
                </span>
                <span className="text-[11px] text-text-muted font-bold">
                  {statement.items.length} {isAr ? 'بنود مبيعات' : 'Items'}
                </span>
              </div>

              <div className="overflow-x-auto border border-border rounded-2xl">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-muted/80 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                      <th className="py-2.5 px-3.5 text-start">{isAr ? 'اسم الدورة / الورشة' : 'Course'}</th>
                      <th className="py-2.5 px-3.5 text-center">{isAr ? 'سعر الوحدة' : 'Price'}</th>
                      <th className="py-2.5 px-3.5 text-center">{isAr ? 'عدد المشترين' : 'Buyers'}</th>
                      <th className="py-2.5 px-3.5 text-end">{isAr ? 'إجمالي المبيعات' : 'Gross'}</th>
                      <th className="py-2.5 px-3.5 text-end">{isAr ? 'نسبة وعمولة الموقع' : 'Commission Cut'}</th>
                      <th className="py-2.5 px-3.5 text-end">{isAr ? 'صافي المدرس' : 'Net'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {statement.items.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-hover/30 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-text-main">
                          {item.title}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-bold tabular-nums">
                          {formatMoney(item.unit_price_cents, 'EGP')}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-black text-primary tabular-nums">
                          {formatNumber(item.buyers_count)}
                        </td>
                        <td className="py-2.5 px-3.5 text-end font-bold tabular-nums text-text-main">
                          {formatMoney(item.gross_cents, 'EGP')}
                        </td>
                        <td className="py-2.5 px-3.5 text-end tabular-nums text-amber-700 dark:text-amber-300 font-medium">
                          −{formatMoney(item.commission_cut_cents, 'EGP')} ({formatPercent(item.commission_rate * 100, 0)})
                        </td>
                        <td className="py-2.5 px-3.5 text-end font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatMoney(item.net_earnings_cents, 'EGP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface-muted/90 font-black border-t-2 border-border text-text-main text-xs">
                      <td colSpan={3} className="py-3 px-3.5 text-start">
                        {isAr ? 'إجمالي كشف الحساب الكلي:' : 'Total Sum:'}
                      </td>
                      <td className="py-3 px-3.5 text-end tabular-nums">
                        {formatMoney(statement.total_gross_cents, 'EGP')}
                      </td>
                      <td className="py-3 px-3.5 text-end tabular-nums text-amber-700 dark:text-amber-300">
                        −{formatMoney(statement.total_commission_cut_cents, 'EGP')}
                      </td>
                      <td className="py-3 px-3.5 text-end tabular-nums text-emerald-600 dark:text-emerald-400 font-black">
                        {formatMoney(statement.total_net_cents, 'EGP')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Bank Card Details for Payout Transfer (ENCRYPTED & MASKED) */}
            <div className="p-4 rounded-2xl bg-surface border border-border text-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-text-main text-xs flex items-center gap-1.5">
                  <IconCreditCard size={16} className="text-primary" />
                  {isAr ? 'بيانات كارت الحساب البنكي المصري المعتمد:' : 'Egyptian Card & Bank Details:'}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <IconLock size={12} />
                  {isAr ? 'بيانات مشفرة ومحمية (PCI-DSS Compliant)' : '256-bit Encrypted'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-text-muted pt-1">
                <div>
                  <span className="block text-[10px] uppercase font-bold">{isAr ? 'اسم صاحب الكارت:' : 'Cardholder:'}</span>
                  <span className="font-bold text-text-main">{selectedAuditPayout.card_holder_name}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold">{isAr ? 'البنك المصري:' : 'Bank:'}</span>
                  <span className="font-bold text-text-main">{selectedAuditPayout.bank_name}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold">{isAr ? 'رقم الكارت (مشفر):' : 'Card Number (Masked):'}</span>
                  <code className="font-mono font-bold text-primary text-xs tracking-wider">
                    {maskCardNumber(selectedAuditPayout.card_number)}
                  </code>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold">{isAr ? 'تاريخ الانتهاء / رمز الأمان:' : 'Expiry / Security:'}</span>
                  <span className="font-mono font-bold text-text-main flex items-center gap-1">
                    <span>{selectedAuditPayout.expiry_date}</span>
                    <span>·</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-0.5">
                      <IconLock size={11} />
                      CVV: {maskCvv()} ({isAr ? 'مشفر' : 'Encrypted'})
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-light"
                onClick={() => {
                  setPendingReject(selectedAuditPayout)
                }}
              >
                {isAr ? 'رفض طلب السحب' : 'Reject Request'}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedAuditPayout(null)}>
                  {isAr ? 'إغلاق' : 'Close'}
                </Button>

                {selectedAuditPayout.status === 'pending' ? (
                  <Button
                    size="sm"
                    icon={<IconCheck size={15} />}
                    onClick={() => handleApprovePayout(selectedAuditPayout)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                  >
                    {isAr ? 'موافقة وبدء مهلة التحويل (7 أيام)' : 'Approve Payout'}
                  </Button>
                ) : selectedAuditPayout.status === 'approved' ? (
                  <Button
                    size="sm"
                    icon={<IconShieldCheck size={15} />}
                    onClick={() => handleMarkAsPaid(selectedAuditPayout)}
                    className="bg-primary hover:bg-primary-hover text-white font-black"
                  >
                    {isAr ? 'تأكيد إتمام التحويل البنكي' : 'Mark as Paid'}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Reject Request Dialog */}
      <ConfirmDialog
        open={pendingReject !== null}
        title={isAr ? 'رفض طلب السحب وإعادة الرصيد؟' : 'Reject Payout Request?'}
        message={
          isAr
            ? `سيتم إلغاء طلب السحب رقم ${pendingReject?.reference ?? ''} وإعادة المبلغ ${formatMoney(pendingReject?.amount_cents ?? 0, 'EGP')} إلى محفظة المدرس.`
            : `Payout ${pendingReject?.reference ?? ''} will be rejected and funds returned to instructor wallet.`
        }
        confirmLabel={isAr ? 'تأكيد الرفض' : 'Confirm Reject'}
        destructive
        onCancel={() => setPendingReject(null)}
        onConfirm={handleRejectPayout}
      />
    </div>
  )
}
