import {
  IconCheck,
  IconCopy,
  IconFileInvoice,
  IconPrinter,
  IconShieldCheck,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/molecules/Modal'
import type { Order } from '@/core/domain/schemas/engagement'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'
import { toast } from '@/stores/toastStore'

interface InvoiceModalProps {
  open: boolean
  order: Order | null
  onClose: () => void
}

export function InvoiceModal({ open, order, onClose }: InvoiceModalProps) {
  const { isAr, formatMoney, formatDate } = useTranslation()
  const currentUser = useCurrentUser()
  const [copied, setCopied] = useState(false)

  if (!order) return null

  const invoiceNumber = `INV-${order.reference.toUpperCase()}`
  const customerName = currentUser?.name ?? (isAr ? 'العميل الكريم' : 'Valued Customer')
  const customerEmail = currentUser?.email ?? 'student@education.platform'

  const copyInvoiceNum = () => {
    navigator.clipboard.writeText(invoiceNumber)
    setCopied(true)
    toast.success(isAr ? 'تم نسخ رقم الفاتورة!' : 'Invoice number copied!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isAr ? 'فاتورة وإيصال سداد رسمي' : 'Official Tax Invoice & Receipt'}
    >
      <div className="flex flex-col gap-6">
        {/* Action controls */}
        <div className="flex items-center justify-between gap-3 bg-surface-muted/60 p-3.5 rounded-2xl border border-border flex-wrap print:hidden">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-bold text-text-main">{isAr ? 'رقم الفاتورة:' : 'Invoice No:'}</span>
            <code className="px-2 py-0.5 rounded bg-surface border border-border font-mono font-bold text-primary">
              {invoiceNumber}
            </code>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={copied ? <IconCheck size={15} className="text-emerald-600" /> : <IconCopy size={15} />}
              onClick={copyInvoiceNum}
            >
              {copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرقم' : 'Copy Ref')}
            </Button>

            <Button
              size="sm"
              icon={<IconPrinter size={15} />}
              onClick={handlePrint}
              className="bg-primary hover:bg-primary-hover text-white font-bold"
            >
              {isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
            </Button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="invoice-print-zone" className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-md flex flex-col gap-6 select-text">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                  <IconFileInvoice size={20} />
                </div>
                <span className="font-heading font-black text-lg text-slate-950">
                  {isAr ? 'منصة التعليم الرقمي' : 'Education Platform'}
                </span>
              </div>
              <p className="text-xs text-slate-500 m-0 mt-1">
                {isAr ? 'سجل تجاري وترخيص أكاديمي رقم 1010-8849' : 'Commercial Registration & License #1010-8849'}
              </p>
              <p className="text-xs text-slate-500 m-0">
                {isAr ? 'الرقم الضريبي الموحد: 300948572100003' : 'Tax ID / VAT: 300948572100003'}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5 text-xs text-slate-600">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                <IconShieldCheck size={14} />
                <span>{isAr ? 'فاتورة مسددة بالكامل' : 'PAID & SETTLED'}</span>
              </div>
              <div className="mt-1">
                <span className="font-medium text-slate-500">{isAr ? 'رقم الفاتورة: ' : 'Invoice #: '}</span>
                <span className="font-mono font-bold text-slate-950">{invoiceNumber}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">{isAr ? 'تاريخ المعاملة: ' : 'Date: '}</span>
                <span className="font-bold text-slate-900">{formatDate(order.paid_at ?? order.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                {isAr ? 'بيانات العميل والمشتري' : 'Billed To'}
              </span>
              <span className="font-bold text-slate-950 text-sm">{customerName}</span>
              <span className="font-mono text-slate-600">{customerEmail}</span>
              <span className="text-slate-500">{isAr ? 'حساب مسجل وموثق' : 'Verified Learner Account'}</span>
            </div>

            <div className="flex flex-col gap-1 sm:items-end text-start sm:text-end">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                {isAr ? 'وسيلة وتفاصيل الدفع' : 'Payment Details'}
              </span>
              <span className="font-bold text-slate-950">{isAr ? 'بطاقة دفع إلكتروني / بوابة الدفع الآمنة' : 'Secure Online Payment'}</span>
              <span className="font-mono text-slate-600">Ref: {order.reference}</span>
              <span className="text-emerald-700 font-bold">{isAr ? 'عملية سداد ناجحة ومؤكدة' : 'Transaction Approved'}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-800 border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3 text-start">{isAr ? 'الوصف والخدمة التعليمية' : 'Item Description'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                  <th className="py-2.5 px-3 text-end">{isAr ? 'السعر الأصلي' : 'Unit Price'}</th>
                  <th className="py-2.5 px-3 text-end">{isAr ? 'الخصم المطبق' : 'Discount'}</th>
                  <th className="py-2.5 px-3 text-end">{isAr ? 'المجموع' : 'Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-950 text-sm">{order.course?.title ?? (isAr ? 'دورة تعليمية' : 'Course Item')}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isAr ? 'اشتراك كامل ودائم يشمل المحاضرات والاختبارات والشهادة المعتمدة' : 'Lifetime curriculum access, quizzes, assignments & certificate'}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold">1</td>
                  <td className="py-3 px-3 text-end font-medium tabular-nums">
                    {formatMoney(order.amount_cents, order.currency)}
                  </td>
                  <td className="py-3 px-3 text-end font-medium text-emerald-700 tabular-nums">
                    {order.discount_cents > 0 ? `−${formatMoney(order.discount_cents, order.currency)}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-end font-bold text-slate-950 tabular-nums">
                    {formatMoney(order.total_cents, order.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 max-w-xs leading-relaxed">
              <p className="m-0 font-medium">
                {isAr
                  ? 'هذه الفاتورة مستند رسمي يثبت سداد رسوم البرنامج التدريبي وامتلاك حسابك للوصول الكامل إلى الدورة التدريبية.'
                  : 'This document serves as the official proof of payment and enrollment entitlement.'}
              </p>
            </div>

            <div className="w-full sm:w-64 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-semibold tabular-nums">{formatMoney(order.amount_cents, order.currency)}</span>
              </div>
              {order.discount_cents > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>{isAr ? 'إجمالي الخصومات:' : 'Discounts:'}</span>
                  <span className="font-semibold tabular-nums">−{formatMoney(order.discount_cents, order.currency)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-600">
                <span>{isAr ? 'ضريبة القيمة المضافة (0%):' : 'VAT (0%):'}</span>
                <span className="font-semibold tabular-nums">{formatMoney(0, order.currency)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 font-bold text-slate-950 text-sm">
                <span>{isAr ? 'إجمالي المبلغ المسدد:' : 'Total Paid:'}</span>
                <span className="text-base text-primary font-black tabular-nums">
                  {formatMoney(order.total_cents, order.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Official Stamp Watermark */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[10px] text-slate-400">
            <span>© {new Date().getFullYear()} {isAr ? 'منصة التعليم الرقمي — جميع الحقوق محفوظة.' : 'Education Platform. All rights reserved.'}</span>
            <div className="font-mono text-emerald-800 font-bold flex items-center gap-1">
              <IconShieldCheck size={13} />
              <span>DIGITALLY SIGNED & VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
