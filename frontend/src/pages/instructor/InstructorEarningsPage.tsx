import {
  IconClock,
  IconCoin,
  IconCreditCard,
  IconFileSpreadsheet,
  IconLock,
  IconPlus,
  IconReceipt,
  IconShieldCheck,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Input, Select } from '@/components/atoms/inputs'
import { Modal } from '@/components/molecules/Modal'
import { PageHeader } from '@/components/templates/PageHeader'
import { useTranslation } from '@/shared/lib/i18n'
import {
  DEFAULT_INSTRUCTOR_STATEMENT,
  EGYPTIAN_BANKS,
  getStoredBankCard,
  maskCardNumber,
  maskCvv,
  saveStoredBankCard,
  type BankCardDetails,
  type InstructorAccountStatement,
} from '@/stores/financialStore'
import { toast } from '@/stores/toastStore'

export interface PayoutRequest {
  id: string
  reference: string
  amount_cents: number
  currency: string
  bank_name: string
  card_last4: string
  card_holder_name: string
  requested_at: string
  estimated_payout_at: string
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected'
  admin_note?: string
}

const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: 'pay-101',
    reference: 'PAY-2026-8812',
    amount_cents: 3500000, // 35,000 EGP
    currency: 'EGP',
    bank_name: 'البنك الأهلي المصري (NBE)',
    card_last4: '4129',
    card_holder_name: 'أحمد محمود الشريف',
    requested_at: '2026-08-20T10:00:00Z',
    estimated_payout_at: '2026-08-27T10:00:00Z',
    status: 'approved',
    admin_note: 'تمت مراجعة واعتماد الحساب البنكي والطلب. جاري التحويل خلال 7 أيام عمل.',
  },
  {
    id: 'pay-100',
    reference: 'PAY-2026-7490',
    amount_cents: 2500000, // 25,000 EGP
    currency: 'EGP',
    bank_name: 'البنك الأهلي المصري (NBE)',
    card_last4: '4129',
    card_holder_name: 'أحمد محمود الشريف',
    requested_at: '2026-08-01T12:30:00Z',
    estimated_payout_at: '2026-08-08T12:30:00Z',
    status: 'paid',
    admin_note: 'تم التحويل البنكي الفعلي بنجاح عبر البنك الأهلي المصري برقم إشعار TX-8894120.',
  },
]

export function InstructorEarningsPage() {
  const { t, isAr, formatMoney, formatDate, formatNumber, formatPercent } = useTranslation()

  const [statement] = useState<InstructorAccountStatement>(DEFAULT_INSTRUCTOR_STATEMENT)
  const [bankCard, setBankCard] = useState<BankCardDetails>(() => getStoredBankCard())
  const [isEditingCard, setIsEditingCard] = useState(false)
  const [cardDraft, setCardDraft] = useState<BankCardDetails>(bankCard)

  const [payouts, setPayouts] = useState<PayoutRequest[]>(() => {
    const saved = localStorage.getItem('instructor_payouts_list_egp')
    return saved ? JSON.parse(saved) : INITIAL_PAYOUTS
  })

  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showStatementModal, setShowStatementModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('10000')

  useEffect(() => {
    saveStoredBankCard(bankCard)
  }, [bankCard])

  // Financial Stats in EGP
  const totalGrossCents = statement.total_gross_cents // 220,300 EGP
  const totalCommissionCents = statement.total_commission_cut_cents // 41,185 EGP
  const totalNetEarningsCents = statement.total_net_cents // 179,115 EGP

  const pendingPayoutsCents = payouts
    .filter((p) => p.status === 'pending' || p.status === 'approved' || p.status === 'processing')
    .reduce((acc, p) => acc + p.amount_cents, 0)

  const completedPayoutsCents = payouts
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount_cents, 0)

  const availableBalanceCents = Math.max(0, totalNetEarningsCents - pendingPayoutsCents - completedPayoutsCents)

  const isCardApproved = bankCard.approval_status === 'approved'

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault()
    // When instructor modifies card details, reset status to pending_admin_approval
    const updated: BankCardDetails = {
      ...cardDraft,
      approval_status: 'pending_admin_approval',
      submitted_at: new Date().toISOString(),
      approved_at: undefined,
      admin_notes: 'تم تحديث بيانات البطاقة. في انتظار مراجعة واعتماد الإدارة.',
    }
    setBankCard(updated)
    setIsEditingCard(false)
    toast.success(
      isAr
        ? 'تم حفظ بيانات الكارت وإرسالها للإدارة للمراجعة والاعتماد.'
        : 'Card details submitted for admin verification.',
    )
  }

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCardApproved) {
      toast.error(
        isAr
          ? 'لا يمكن طلب السحب حتى تعتمد إدارة المنصة حسابك البنكي/الكارت.'
          : 'Cannot request payout until your bank/card is approved by admin.',
      )
      return
    }

    const amountVal = parseFloat(withdrawAmount)
    if (isNaN(amountVal) || amountVal < 500) {
      toast.error(isAr ? 'الحد الأدنى لطلب السحب هو 500 ج.م.' : 'Minimum withdrawal is 500 EGP.')
      return
    }

    const requestedCents = Math.round(amountVal * 100)
    if (requestedCents > availableBalanceCents) {
      toast.error(isAr ? 'المبلغ المطلوب يتجاوز الرصيد المتاح للسحب.' : 'Requested amount exceeds available balance.')
      return
    }

    const now = new Date()
    const estDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const cardClean = bankCard.card_number.replace(/\s+/g, '')
    const last4 = cardClean.slice(-4) || '4129'

    const newPayout: PayoutRequest = {
      id: `pay-${Date.now()}`,
      reference: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      amount_cents: requestedCents,
      currency: 'EGP',
      bank_name: bankCard.bank_name,
      card_last4: last4,
      card_holder_name: bankCard.card_holder_name,
      requested_at: now.toISOString(),
      estimated_payout_at: estDate.toISOString(),
      status: 'pending',
      admin_note: isAr
        ? 'طلبك قيد مراجعة وتدقيق الإدارة. مدة التحويل البنكي هي 7 أيام عمل.'
        : 'Under review by administration. Standard payout timeline is 7 business days.',
    }

    const updated = [newPayout, ...payouts]
    setPayouts(updated)
    localStorage.setItem('instructor_payouts_list_egp', JSON.stringify(updated))
    setShowWithdrawModal(false)
    toast.success(
      isAr
        ? 'تم إرسال طلب السحب بنجاح! سيتم التحويل إلى حسابك البنكي خلال 7 أيام عمل بعد موافقة الإدارة.'
        : 'Withdrawal request submitted! Funds will arrive within 7 business days following admin approval.',
    )
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'الإدارة المالية وسحب الأرباح' : 'Financial Ledger & Payouts'}
        title={isAr ? 'الأرباح وسحب المستحقات المالية (EGP)' : 'Instructor Earnings & Payouts (EGP)'}
        description={
          isAr
            ? 'متابعة أرباح مبيعات الكورسات، كشف الحساب التفصيلي، إدارة بيانات البطاقة والحساب البنكي، وسحب الأرباح بالجنيه المصري.'
            : 'Track course sales revenue, itemized statement, Egyptian bank card verification, and withdraw in EGP.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.teach'), to: '/teach' },
          { label: isAr ? 'الأرباح والسحب' : 'Earnings' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={<IconFileSpreadsheet size={16} />}
              onClick={() => setShowStatementModal(true)}
              className="font-bold"
            >
              {isAr ? 'كشف الحساب التفصيلي' : 'Account Statement'}
            </Button>

            <Button
              size="sm"
              icon={<IconPlus size={16} />}
              onClick={() => {
                if (!isCardApproved) {
                  toast.warning(
                    isAr
                      ? 'يرجى إدخال وتأكيد بيانات الكارت وانتظار اعتماد الإدارة أولاً.'
                      : 'Please verify your card and await admin approval first.',
                  )
                } else {
                  setShowWithdrawModal(true)
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm"
            >
              {isAr ? 'طلب سحب أرباح جديدة' : 'Request Payout'}
            </Button>
          </div>
        }
      />

      {/* 7 Business Days Notice Banner */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
          <IconClock size={18} />
        </div>
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
            {isAr ? 'سياسة التحويلات البنكية المصرية ومواعيد الصرف الرسمية:' : 'Egyptian Banking Payout Policy:'}
          </span>
          <p className="text-text-muted m-0">
            {isAr
              ? 'تخضع جميع طلبات السحب للتدقيق المحاسبي من قبل إدارة المنصة. تستغرق عملية التحويل البنكي الفعلي 7 أيام عمل من تاريخ موافقة الإدارة للتحويل إلى الحسابات البنكية المصرية والبطاقات المعتمدة.'
              : 'All withdrawal requests require admin verification. Funds require 7 business days from approval to clear into your approved Egyptian bank account or card.'}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid in EGP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Available Balance */}
        <div className="bg-surface/90 backdrop-blur-md border-2 border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'الرصيد المتاح للسحب' : 'Available Balance'}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IconCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatMoney(availableBalanceCents, 'EGP')}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'صافي أرباحك الجاهزة للتحويل' : 'Net ready for payout'}
            </span>
          </div>
        </div>

        {/* Total Gross Revenue */}
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'إجمالي المبيعات الكلية' : 'Gross Sales'}</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <IconReceipt size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-text-main tabular-nums">
              {formatMoney(totalGrossCents, 'EGP')}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'قبل خصم عمولة المنصة' : 'Gross before platform fee'}
            </span>
          </div>
        </div>

        {/* Platform Commission Cut */}
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'عمولة المنصة المقتطعة' : 'Platform Cut'}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <IconReceipt size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-text-main tabular-nums">
              −{formatMoney(totalCommissionCents, 'EGP')}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'نسبة عمولة المنصة المقررة' : 'Standard platform share'}
            </span>
          </div>
        </div>

        {/* In-Flight Pending Payouts */}
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'طلبات قيد المراجعة والصرف' : 'In-Flight Payouts'}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <IconClock size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-primary tabular-nums">
              {formatMoney(pendingPayoutsCents, 'EGP')}
            </div>
            <span className="text-xs text-text-muted mt-1 block">
              {isAr ? 'جاري التحويل (مهلة 7 أيام)' : '7-day clearing window'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Card Details & Payout Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bank Card Management Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <IconCreditCard size={18} />
                </div>
                <h3 className="font-heading font-black text-sm text-text-main m-0">
                  {isAr ? 'بيانات كارت السحب والحساب البنكي' : 'Payout Card & Bank Info'}
                </h3>
              </div>

              {!isEditingCard ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCardDraft(bankCard)
                    setIsEditingCard(true)
                  }}
                >
                  {isAr ? 'تعديل البيانات' : 'Edit Card'}
                </Button>
              ) : null}
            </div>

            {/* Approval Status Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-muted/60 border border-border text-xs">
              <span className="font-bold text-text-muted">{isAr ? 'حالة اعتماد الحساب من الإدارة:' : 'Admin Approval Status:'}</span>
              <Badge
                tone={
                  bankCard.approval_status === 'approved'
                    ? 'success'
                    : bankCard.approval_status === 'rejected'
                      ? 'danger'
                      : 'warning'
                }
              >
                {bankCard.approval_status === 'approved'
                  ? (isAr ? 'معتمد رسمياً من الإدارة' : 'Approved by Admin')
                  : bankCard.approval_status === 'rejected'
                    ? (isAr ? 'مرفوض - يرجى التعديل' : 'Rejected')
                    : (isAr ? 'قيد مراجعة واعتماد الإدارة' : 'Pending Admin Approval')}
              </Badge>
            </div>

            {!isCardApproved ? (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                {isAr
                  ? 'تنبيه: يلزم موافقة واعتماد إدارة المنصة على بيانات الكارت قبل تفعيل إمكانية سحب الأرباح.'
                  : 'Notice: Admin must approve your card details before withdrawal requests can be submitted.'}
              </div>
            ) : null}

            {isEditingCard ? (
              <form onSubmit={handleSaveCard} className="flex flex-col gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-text-main block mb-1">
                    {isAr ? 'اسم البنك المصري *' : 'Egyptian Bank *'}
                  </label>
                  <Select
                    value={cardDraft.bank_name}
                    onChange={(e) => setCardDraft({ ...cardDraft, bank_name: e.target.value })}
                    required
                  >
                    {EGYPTIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">
                    {isAr ? 'رقم الكارت (16 رقم) *' : 'Card Number (16 Digits) *'}
                  </label>
                  <Input
                    value={cardDraft.card_number}
                    onChange={(e) => setCardDraft({ ...cardDraft, card_number: e.target.value })}
                    placeholder="5200 1234 5678 4129"
                    className="font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">
                    {isAr ? 'اسم صاحب الكارت بالكامل *' : 'Cardholder Name *'}
                  </label>
                  <Input
                    value={cardDraft.card_holder_name}
                    onChange={(e) => setCardDraft({ ...cardDraft, card_holder_name: e.target.value })}
                    placeholder="أحمد محمود الشريف"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-text-main block mb-1">
                      {isAr ? 'تاريخ الانتهاء (MM/YY) *' : 'Expiry Date (MM/YY) *'}
                    </label>
                    <Input
                      value={cardDraft.expiry_date}
                      onChange={(e) => setCardDraft({ ...cardDraft, expiry_date: e.target.value })}
                      placeholder="08/29"
                      maxLength={5}
                      className="font-mono text-center text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-text-main block mb-1">
                      {isAr ? 'رمز الأمان (CVV) *' : 'CVV Security Code *'}
                    </label>
                    <Input
                      type="password"
                      value={cardDraft.cvv}
                      onChange={(e) => setCardDraft({ ...cardDraft, cvv: e.target.value })}
                      placeholder="•••"
                      maxLength={4}
                      className="font-mono text-center text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditingCard(false)}>
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button size="sm" type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold">
                    {isAr ? 'حفظ وإرسال للاعتماد' : 'Submit for Approval'}
                  </Button>
                </div>
              </form>
            ) : (
              /* Virtual Debit Card Presentation */
              <div className="flex flex-col gap-3">
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary text-white shadow-md flex flex-col justify-between h-44 overflow-hidden border border-white/10">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-white/80 max-w-[200px] truncate">
                      {bankCard.bank_name}
                    </span>
                    <span className="font-mono font-black text-xs tracking-widest text-amber-400">DEBIT</span>
                  </div>

                  <div className="font-mono text-base tracking-widest font-black text-white/95 text-center my-auto">
                    {maskCardNumber(bankCard.card_number)}
                  </div>

                  <div className="flex justify-between items-end text-xs">
                    <div>
                      <span className="block text-[9px] text-white/60 uppercase">{isAr ? 'صاحب الكارت' : 'Cardholder'}</span>
                      <span className="font-bold text-white tracking-wide">{bankCard.card_holder_name}</span>
                    </div>

                    <div className="text-end">
                      <span className="block text-[9px] text-white/60 uppercase">{isAr ? 'تنتهي في' : 'Expires'}</span>
                      <span className="font-mono font-bold text-white">{bankCard.expiry_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                  <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                    <IconLock size={12} />
                    <span>{isAr ? 'رمز الأمان (CVV):' : 'CVV:'} {maskCvv()} ({isAr ? 'مشفر ومحمي' : 'PCI-DSS'})</span>
                  </span>
                  {isCardApproved ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <IconShieldCheck size={14} />
                      {isAr ? 'حساب وبطاقة مفعلة للسحب' : 'Active for payouts'}
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold">
                      {isAr ? 'في انتظار موافقة الإدارة' : 'Pending verification'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Payout Requests Ledger Table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
              <h3 className="font-heading font-black text-sm text-text-main m-0 flex items-center gap-2">
                <IconReceipt size={18} className="text-primary" />
                {isAr ? 'سجل وتاريخ طلبات السحب (EGP)' : 'Withdrawal & Payout History'}
              </h3>
              <span className="text-xs text-text-muted font-bold">
                {payouts.length} {isAr ? 'عملية سحب' : 'Transactions'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                    <th className="py-3.5 px-5 text-start">{isAr ? 'رقم المعاملة' : 'Reference'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'المبلغ الصافي' : 'Amount'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'البنك / الكارت' : 'Bank'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'الجدول الزمني (7 أيام)' : 'Timeline'}</th>
                    <th className="py-3.5 px-5 text-end">{isAr ? 'حالة الطلب' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-primary text-xs">{p.reference}</div>
                        <div className="text-[10px] text-text-muted">{p.card_holder_name}</div>
                      </td>

                      <td className="py-3.5 px-5 font-black tabular-nums text-sm text-text-main">
                        {formatMoney(p.amount_cents, 'EGP')}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-text-main text-xs max-w-[160px] truncate">{p.bank_name}</div>
                        <div className="font-mono text-[10px] text-text-muted">•••• {p.card_last4}</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="text-text-main font-medium">{formatDate(p.requested_at)}</div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1 mt-0.5 font-bold">
                          <IconClock size={11} />
                          <span>{isAr ? 'الاستلام: ' : 'Est: '} {formatDate(p.estimated_payout_at)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-end">
                        <Badge
                          tone={
                            p.status === 'paid'
                              ? 'success'
                              : p.status === 'approved'
                                ? 'primary'
                                : p.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                          }
                        >
                          {p.status === 'paid'
                            ? (isAr ? 'تم التحويل البنكي' : 'Paid')
                            : p.status === 'approved'
                              ? (isAr ? 'معتمد (خلال 7 أيام)' : 'Approved (7-Days)')
                              : p.status === 'processing'
                                ? (isAr ? 'جاري التحويل' : 'Processing')
                                : p.status === 'rejected'
                                  ? (isAr ? 'مرفوض' : 'Rejected')
                                  : (isAr ? 'قيد المراجعة' : 'Under Review')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Account Statement Modal */}
      <Modal
        open={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        size="xl"
        title={isAr ? 'كشف الحساب التفصيلي ومبيعات الكورسات (EGP)' : 'Detailed Account Statement (EGP)'}
      >
        <div className="flex flex-col gap-6 select-text">
          {/* Statement Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-muted/60 border border-border flex-wrap gap-3">
            <div>
              <span className="text-xs text-text-muted block">{isAr ? 'صاحب الحساب والمدرس:' : 'Instructor:'}</span>
              <span className="font-bold text-text-main text-sm">{statement.instructor_name}</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-text-muted block">{isAr ? 'إجمالي المبيعات:' : 'Gross Sales:'}</span>
                <span className="font-black text-text-main tabular-nums">{formatMoney(statement.total_gross_cents, 'EGP')}</span>
              </div>
              <div>
                <span className="text-text-muted block">{isAr ? 'صافي المستحقات:' : 'Net Earnings:'}</span>
                <span className="font-black text-emerald-600 tabular-nums">{formatMoney(statement.total_net_cents, 'EGP')}</span>
              </div>
            </div>
          </div>

          {/* Itemized Course Breakdown Table */}
          <div className="overflow-x-auto border border-border rounded-2xl">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-surface-muted/80 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                  <th className="py-3 px-4 text-start">{isAr ? 'الدورة التدريبية / الورشة' : 'Item Description'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'سعر الوحدة' : 'Unit Price'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'عدد المشترين' : 'Buyers'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'إجمالي المبيعات' : 'Gross'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'عمولة المنصة' : 'Commission Cut'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'صافي الربح' : 'Net Earnings'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {statement.items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-hover/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-text-main text-xs">{item.title}</div>
                      <div className="text-[10px] text-text-muted">{formatDate(item.date)}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold tabular-nums">
                      {formatMoney(item.unit_price_cents, 'EGP')}
                    </td>

                    <td className="py-3 px-4 text-center font-black text-primary tabular-nums">
                      {formatNumber(item.buyers_count)} {isAr ? 'طالب' : 'students'}
                    </td>

                    <td className="py-3 px-4 text-end font-bold tabular-nums text-text-main">
                      {formatMoney(item.gross_cents, 'EGP')}
                    </td>

                    <td className="py-3 px-4 text-end tabular-nums text-amber-700 dark:text-amber-300 font-medium">
                      −{formatMoney(item.commission_cut_cents, 'EGP')} ({formatPercent(item.commission_rate * 100, 0)})
                    </td>

                    <td className="py-3 px-4 text-end font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatMoney(item.net_earnings_cents, 'EGP')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-muted/90 font-black border-t-2 border-border text-text-main">
                  <td colSpan={3} className="py-3.5 px-4 text-start">
                    {isAr ? 'الإجمالي الكلي لكشف الحساب' : 'Total Statement Sum'}
                  </td>
                  <td className="py-3.5 px-4 text-end tabular-nums">
                    {formatMoney(statement.total_gross_cents, 'EGP')}
                  </td>
                  <td className="py-3.5 px-4 text-end tabular-nums text-amber-700 dark:text-amber-300">
                    −{formatMoney(statement.total_commission_cut_cents, 'EGP')}
                  </td>
                  <td className="py-3.5 px-4 text-end tabular-nums text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatMoney(statement.total_net_cents, 'EGP')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" onClick={() => setShowStatementModal(false)}>
              {isAr ? 'إغلاق كشف الحساب' : 'Close Statement'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdrawal Request Modal */}
      <Modal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        size="md"
        title={isAr ? 'طلب سحب أرباح جديدة (بالجنيه المصري)' : 'Request Payout in EGP'}
      >
        <form onSubmit={handleRequestPayout} className="flex flex-col gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-bold block mb-1">{isAr ? 'الرصيد المتاح للسحب حالياً:' : 'Available for Withdrawal:'}</span>
            <span className="text-2xl font-black tabular-nums">{formatMoney(availableBalanceCents, 'EGP')}</span>
          </div>

          <div>
            <label className="text-xs font-bold text-text-main block mb-1.5">
              {isAr ? 'المبلغ المطلوب سحبه بالجنيه المصري (EGP) *' : 'Amount in EGP *'}
            </label>
            <Input
              type="number"
              min={500}
              max={availableBalanceCents / 100}
              step="100"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="10000"
              required
            />
            <span className="text-[11px] text-text-muted mt-1 block">
              {isAr ? 'الحد الأدنى لطلب السحب هو 500 ج.م.' : 'Minimum withdrawal is 500 EGP.'}
            </span>
          </div>

          {/* Card Summary Preview */}
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border text-xs flex flex-col gap-1">
            <span className="font-bold text-text-muted text-[10px] uppercase">{isAr ? 'التحويل إلى الكارت المعتمد:' : 'Destination Card:'}</span>
            <span className="font-bold text-text-main">{bankCard.bank_name}</span>
            <div className="flex justify-between font-mono text-primary text-[11px]">
              <span>•••• {bankCard.card_number.slice(-4)}</span>
              <span>{bankCard.card_holder_name}</span>
            </div>
          </div>

          {/* 7 Day Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            {isAr
              ? 'ملاحظة: تستغرق معالجة التحويل البنكي الفعلي 7 أيام عمل بعد موافقة إدارة المنصة.'
              : 'Notice: Bank transfers take 7 business days following admin verification.'}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowWithdrawModal(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black">
              {isAr ? 'تأكيد إرسال طلب السحب' : 'Submit Withdrawal Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
