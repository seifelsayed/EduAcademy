import { IconAward, IconCircleCheck, IconCircleX, IconPrinter, IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs'
import { CertificateModal } from '@/components/organisms/CertificateModal'
import { PageHeader } from '@/components/templates/PageHeader'
import { useVerifyCertificate } from '@/features/learning/hooks'
import { useTranslation } from '@/shared/lib/i18n'

export function CertificateVerifyPage() {
  const { serial: routeSerial } = useParams<{ serial?: string }>()
  const [draft, setDraft] = useState(routeSerial ?? '')
  const [serial, setSerial] = useState(routeSerial)
  const [showModal, setShowModal] = useState(false)
  const { t, isAr, formatDate, formatPercent } = useTranslation()

  const { data, isLoading, isError } = useVerifyCertificate(serial)

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 pb-16">
      <PageHeader
        pretitle={isAr ? 'السجل الرسمي للشهادات' : 'Official Certificate Registry'}
        title={t('footer.verifyCertificate')}
        description={isAr ? 'أدخل الرقم التسلسلي المطبوع على الشهادة للتحقق من مصداقيتها وبيانات حاملها برمجياً.' : 'Enter the certificate serial number to verify credential authenticity.'}
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('footer.verifyCertificate') }]}
      />

      <div className="max-w-2xl mx-auto flex flex-col gap-6 mt-6">
        <form
          className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            setSerial(draft.trim().toUpperCase())
          }}
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={isAr ? 'مثال: EDU-2026-ABCD1234' : 'e.g. EDU-2026-ABCD1234'}
            aria-label={isAr ? 'الرقم التسلسلي للشهادة' : 'Certificate Serial Number'}
            className="uppercase font-mono tracking-wider text-sm font-bold"
          />
          <Button type="submit" size="md" loading={isLoading} disabled={!draft.trim()} className="shrink-0" icon={<IconSearch size={16} />}>
            {isAr ? 'تحقق الآن' : 'Verify Now'}
          </Button>
        </form>

        {serial && isError ? (
          <div className="bg-surface border border-rose-300 dark:border-rose-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <IconCircleX size={36} className="text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-text-main mb-0.5">
                {isAr ? 'لم يتم العثور على شهادة بهذا الرقم' : 'Certificate Not Found'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted m-0">
                {isAr
                  ? <>لا توجد شهادة مسجلة في النظام بالرقم التسلسلي <code className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100 font-mono text-xs font-bold">{serial}</code>.</>
                  : <>No certificate found registered with serial <code className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100 font-mono text-xs font-bold">{serial}</code>.</>}
              </p>
            </div>
          </div>
        ) : null}

        {data ? (
          <div className="bg-surface border-2 border-emerald-400 dark:border-emerald-700 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border">
              <IconCircleCheck size={32} className="text-emerald-700 dark:text-emerald-300 shrink-0" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text-main m-0">
                  {isAr ? 'تم توثيق الشهادة بنجاح ✓' : 'Certificate Verified Successfully ✓'}
                </h2>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 font-mono m-0 font-extrabold">
                  {isAr ? `الرقم المعتمد: ${data.serial}` : `Verified Serial: ${data.serial}`}
                </p>
              </div>
            </div>

            <div className="text-center py-8 px-6 border border-border rounded-2xl bg-surface-muted/60 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 flex items-center justify-center mb-4 border border-emerald-300 dark:border-emerald-800 shadow-xs">
                <IconAward size={36} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                {isAr ? 'تشهد المنصة بأن الطالب/ة' : 'This is to certify that'}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-text-main tracking-tight mb-2">{data.recipient_name}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">
                {isAr ? 'قد أتم بنجاح متطلبات الدورة التدريبية' : 'has successfully completed the training course'}
              </p>
              <p className="text-lg sm:text-xl font-bold text-primary mb-6">{data.course_title}</p>

              <div className="w-full max-w-sm grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs pt-6 border-t border-border">
                <span className="font-semibold text-text-muted text-start">{isAr ? 'المدرّب:' : 'Instructor:'}</span>
                <span className="font-bold text-text-main text-end truncate">{data.instructor_name}</span>

                <span className="font-semibold text-text-muted text-start">{isAr ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>
                <span className="font-bold text-text-main text-end">{formatDate(data.issued_at)}</span>

                <span className="font-semibold text-text-muted text-start">{isAr ? 'الدرجة النهائية:' : 'Final Grade:'}</span>
                <span className="font-black text-emerald-700 dark:text-emerald-300 text-end">
                  {formatPercent(data.final_score, 1)}
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-border w-full max-w-sm flex justify-center">
                <Button
                  size="md"
                  icon={<IconPrinter size={16} />}
                  onClick={() => setShowModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full"
                >
                  {isAr ? 'عرض وتحميل الشهادة (PDF / طباعة)' : 'View & Download Certificate (PDF)'}
                </Button>
              </div>
            </div>

            <CertificateModal
              open={showModal}
              certificate={data}
              onClose={() => setShowModal(false)}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
