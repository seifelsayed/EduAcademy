import {
  IconAward,
  IconBrandApple,
  IconCircleCheck,
  IconCreditCard,
  IconDeviceDesktop,
  IconLock,
  IconPlayerPlay,
  IconReceipt,
  IconShieldCheck,
  IconShieldLock,
  IconShoppingCart,
  IconSparkles,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { InvoiceModal } from '@/components/organisms/InvoiceModal'
import { PageHeader } from '@/components/templates/PageHeader'
import { useConfirmOrder, useOrder } from '@/features/billing/hooks'
import { getLocalizedCourse } from '@/features/catalog/localizedCatalog'
import { getCourseThumbnail } from '@/shared/lib/courseAssets'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'

type PaymentMethodType = 'card' | 'mada' | 'apple_pay' | 'fawry'

export function CheckoutPage() {
  const { reference } = useParams<{ reference: string }>()
  const { data: order, isLoading, isError } = useOrder(reference)
  const confirm = useConfirmOrder()
  const { t, isAr, language, formatMoney } = useTranslation()
  const currentUser = useCurrentUser()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card')
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvc, setCardCvc] = useState('888')
  const [cardholderName, setCardholderName] = useState(currentUser?.name ?? 'Student Name')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  if (isLoading) return <CenteredSpinner label={t('common.loading')} />
  if (isError || !order) return <Navigate to="/courses" replace />

  const alreadyPaid = order.status === 'paid'
  const course = order.course ? getLocalizedCourse(order.course, language) : null
  const thumbnail = course ? getCourseThumbnail(course) : null

  const handleConfirm = () => {
    confirm.mutate({
      reference: order.reference,
      paymentReference: `${paymentMethod.toUpperCase()}-TX-${Date.now()}`,
    })
  }

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 pb-20">
      <PageHeader
        pretitle={isAr ? 'بوابة الدفع الآمن' : 'Encrypted Payment Gateway'}
        title={alreadyPaid ? (isAr ? 'تم تأكيد اشتراكك بنجاح' : 'Order Confirmed & Active') : (isAr ? 'مراجعة وتأكيد الاشتراك' : 'Review & Checkout')}
        description={
          alreadyPaid
            ? (isAr ? 'تهانينا! دورتك التدريبية متاحة الآن للبدء الفوري في منصتك التعليمية.' : 'Your enrollment is active with full lifetime access.')
            : (isAr ? 'دفع آمن ومشفر 100% مع ضمان استرداد الأموال وتفعيل فوري للدروس.' : '256-bit encrypted checkout with instant lesson unlocking.')
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.courses'), to: '/courses' },
          { label: isAr ? 'إتمام الدفع' : 'Checkout' },
        ]}
      />

      {alreadyPaid ? (
        /* Paid Success Celebration Screen */
        <div className="max-w-3xl mx-auto mt-8 flex flex-col gap-6">
          <div className="bg-surface/90 backdrop-blur-md border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
              <IconCircleCheck size={44} />
            </div>

            <div className="flex flex-col gap-2 max-w-lg">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-text-main m-0">
                {isAr ? 'تم استلام وتأكيد طلبك بنجاح!' : 'Enrollment Successfully Activated!'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed m-0">
                {isAr
                  ? `أصبح بإمكانك الآن البدء في دراسة "${course?.title ?? 'الدورة'}" وحضور المحاضرات واجتياز الاختبارات للحصول على شهادتك المعتمدة.`
                  : `You now have full unrestricted access to "${course?.title ?? 'this course'}", quizzes, resources, and accredited certification.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border w-full max-w-md flex items-center justify-between text-xs">
              <span className="text-text-muted">{isAr ? 'رقم الفاتورة المعتمدة:' : 'Invoice Reference:'}</span>
              <code className="font-mono font-bold text-primary text-sm">INV-{order.reference}</code>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
              {course ? (
                <Link to={`/courses/${course.slug}/player`} className="no-underline w-full sm:w-auto flex-1">
                  <Button size="lg" fullWidth icon={<IconPlayerPlay size={18} />} className="bg-primary hover:bg-primary-hover font-black">
                    {isAr ? 'ابدأ مشاهدة الدورة الآن' : 'Start Course Now'}
                  </Button>
                </Link>
              ) : (
                <Link to="/my-learning" className="no-underline w-full sm:w-auto flex-1">
                  <Button size="lg" fullWidth icon={<IconDeviceDesktop size={18} />}>
                    {isAr ? 'مكتبتي التعليمية' : 'My Learning'}
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                size="lg"
                icon={<IconReceipt size={18} />}
                onClick={() => setShowInvoiceModal(true)}
                className="w-full sm:w-auto flex-1"
              >
                {isAr ? 'عرض الفاتورة الرسمية' : 'Official Invoice'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Checkout Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto mt-6">
          {/* Left / Main Column: Payment Method & Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Step 1: Payment Method Selector */}
            <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-text-main m-0 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                  {isAr ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                </h2>
                <span className="text-[11px] text-text-muted font-medium flex items-center gap-1">
                  <IconLock size={13} className="text-emerald-600" />
                  {isAr ? 'تشفير 256-bit SSL' : '256-bit SSL'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-border bg-surface hover:bg-surface-muted text-text-main'
                  }`}
                >
                  <IconCreditCard size={24} />
                  <span className="text-xs font-bold">{isAr ? 'بطاقة بنكية' : 'Credit Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('mada')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'mada'
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-border bg-surface hover:bg-surface-muted text-text-main'
                  }`}
                >
                  <div className="font-heading font-black text-sm text-emerald-600">mada</div>
                  <span className="text-xs font-bold">{isAr ? 'مدى' : 'Mada'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'apple_pay'
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-border bg-surface hover:bg-surface-muted text-text-main'
                  }`}
                >
                  <IconBrandApple size={24} />
                  <span className="text-xs font-bold">Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('fawry')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'fawry'
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-border bg-surface hover:bg-surface-muted text-text-main'
                  }`}
                >
                  <div className="font-heading font-black text-sm text-amber-600">FAWRY</div>
                  <span className="text-xs font-bold">{isAr ? 'فوري / كاش' : 'Fawry Cash'}</span>
                </button>
              </div>

              {/* Card input simulator */}
              <div className="mt-2 p-5 rounded-2xl bg-surface-muted/50 border border-border flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-bold text-text-main block mb-1">
                    {isAr ? 'رقم البطاقة' : 'Card Number'}
                  </label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="font-mono text-sm tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-main block mb-1">
                      {isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}
                    </label>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-main block mb-1">
                      {isAr ? 'رمز الأمان (CVC)' : 'Security Code (CVC)'}
                    </label>
                    <Input
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-main block mb-1">
                    {isAr ? 'الاسم كما هو مدون على البطاقة' : 'Cardholder Name'}
                  </label>
                  <Input
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Trust & Guarantee Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border flex flex-col items-center text-center gap-1.5 shadow-xs">
                <IconShieldCheck size={24} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-text-main text-xs">{isAr ? 'ضمان 30 يوماً' : '30-Day Guarantee'}</span>
                <span className="text-[10px] text-text-muted">{isAr ? 'استرداد كامل للأموال' : '100% money-back'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border flex flex-col items-center text-center gap-1.5 shadow-xs">
                <IconShieldLock size={24} className="text-primary" />
                <span className="font-bold text-text-main text-xs">{isAr ? 'دفع آمن ومشفر' : 'Secure Payment'}</span>
                <span className="text-[10px] text-text-muted">{isAr ? 'معايير مصرفية موثوقة' : 'Bank-grade SSL'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border flex flex-col items-center text-center gap-1.5 shadow-xs">
                <IconSparkles size={24} className="text-amber-500" />
                <span className="font-bold text-text-main text-xs">{isAr ? 'وصول دائم' : 'Lifetime Access'}</span>
                <span className="text-[10px] text-text-muted">{isAr ? 'جميع التحديثات القادمة' : 'All future updates'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border flex flex-col items-center text-center gap-1.5 shadow-xs">
                <IconAward size={24} className="text-teal-600 dark:text-teal-400" />
                <span className="font-bold text-text-main text-xs">{isAr ? 'شهادة معتمدة' : 'Accredited Cert'}</span>
                <span className="text-[10px] text-text-muted">{isAr ? 'برقم توثيق رسمي' : 'Verified serial'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Action */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-24">
            <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-md flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted/40">
                <h2 className="text-sm font-black text-text-main m-0">
                  {isAr ? 'ملخص الطلب والفاتورة' : 'Order Summary'}
                </h2>
                <code className="font-mono text-xs text-text-muted font-bold">
                  #{order.reference}
                </code>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Course preview card */}
                {course ? (
                  <div className="flex gap-3.5 p-3.5 rounded-2xl bg-surface-muted/50 border border-border/80">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={course.title}
                        className="rounded-xl w-24 aspect-video object-cover shrink-0 border border-border"
                      />
                    ) : null}

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-xs sm:text-sm font-bold text-text-main line-clamp-2 mb-1 leading-snug">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-text-muted">
                        <span>{course.instructor?.name}</span>
                        {course.level ? (
                          <Badge tone="muted" className="text-[10px] py-0 px-1.5">
                            {course.level}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Price calculations */}
                <div className="flex flex-col gap-2.5 text-xs pt-1 border-t border-border/60">
                  <div className="flex justify-between text-text-muted">
                    <span>{isAr ? 'السعر الأساسي للدورة' : 'Course List Price'}</span>
                    <span className="font-bold text-text-main tabular-nums">
                      {formatMoney(order.amount_cents, order.currency)}
                    </span>
                  </div>

                  {order.discount_cents > 0 ? (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{isAr ? 'الخصم الترويجي' : 'Promotional Discount'}</span>
                      <span className="tabular-nums">
                        −{formatMoney(order.discount_cents, order.currency)}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-text-muted">
                    <span>{isAr ? 'ضريبة القيمة المضافة (0%)' : 'VAT / Sales Tax (0%)'}</span>
                    <span className="font-semibold text-text-main tabular-nums">$0.00</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-border font-black text-sm text-text-main">
                    <span>{isAr ? 'المجموع النهائي المطلوب' : 'Total Amount Due'}</span>
                    <span className="text-2xl text-primary tabular-nums font-black">
                      {formatMoney(order.total_cents, order.currency)}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <Button
                    fullWidth
                    size="lg"
                    icon={<IconShoppingCart size={18} />}
                    loading={confirm.isPending}
                    onClick={handleConfirm}
                    className="bg-primary hover:bg-primary-hover font-black text-white shadow-md py-4 text-sm"
                  >
                    {isAr
                      ? `سداد ${formatMoney(order.total_cents, order.currency)} والبدء الفوري`
                      : `Pay ${formatMoney(order.total_cents, order.currency)} & Unlock Access`}
                  </Button>

                  <p className="text-[11px] text-center text-text-muted mt-2.5 mb-0">
                    {isAr
                      ? 'بالنقر على زر الدفع، فإنك توافق على الشروط والسياسات الخاصة بالمنصة.'
                      : 'By placing your order, you agree to our Terms of Service.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <InvoiceModal
        open={showInvoiceModal}
        order={order}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  )
}
