import {
  IconAward,
  IconCertificate,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconPrinter,
  IconShieldCheck,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { CertificateModal } from '@/components/organisms/CertificateModal'
import { PageHeader } from '@/components/templates/PageHeader'
import type { Certificate } from '@/core/domain/schemas/learning'
import { useCertificates } from '@/features/learning/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { toast } from '@/stores/toastStore'

export function CertificatesPage() {
  const { data, isLoading } = useCertificates()
  const { t, isAr, formatDate, formatPercent } = useTranslation()
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null)
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

  const copySerial = (serial: string) => {
    navigator.clipboard.writeText(serial)
    setCopiedSerial(serial)
    toast.success(isAr ? 'تم نسخ الرقم التسلسلي للشهادة!' : 'Certificate serial copied to clipboard!')
    setTimeout(() => setCopiedSerial(null), 2500)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'الإنجازات والشهادات' : 'Achievements & Credentials'}
        title={t('navigation.certificates')}
        description={
          isAr
            ? 'كل شهادة تحمل رقماً تسلسلياً فريداً وموثوقاً يمكن لأي جهة توظيف أو مؤسسة التحقق منه.'
            : 'Each accredited certificate carries a cryptographically verifiable credential serial number.'
        }
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.certificates') }]}
        actions={
          <Link to="/certificates/verify" className="no-underline">
            <Button variant="outline" size="sm" icon={<IconShieldCheck size={16} />}>
              {t('footer.verifyCertificate')}
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <CenteredSpinner label={t('common.loading')} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={<IconCertificate size={36} stroke={1.5} />}
          title={isAr ? 'لم تحصل على شهادات بعد' : 'No certificates earned yet'}
          description={
            isAr
              ? 'أكمل 100% من محتوى أي دورة تدريبية واجتز تقييماتها للحصول على شهادتك المعتمدة الأولى.'
              : 'Complete 100% of any course curriculum and assignments to earn your verified credential.'
          }
          action={
            <Link to="/my-learning" className="no-underline">
              <Button size="sm">{t('courses.continueLearning')}</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data?.map((certificate) => (
            <div
              key={certificate.id}
              className="group relative overflow-hidden bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-5 hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300"
            >
              {/* Luxury gold & emerald ambient glow */}
              <div className="absolute top-0 end-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 via-amber-500/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-emerald-500/20 transition-all" />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/30 shadow-2xs group-hover:scale-105 transition-transform">
                    <IconAward size={26} />
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-black">
                    <IconShieldCheck size={13} />
                    <span>{isAr ? 'معتمدة وموثقة' : 'Verified Credential'}</span>
                  </div>
                </div>

                <h3 className="font-heading text-base font-bold text-text-main mb-1.5 line-clamp-2 leading-snug">
                  {certificate.course_title}
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  {t('courses.instructor')}:{' '}
                  <span className="font-bold text-text-main">{certificate.instructor_name}</span>
                </p>

                {/* Metadata summary grid */}
                <div className="grid grid-cols-2 gap-y-2 text-xs py-3 border-t border-b border-border mb-4 bg-surface-muted/30 -mx-6 px-6">
                  <span className="text-text-muted">{isAr ? 'الرقم التسلسلي:' : 'Serial Number:'}</span>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-mono font-bold text-text-main text-end truncate text-[11px]">
                      {certificate.serial}
                    </span>
                    <button
                      type="button"
                      onClick={() => copySerial(certificate.serial)}
                      className="p-1 rounded text-text-subtle hover:text-text-main hover:bg-surface transition-colors cursor-pointer"
                      title={isAr ? 'نسخ الرقم' : 'Copy serial'}
                    >
                      {copiedSerial === certificate.serial ? (
                        <IconCheck size={13} className="text-emerald-600" />
                      ) : (
                        <IconCopy size={13} />
                      )}
                    </button>
                  </div>

                  <span className="text-text-muted">{isAr ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>
                  <span className="font-bold text-text-main text-end">
                    {formatDate(certificate.issued_at)}
                  </span>

                  <span className="text-text-muted">{isAr ? 'الدرجة النهائية:' : 'Final Score:'}</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-end tabular-nums">
                    {formatPercent(certificate.final_score, 1)}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  icon={<IconPrinter size={15} />}
                  onClick={() => setSelectedCert(certificate)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex-1"
                >
                  {isAr ? 'عرض وتحميل PDF' : 'View & Print'}
                </Button>

                <Link
                  to={`/certificates/verify/${certificate.serial}`}
                  className="no-underline flex-1"
                >
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    icon={<IconExternalLink size={15} />}
                    className="border-emerald-500/30 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                  >
                    {isAr ? 'سجل التوثيق' : 'Verify Online'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <CertificateModal
        open={selectedCert !== null}
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  )
}

