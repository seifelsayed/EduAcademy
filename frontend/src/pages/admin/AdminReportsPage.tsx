import {
  IconArrowUpRight,
  IconAward,
  IconChartBar,
  IconCoin,
  IconReceipt,
  IconSchool,
  IconUsers,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Badge } from '@/components/atoms/Badge'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { PageHeader } from '@/components/templates/PageHeader'
import { useTranslation } from '@/shared/lib/i18n'

export function AdminReportsPage() {
  const { t, isAr, formatMoney, formatNumber, formatPercent } = useTranslation()
  const [period, setPeriod] = useState<'30' | '90' | '365'>('30')

  const topCourses = [
    {
      title: 'Full-Stack Web Development with React & Laravel',
      instructor: 'د. أحمد محمود',
      category: 'Web Development',
      students: 480,
      revenue_cents: 4800000,
      completionRate: 0.88,
    },
    {
      title: 'UI/UX Design Masterclass: Figma to Prototype',
      instructor: 'م. مريم حسن',
      category: 'Design & UI/UX',
      students: 390,
      revenue_cents: 3510000,
      completionRate: 0.85,
    },
    {
      title: 'Data Science & Machine Learning with Python',
      instructor: 'د. يوسف إبراهيم',
      category: 'Data Science & AI',
      students: 310,
      revenue_cents: 3100000,
      completionRate: 0.82,
    },
    {
      title: 'Mobile App Development with Flutter',
      instructor: 'م. أحمد محمود',
      category: 'Mobile Dev',
      students: 260,
      revenue_cents: 2080000,
      completionRate: 0.79,
    },
    {
      title: 'Cybersecurity Fundamentals & Network Defense',
      instructor: 'د. يوسف إبراهيم',
      category: 'Cybersecurity',
      students: 190,
      revenue_cents: 1520000,
      completionRate: 0.86,
    },
  ]

  const categoriesShare = [
    { name: isAr ? 'تطوير الويب والبرمجة' : 'Web Development', share: 42, revenue_cents: 6300000 },
    { name: isAr ? 'تصميم واجهات المستخدم UI/UX' : 'UI/UX Design', share: 26, revenue_cents: 3900000 },
    { name: isAr ? 'علوم البيانات والذكاء الاصطناعي' : 'Data Science & AI', share: 18, revenue_cents: 2700000 },
    { name: isAr ? 'تطوير تطبيقات الموبايل' : 'Mobile Apps', share: 14, revenue_cents: 2100000 },
  ]

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'ذكاء الأعمال والتحليلات' : 'Business Intelligence & Telemetry'}
        title={isAr ? 'التقارير المالية والأداء الأكاديمي' : 'Financial & Academic Reports'}
        description={
          isAr
            ? 'نظرة شمولية على حجم مبيعات المنصة، نمو الاشتراكات، ومعدلات إتمام الطلاب للمسارات التعليمية.'
            : 'Executive telemetry tracking gross volume, net margin, enrollment velocity, and academic completion rates.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'التقارير المالية' : 'Analytics & Reports' },
        ]}
        actions={
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface/90 border border-border">
            <button
              type="button"
              onClick={() => setPeriod('30')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === '30' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {isAr ? 'آخر 30 يوماً' : '30 Days'}
            </button>
            <button
              type="button"
              onClick={() => setPeriod('90')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === '90' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {isAr ? 'آخر ربع سنوي' : '90 Days'}
            </button>
            <button
              type="button"
              onClick={() => setPeriod('365')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === '365' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {isAr ? 'السنة الكاملة' : '1 Year'}
            </button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'إجمالي المبيعات' : 'Gross Volume'}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IconCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-text-main tabular-nums">
              {formatMoney(15010000, 'EGP')}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-1">
              <IconArrowUpRight size={14} />
              <span>+18.4% {isAr ? 'مقارنة بالفترة السابقة' : 'vs last period'}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'عمولة المنصة الصافية' : 'Platform Net Take'}</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <IconReceipt size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-text-main tabular-nums">
              {formatMoney(3002000, 'EGP')}
            </div>
            <span className="text-xs text-text-muted">{isAr ? 'نسبة عمولة ثابتة 20%' : 'Fixed 20% commission rate'}</span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'إجمالي الاشتراكات النشطة' : 'Active Students'}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <IconUsers size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-text-main tabular-nums">
              {formatNumber(1630)}
            </div>
            <span className="text-xs text-text-muted">{isAr ? 'طالب مسجل في الدورات' : 'Enrolled learners'}</span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'معدل إتمام الدورات' : 'Graduation Rate'}</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <IconAward size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 tabular-nums">
              84.2%
            </div>
            <span className="text-xs text-text-muted">{isAr ? 'نسبة اجتياز الاختبارات' : 'Course completion average'}</span>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Grossing Courses */}
        <div className="lg:col-span-8 bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-base text-text-main m-0 flex items-center gap-2">
              <IconChartBar size={18} className="text-primary" />
              {isAr ? 'أعلى الدورات التدريبية تحقيقاً للإيرادات' : 'Top Grossing Courses'}
            </h2>
            <Badge tone="primary">{isAr ? 'مرتبة حسب الإيراد' : 'By Revenue'}</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                  <th className="py-3 px-4 text-start">{isAr ? 'الدورة التدريبية' : 'Course'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'القسم' : 'Category'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الطلاب' : 'Students'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'نسبة الإتمام' : 'Completion'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'إجمالي الإيراد' : 'Revenue'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topCourses.map((c) => (
                  <tr key={c.title} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-text-main text-xs">{c.title}</div>
                      <div className="text-[11px] text-text-muted">{c.instructor}</div>
                    </td>
                    <td className="py-3 px-4 text-text-muted">{c.category}</td>
                    <td className="py-3 px-4 text-center font-bold tabular-nums">{formatNumber(c.students)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatPercent(c.completionRate)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end font-black text-text-main tabular-nums">
                      {formatMoney(c.revenue_cents, 'EGP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Category Distribution */}
        <div className="lg:col-span-4 bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-5">
          <h2 className="font-heading font-black text-base text-text-main m-0 flex items-center gap-2">
            <IconSchool size={18} className="text-emerald-600" />
            {isAr ? 'توزيع المبيعات حسب التخصص' : 'Revenue by Category'}
          </h2>

          <div className="flex flex-col gap-4">
            {categoriesShare.map((cat) => (
              <div key={cat.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-text-main">{cat.name}</span>
                  <span className="text-primary tabular-nums">{cat.share}%</span>
                </div>
                <ProgressBar value={cat.share} tone="primary" />
                <div className="text-[11px] text-text-muted text-end tabular-nums">
                  {formatMoney(cat.revenue_cents, 'EGP')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
