import {
  IconAward,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconPrinter,
  IconSearch,
  IconShieldCheck,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { CertificateModal } from '@/components/organisms/CertificateModal'
import { PageHeader } from '@/components/templates/PageHeader'
import type { Certificate } from '@/core/domain/schemas/learning'
import { useTranslation } from '@/shared/lib/i18n'
import { toast } from '@/stores/toastStore'

export function AdminCertificatesPage() {
  const { t, isAr, formatDate, formatPercent, formatNumber } = useTranslation()
  const [search, setSearch] = useState('')
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null)
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

  // System-wide verified certificates dataset
  const certificates: Certificate[] = [
    {
      id: 1,
      serial: 'EDU-2026-9A8B7C',
      course_title: 'Full-Stack Web Development with React & Laravel',
      recipient_name: 'سيف الدين طارق',
      instructor_name: 'د. أحمد محمود',
      final_score: 0.98,
      issued_at: '2026-08-22T14:30:00Z',
      verify_url: '/certificates/verify/EDU-2026-9A8B7C',
    },
    {
      id: 2,
      serial: 'EDU-2026-B1C2D3',
      course_title: 'UI/UX Design Masterclass: Figma to Prototype',
      recipient_name: 'سارة عبد الله',
      instructor_name: 'م. مريم حسن',
      final_score: 0.95,
      issued_at: '2026-08-20T11:15:00Z',
      verify_url: '/certificates/verify/EDU-2026-B1C2D3',
    },
    {
      id: 3,
      serial: 'EDU-2026-E4F5G6',
      course_title: 'Data Science & Machine Learning with Python',
      recipient_name: 'عمر خالد المنشاوي',
      instructor_name: 'د. يوسف إبراهيم',
      final_score: 0.92,
      issued_at: '2026-08-18T16:45:00Z',
      verify_url: '/certificates/verify/EDU-2026-E4F5G6',
    },
    {
      id: 4,
      serial: 'EDU-2026-H7J8K9',
      course_title: 'Mobile App Development with Flutter',
      recipient_name: 'فاطمة الزهراء علي',
      instructor_name: 'م. أحمد محمود',
      final_score: 1.0,
      issued_at: '2026-08-15T09:20:00Z',
      verify_url: '/certificates/verify/EDU-2026-H7J8K9',
    },
    {
      id: 5,
      serial: 'EDU-2026-L1M2N3',
      course_title: 'Cybersecurity Fundamentals & Network Defense',
      recipient_name: 'طارق عبد العزيز',
      instructor_name: 'د. يوسف إبراهيم',
      final_score: 0.94,
      issued_at: '2026-08-10T13:00:00Z',
      verify_url: '/certificates/verify/EDU-2026-L1M2N3',
    },
  ]

  const copySerial = (serial: string) => {
    navigator.clipboard.writeText(serial)
    setCopiedSerial(serial)
    toast.success(isAr ? 'تم نسخ الرقم التسلسلي للشهادة!' : 'Certificate serial copied!')
    setTimeout(() => setCopiedSerial(null), 2500)
  }

  const filteredCerts = certificates.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.recipient_name.toLowerCase().includes(q) ||
      c.course_title.toLowerCase().includes(q) ||
      c.serial.toLowerCase().includes(q) ||
      c.instructor_name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'السجل الأكاديمي والاعتمادات' : 'Credentials Registry'}
        title={isAr ? 'سجل الشهادات والوثائق المعتمدة' : 'Issued Certificates Registry'}
        description={
          isAr
            ? `إجمالي الشهادات الممنوحة والمعتمدة في المنصة: ${formatNumber(certificates.length)} شهادة تخرج رسمية.`
            : `Managing ${certificates.length} cryptographically verifiable graduate credentials across all learning tracks.`
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'الشهادات' : 'Certificates' },
        ]}
      />

      <div className="flex flex-col gap-5">
        {/* Toolbar */}
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
              placeholder={isAr ? 'البحث بالاسم، الدورة، أو الرقم التسلسلي...' : 'Search by recipient, course, or serial...'}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
            <IconShieldCheck size={16} />
            <span>{isAr ? 'جميع الشهادات موثقة رقمياً ومتاحة للتحقق' : 'All credentials 100% verifiable'}</span>
          </div>
        </div>

        {/* Certificates Table */}
        {filteredCerts.length === 0 ? (
          <EmptyState
            icon={<IconAward size={36} stroke={1.5} />}
            title={isAr ? 'لم يتم العثور على شهادات مطابقة' : 'No certificates found'}
            description={isAr ? 'يرجى تجربة كلمات بحث أخرى أو التحقق من الرقم التسلسلي.' : 'Try changing your search terms.'}
          />
        ) : (
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                    <th className="py-3.5 px-5 text-start">{isAr ? 'الطالب الخريج' : 'Recipient'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'الدورة التدريبية' : 'Course'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'الرقم التسلسلي' : 'Serial No.'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'الدرجة النهائية' : 'Score'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'تاريخ المنح' : 'Issued Date'}</th>
                    <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={cert.recipient_name} size="sm" />
                          <div className="font-bold text-text-main text-xs sm:text-sm">
                            {cert.recipient_name}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-text-main max-w-xs truncate text-xs sm:text-sm">
                          {cert.course_title}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {isAr ? 'المدرّب: ' : 'Instructor: '}
                          <span className="font-semibold">{cert.instructor_name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-text-main">
                          <span className="px-2 py-0.5 rounded bg-surface-muted border border-border/80 text-primary">
                            {cert.serial}
                          </span>
                          <button
                            type="button"
                            onClick={() => copySerial(cert.serial)}
                            className="p-1 rounded text-text-subtle hover:text-text-main transition-colors cursor-pointer"
                            title={isAr ? 'نسخ الرقم التسلسلي' : 'Copy serial'}
                          >
                            {copiedSerial === cert.serial ? (
                              <IconCheck size={13} className="text-emerald-600" />
                            ) : (
                              <IconCopy size={13} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <Badge tone="success" className="tabular-nums font-black">
                          {formatPercent(cert.final_score, 0)}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-5 text-xs text-text-muted font-medium font-sans">
                        {formatDate(cert.issued_at)}
                      </td>

                      <td className="py-3.5 px-5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<IconPrinter size={14} />}
                            onClick={() => setSelectedCert(cert)}
                            title={isAr ? 'عرض وتحميل الشهادة' : 'View & Print'}
                          >
                            {isAr ? 'الشهادة' : 'View'}
                          </Button>

                          <Link
                            to={`/certificates/verify/${cert.serial}`}
                            target="_blank"
                            className="no-underline"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<IconExternalLink size={14} />}
                              title={isAr ? 'فحص الرابط العام' : 'Public Verify'}
                            />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <CertificateModal
        open={selectedCert !== null}
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  )
}
