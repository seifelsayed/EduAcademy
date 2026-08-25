import {
  IconCalculator,
  IconDeviceFloppy,
  IconPercentage,
  IconVideo,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs'
import { PageHeader } from '@/components/templates/PageHeader'
import { useTranslation } from '@/shared/lib/i18n'
import { toast } from '@/stores/toastStore'

export function AdminSettingsPage() {
  const { t, isAr } = useTranslation()

  // Platform Commission and Financial Settings
  const [courseCommission, setCourseCommission] = useState(() => {
    return Number(localStorage.getItem('platform_course_commission') ?? 20)
  })

  const [liveCommission, setLiveCommission] = useState(() => {
    return Number(localStorage.getItem('platform_live_commission') ?? 15)
  })

  const [minPayoutAmount, setMinPayoutAmount] = useState(() => {
    return Number(localStorage.getItem('platform_min_payout') ?? 50)
  })

  const [payoutDays, setPayoutDays] = useState(() => {
    return Number(localStorage.getItem('platform_payout_days') ?? 7)
  })

  // General Settings
  const [siteName, setSiteName] = useState('Antigravity Education Platform')
  const [supportEmail, setSupportEmail] = useState('support@education.platform')

  // Simulation test amount
  const [simPrice, setSimPrice] = useState(100)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('platform_course_commission', String(courseCommission))
    localStorage.setItem('platform_live_commission', String(liveCommission))
    localStorage.setItem('platform_min_payout', String(minPayoutAmount))
    localStorage.setItem('platform_payout_days', String(payoutDays))
    toast.success(isAr ? 'تم حفظ إعدادات العمولة والمنصة بنجاح!' : 'Platform & commission settings saved!')
  }

  // Calculator figures
  const coursePlatformTake = (simPrice * courseCommission) / 100
  const courseInstructorTake = simPrice - coursePlatformTake

  const livePlatformTake = (simPrice * liveCommission) / 100
  const liveInstructorTake = simPrice - livePlatformTake

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'إدارة المنظومة والأرباح' : 'System Configuration'}
        title={isAr ? 'إعدادات العمولة والمنصة' : 'Platform & Commission Settings'}
        description={
          isAr
            ? 'تحديد نسبة أرباح وعمولة الموقع من مبيعات الكورسات والبث المباشر، وسياسات السحب البنكي.'
            : 'Configure platform revenue cut, live session commission, minimum payout thresholds, and payout settlement timelines.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'إعدادات المنصة' : 'Settings' },
        ]}
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Financial & Commission Rates */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Commission Rates */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <IconPercentage size={22} />
              </div>
              <div>
                <h2 className="font-heading font-black text-base sm:text-lg text-text-main m-0">
                  {isAr ? 'نسبة عمولة الموقع (Platform Revenue Share)' : 'Platform Commission Rates'}
                </h2>
                <p className="text-xs text-text-muted m-0 mt-0.5">
                  {isAr ? 'النسبة المئوية التي تقتطعها المنصة تلقائياً من كل عملية بيع لصالح تشغيل النظام.' : 'Percentage deducted automatically on course sales and live sessions.'}
                </p>
              </div>
            </div>

            {/* Course Sales Commission Slider */}
            <div className="flex flex-col gap-2 p-5 rounded-2xl bg-surface-muted/50 border border-border/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-main text-xs sm:text-sm">
                    {isAr ? 'عمولة الكورسات المسجلة' : 'Recorded Courses Commission'}
                  </span>
                  <Badge tone="primary">{courseCommission}%</Badge>
                </div>
                <span className="text-xs text-text-muted">
                  {isAr ? `يحصل المدرس على ${100 - courseCommission}%` : `Instructor gets ${100 - courseCommission}%`}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={courseCommission}
                onChange={(e) => setCourseCommission(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary mt-2"
              />

              <div className="flex justify-between text-[11px] text-text-muted mt-1">
                <span>0% ({isAr ? 'بدون عمولة' : 'Zero commission'})</span>
                <span>20% ({isAr ? 'النسبة القياسية' : 'Standard'})</span>
                <span>50% ({isAr ? 'الحد الأقصى' : 'Max'})</span>
              </div>
            </div>

            {/* Live Sessions Commission Slider */}
            <div className="flex flex-col gap-2 p-5 rounded-2xl bg-surface-muted/50 border border-border/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-main text-xs sm:text-sm flex items-center gap-1 text-rose-600 dark:text-rose-400">
                    <IconVideo size={16} />
                    {isAr ? 'عمولة ورش العمل والبث المباشر (Live)' : 'Live Sessions Commission'}
                  </span>
                  <Badge tone="danger">{liveCommission}%</Badge>
                </div>
                <span className="text-xs text-text-muted">
                  {isAr ? `يحصل المدرس على ${100 - liveCommission}%` : `Instructor gets ${100 - liveCommission}%`}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={liveCommission}
                onChange={(e) => setLiveCommission(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-rose-600 mt-2"
              />

              <div className="flex justify-between text-[11px] text-text-muted mt-1">
                <span>0%</span>
                <span>15% ({isAr ? 'موصى به للايف' : 'Live recommended'})</span>
                <span>50%</span>
              </div>
            </div>

            {/* Withdrawal Rules & 7-Day Settlement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5">
                  {isAr ? 'الحد الأدنى لطلب السحب (ج.م. - EGP)' : 'Min Withdrawal Threshold (EGP)'}
                </label>
                <Input
                  type="number"
                  min="100"
                  max="10000"
                  value={minPayoutAmount}
                  onChange={(e) => setMinPayoutAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5">
                  {isAr ? 'مدة التسوية والتحويل البنكي (أيام عمل)' : 'Payout Settlement Window (Days)'}
                </label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={payoutDays}
                  onChange={(e) => setPayoutDays(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: General Platform Info */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            <h3 className="font-heading font-black text-base text-text-main m-0">
              {isAr ? 'إعدادات المنصة والهوية العامة' : 'General Platform Settings'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5">
                  {isAr ? 'اسم المنصة التعليمية' : 'Platform Brand Name'}
                </label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5">
                  {isAr ? 'بريد الدعم والمراسلات الرسمي' : 'Official Support Email'}
                </label>
                <Input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Profit Split Simulator & Save Action */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          {/* Profit Split Simulator */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary font-black text-sm">
              <IconCalculator size={18} />
              <span>{isAr ? 'محاكي توزيع الأرباح الفوري (EGP)' : 'Live Revenue Split Simulator (EGP)'}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-main">
                {isAr ? 'قيمة الكورس أو تذكرة اللايف (بالجنيه المصري):' : 'Sample Price (EGP):'}
              </label>
              <Input
                type="number"
                min="50"
                step="50"
                value={simPrice}
                onChange={(e) => setSimPrice(Number(e.target.value))}
              />
            </div>

            {/* Split for Recorded Course */}
            <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border/80 flex flex-col gap-2 text-xs">
              <span className="font-bold text-text-main block border-b border-border/60 pb-1">
                {isAr ? 'في الكورسات المسجلة:' : 'For Recorded Courses:'}
              </span>
              <div className="flex justify-between">
                <span className="text-text-muted">{isAr ? 'نصيب المدرس:' : 'Instructor:'}</span>
                <span className="font-black text-emerald-600 tabular-nums">
                  {courseInstructorTake.toLocaleString('ar-EG')} {isAr ? 'ج.م.' : 'EGP'} ({100 - courseCommission}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">{isAr ? 'عمولة الموقع:' : 'Platform Take:'}</span>
                <span className="font-black text-primary tabular-nums">
                  {coursePlatformTake.toLocaleString('ar-EG')} {isAr ? 'ج.م.' : 'EGP'} ({courseCommission}%)
                </span>
              </div>
            </div>

            {/* Split for Live Session */}
            <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border/80 flex flex-col gap-2 text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400 block border-b border-border/60 pb-1 flex items-center gap-1">
                <IconVideo size={14} />
                {isAr ? 'في البث المباشر والورش:' : 'For Live Workshops:'}
              </span>
              <div className="flex justify-between">
                <span className="text-text-muted">{isAr ? 'نصيب المدرس:' : 'Instructor:'}</span>
                <span className="font-black text-emerald-600 tabular-nums">
                  {liveInstructorTake.toLocaleString('ar-EG')} {isAr ? 'ج.م.' : 'EGP'} ({100 - liveCommission}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">{isAr ? 'عمولة الموقع:' : 'Platform Take:'}</span>
                <span className="font-black text-primary tabular-nums">
                  {livePlatformTake.toLocaleString('ar-EG')} {isAr ? 'ج.م.' : 'EGP'} ({liveCommission}%)
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              icon={<IconDeviceFloppy size={18} />}
              className="bg-primary hover:bg-primary-hover text-white font-black shadow-md mt-2"
            >
              {isAr ? 'حفظ وتطبيق الإعدادات' : 'Save Platform Settings'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
