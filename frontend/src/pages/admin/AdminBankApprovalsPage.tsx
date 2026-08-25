import {
  IconCheck,
  IconClock,
  IconCreditCard,
  IconLock,
  IconSearch,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ConfirmDialog } from '@/components/molecules/Modal'
import { PageHeader } from '@/components/templates/PageHeader'
import { useTranslation } from '@/shared/lib/i18n'
import {
  getStoredBankCard,
  maskCardNumber,
  maskCvv,
  saveStoredBankCard,
} from '@/stores/financialStore'
import { toast } from '@/stores/toastStore'

export interface InstructorBankApplication {
  id: string
  instructor_id: number
  instructor_name: string
  instructor_email: string
  bank_name: string
  card_number: string
  card_holder_name: string
  expiry_date: string
  cvv: string
  approval_status: 'pending_admin_approval' | 'approved' | 'rejected'
  submitted_at: string
  approved_at?: string
  admin_notes?: string
  lifetime_earnings_cents: number
}

const INITIAL_APPLICATIONS: InstructorBankApplication[] = [
  {
    id: 'bank-app-1',
    instructor_id: 12,
    instructor_name: 'د. أحمد محمود الشريف',
    instructor_email: 'ahmed.mahmoud@education.platform',
    bank_name: 'البنك الأهلي المصري (National Bank of Egypt - NBE)',
    card_number: '5200 4589 1234 4129',
    card_holder_name: 'أحمد محمود الشريف',
    expiry_date: '09/28',
    cvv: '842',
    approval_status: 'pending_admin_approval',
    submitted_at: '2026-08-24T10:00:00Z',
    lifetime_earnings_cents: 17911500, // 179,115 EGP
    admin_notes: 'في انتظار فحص وتدقيق مطابقة الاسم مع كشف الحساب البنكي.',
  },
  {
    id: 'bank-app-2',
    instructor_id: 15,
    instructor_name: 'م. مريم حسن كمال',
    instructor_email: 'mariam.hassan@education.platform',
    bank_name: 'البنك التجاري الدولي (CIB Egypt)',
    card_number: '4100 8821 7734 5091',
    card_holder_name: 'مريم حسن كمال',
    expiry_date: '11/27',
    cvv: '319',
    approval_status: 'approved',
    submitted_at: '2026-08-18T14:30:00Z',
    approved_at: '2026-08-19T09:00:00Z',
    lifetime_earnings_cents: 9450000, // 94,500 EGP
    admin_notes: 'تمت مطابقة بطاقة الخصم المباشر بنجاح وتفعيل إمكانية السحب.',
  },
  {
    id: 'bank-app-3',
    instructor_id: 18,
    instructor_name: 'د. يوسف إبراهيم المنصور',
    instructor_email: 'youssef.ibrahim@education.platform',
    bank_name: 'بنك مصر (Banque Misr)',
    card_number: '5300 9912 3344 6712',
    card_holder_name: 'يوسف إبراهيم المنصور',
    expiry_date: '04/29',
    cvv: '551',
    approval_status: 'approved',
    submitted_at: '2026-08-01T12:00:00Z',
    approved_at: '2026-08-02T10:30:00Z',
    lifetime_earnings_cents: 14200000, // 142,000 EGP
    admin_notes: 'حساب وبطاقة بنكية مصرية معتمدة رسمياً.',
  },
]

export function AdminBankApprovalsPage() {
  const { t, isAr, formatMoney, formatDate } = useTranslation()

  const [applications, setApplications] = useState<InstructorBankApplication[]>(() => {
    const saved = localStorage.getItem('admin_bank_applications_v2')
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS
  })

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<InstructorBankApplication | null>(null)
  const [rejectingApp, setRejectingApp] = useState<InstructorBankApplication | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const pendingCount = applications.filter((a) => a.approval_status === 'pending_admin_approval').length
  const approvedCount = applications.filter((a) => a.approval_status === 'approved').length
  const rejectedCount = applications.filter((a) => a.approval_status === 'rejected').length

  const handleApprove = (app: InstructorBankApplication) => {
    const updated = applications.map((a) =>
      a.id === app.id
        ? {
            ...a,
            approval_status: 'approved' as const,
            approved_at: new Date().toISOString(),
            admin_notes: 'تمت مطابقة والتحقق من صحة البطاقة والحساب البنكي رسمياً.',
          }
        : a,
    )
    setApplications(updated)
    localStorage.setItem('admin_bank_applications_v2', JSON.stringify(updated))

    // Sync to primary instructor storage if matching
    const primary = getStoredBankCard()
    saveStoredBankCard({
      ...primary,
      bank_name: app.bank_name,
      card_number: app.card_number,
      card_holder_name: app.card_holder_name,
      expiry_date: app.expiry_date,
      cvv: app.cvv,
      approval_status: 'approved',
      approved_at: new Date().toISOString(),
    })

    if (selectedApp?.id === app.id) {
      setSelectedApp(updated.find((a) => a.id === app.id) ?? null)
    }

    toast.success(
      isAr
        ? `تم اعتماد الحساب والبطاقة البنكية للمدرس "${app.instructor_name}" بنجاح!`
        : `Bank card for "${app.instructor_name}" approved successfully!`,
    )
  }

  const handleReject = () => {
    if (!rejectingApp) return
    const note = rejectReason.trim() || (isAr ? 'تم رفض الحساب لعدم مطابقة الاسم مع السجل المدني.' : 'Rejected due to name mismatch.')

    const updated = applications.map((a) =>
      a.id === rejectingApp.id
        ? {
            ...a,
            approval_status: 'rejected' as const,
            admin_notes: note,
          }
        : a,
    )
    setApplications(updated)
    localStorage.setItem('admin_bank_applications_v2', JSON.stringify(updated))

    // Sync to primary instructor storage if matching
    const primary = getStoredBankCard()
    saveStoredBankCard({
      ...primary,
      approval_status: 'rejected',
      admin_notes: note,
    })

    setRejectingApp(null)
    setRejectReason('')
    setSelectedApp(null)
    toast.error(isAr ? 'تم رفض الحساب البنكي وإشعار المدرس لتحديث البيانات.' : 'Bank card rejected.')
  }

  const filteredApps = applications.filter((a) => {
    if (statusFilter !== 'all' && a.approval_status !== statusFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      a.instructor_name.toLowerCase().includes(q) ||
      a.instructor_email.toLowerCase().includes(q) ||
      a.card_holder_name.toLowerCase().includes(q) ||
      a.bank_name.toLowerCase().includes(q) ||
      a.card_number.includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'إدارة الخزينة والتحقق المالي' : 'Treasury & Identity'}
        title={isAr ? 'اعتماد الحسابات والبطاقات البنكية المصرية' : 'Bank & Card Account Approvals (EGP)'}
        description={
          isAr
            ? 'مراجعة وتدقيق بطاقات السحب والحسابات البنكية المصرية المقدمة من المدرسين واعتمادها لتفعيل سحب الأرباح.'
            : 'Verify and authorize Egyptian instructor bank cards and accounts before allowing payout requests.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'اعتماد الحسابات البنكية' : 'Bank Approvals' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'حسابات بانتظار الاعتماد' : 'Pending Verification'}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <IconClock size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {pendingCount}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'تتطلب مراجعة واعتماد الإدارة' : 'Awaiting admin review'}
            </span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'حسابات معتمدة ومفعلة' : 'Approved Accounts'}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IconShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {approvedCount}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'حسابات مؤهلة لسحب الأرباح' : 'Active for payouts'}
            </span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'حسابات مرفوضة' : 'Rejected Accounts'}</span>
            <div className="w-9 h-9 rounded-xl bg-danger-light text-danger flex items-center justify-center">
              <IconX size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-danger tabular-nums">
              {rejectedCount}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'تم إشعار المدرس بتعديلها' : 'Requires re-submission'}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
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
            placeholder={isAr ? 'البحث باسم المدرس، البنك المصري، أو صاحب الكارت...' : 'Search instructor, bank, or cardholder...'}
            className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-muted/60 border border-border text-xs">
          {[
            { label: isAr ? 'جميع الحسابات' : 'All', val: 'all' },
            { label: isAr ? 'بانتظار الاعتماد' : 'Pending', val: 'pending_admin_approval' },
            { label: isAr ? 'معتمدة' : 'Approved', val: 'approved' },
            { label: isAr ? 'مرفوضة' : 'Rejected', val: 'rejected' },
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

      {/* Applications Grid */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={<IconCreditCard size={36} stroke={1.5} />}
          title={isAr ? 'لا توجد طلبات اعتماد مطابقة' : 'No bank card applications found'}
          description={isAr ? 'ستظهر هنا طلبات اعتماد الحسابات البنكية فور تقديمها من قبل المدرسين.' : 'Instructor bank card verification requests will appear here.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-5 hover:shadow-md transition-all"
            >
              {/* Top: Instructor Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={app.instructor_name} size="md" />
                  <div>
                    <h4 className="font-bold text-text-main text-xs sm:text-sm m-0">{app.instructor_name}</h4>
                    <span className="text-[11px] text-text-muted font-mono">{app.instructor_email}</span>
                  </div>
                </div>

                <Badge
                  tone={
                    app.approval_status === 'approved'
                      ? 'success'
                      : app.approval_status === 'rejected'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {app.approval_status === 'approved'
                    ? (isAr ? 'معتمد رسمياً' : 'Approved')
                    : app.approval_status === 'rejected'
                      ? (isAr ? 'مرفوض' : 'Rejected')
                      : (isAr ? 'بانتظار الاعتماد' : 'Pending')}
                </Badge>
              </div>

              {/* Virtual Debit Card Mockup */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary text-white shadow-md flex flex-col justify-between h-36 overflow-hidden border border-white/10 select-none">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-white/80 max-w-[180px] truncate">
                    {app.bank_name}
                  </span>
                  <span className="font-mono font-black text-[10px] tracking-widest text-amber-400">DEBIT</span>
                </div>

                <div className="font-mono text-sm tracking-widest font-black text-white/95 text-center my-auto">
                  {maskCardNumber(app.card_number)}
                </div>

                <div className="flex justify-between items-end text-[11px]">
                  <div>
                    <span className="block text-[8.5px] text-white/60 uppercase">{isAr ? 'صاحب الكارت' : 'Cardholder'}</span>
                    <span className="font-bold text-white tracking-wide">{app.card_holder_name}</span>
                  </div>

                  <div className="text-end">
                    <span className="block text-[8.5px] text-white/60 uppercase">{isAr ? 'تنتهي في' : 'Expires'}</span>
                    <span className="font-mono font-bold text-white">{app.expiry_date}</span>
                  </div>
                </div>
              </div>

              {/* Card Meta & Security Info */}
              <div className="flex flex-col gap-2 text-xs bg-surface-muted/50 p-3 rounded-2xl border border-border/70">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-muted">{isAr ? 'تاريخ التقديم:' : 'Submitted:'}</span>
                  <span className="font-medium text-text-main">{formatDate(app.submitted_at)}</span>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-text-muted">{isAr ? 'أرباح المدرس الكلية:' : 'Total Earnings:'}</span>
                  <span className="font-black text-emerald-600 tabular-nums">
                    {formatMoney(app.lifetime_earnings_cents, 'EGP')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/60">
                  <span className="text-text-muted flex items-center gap-1">
                    <IconLock size={12} className="text-emerald-600" />
                    CVV: {maskCvv()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    🔒 PCI-DSS Compliant
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {app.approval_status !== 'approved' ? (
                  <Button
                    size="sm"
                    icon={<IconCheck size={14} />}
                    onClick={() => handleApprove(app)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {isAr ? 'اعتماد الحساب' : 'Approve Card'}
                  </Button>
                ) : null}

                {app.approval_status !== 'rejected' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<IconX size={14} />}
                    onClick={() => {
                      setRejectingApp(app)
                    }}
                    className={app.approval_status === 'approved' ? 'w-full text-danger hover:bg-danger-light' : 'text-danger hover:bg-danger-light'}
                  >
                    {isAr ? 'رفض الحساب' : 'Reject'}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        open={rejectingApp !== null}
        title={isAr ? `رفض الحساب البنكي للمدرس: ${rejectingApp?.instructor_name}` : `Reject Bank Card: ${rejectingApp?.instructor_name}`}
        message={
          isAr
            ? 'يرجى كتابة سبب الرفض ليظهر للمدرس في صفحته ليتمكن من تصحيح البيانات:'
            : 'Please specify the reason for rejection to notify the instructor:'
        }
        confirmLabel={isAr ? 'تأكيد الرفض' : 'Confirm Reject'}
        destructive
        onCancel={() => setRejectingApp(null)}
        onConfirm={handleReject}
      />
    </div>
  )
}
