import {
  IconAward,
  IconCheck,
  IconCopy,
  IconPrinter,
  IconShieldCheck,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/molecules/Modal'
import type { Certificate } from '@/core/domain/schemas/learning'
import { useTranslation } from '@/shared/lib/i18n'
import { toast } from '@/stores/toastStore'

interface CertificateModalProps {
  open: boolean
  certificate: Certificate | null
  onClose: () => void
}

export function CertificateModal({ open, certificate, onClose }: CertificateModalProps) {
  const { isAr } = useTranslation()
  const [copied, setCopied] = useState(false)

  if (!certificate) return null

  const verifyUrl = `${window.location.origin}/certificates/verify/${certificate.serial}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl)
    setCopied(true)
    toast.success(isAr ? 'تم نسخ رابط التحقق من الشهادة!' : 'Verification link copied!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  // Format date strictly in English for standard international credentials
  const englishDate = certificate.issued_at
    ? new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  const scoreFormatted = (certificate.final_score * 100).toFixed(0) + '%'

  // Generate authentic cursive signature for instructor
  const ARABIC_NAME_MAP: Record<string, string> = {
    'د. أحمد محمود الشريف': 'Ahmed Mahmoud',
    'أحمد محمود الشريف': 'Ahmed Mahmoud',
    'د. أحمد محمود': 'Ahmed Mahmoud',
    'أحمد محمود': 'Ahmed Mahmoud',
    'م. مريم حسن كمال': 'Mariam Hassan',
    'مريم حسن كمال': 'Mariam Hassan',
    'م. مريم حسن': 'Mariam Hassan',
    'مريم حسن': 'Mariam Hassan',
    'د. يوسف إبراهيم المنصور': 'Youssef Ibrahim',
    'يوسف إبراهيم المنصور': 'Youssef Ibrahim',
    'د. يوسف إبراهيم': 'Youssef Ibrahim',
    'يوسف إبراهيم': 'Youssef Ibrahim',
    'عمر خالد': 'Omar Khaled',
    'سارة عبد الله': 'Sara Abdullah',
  }

  const rawInstructor = certificate.instructor_name || 'Dr. Ahmed Mahmoud'
  const trimmed = rawInstructor.trim()
  const cleanPrefix = trimmed.replace(/^(د\.|م\.|أ\.|Dr\.|Prof\.|Eng\.)\s*/i, '').trim()
  const instructorSignature = ARABIC_NAME_MAP[trimmed] || ARABIC_NAME_MAP[cleanPrefix] || cleanPrefix || 'Lead Instructor'

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={isAr ? 'وثيقة الشهادة المعتمدة' : 'Official Verified Certificate'}
    >
      <div className="flex flex-col gap-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-3 bg-surface-muted/60 p-3.5 rounded-2xl border border-border flex-wrap print:hidden">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-bold text-text-main">{isAr ? 'الرقم التسلسلي:' : 'Serial:'}</span>
            <code className="px-2 py-0.5 rounded bg-surface border border-border font-mono font-bold text-primary">
              {certificate.serial}
            </code>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={copied ? <IconCheck size={15} className="text-emerald-600" /> : <IconCopy size={15} />}
              onClick={handleCopyLink}
            >
              {copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy Link')}
            </Button>

            <Button
              size="sm"
              icon={<IconPrinter size={15} />}
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}
            </Button>
          </div>
        </div>

        {/* Printable Certificate Frame (ALWAYS 100% ENGLISH, LTR) */}
        <div id="certificate-print-zone" className="relative p-1 sm:p-3 bg-slate-950/5 dark:bg-slate-950/50 rounded-3xl">
          <div
            dir="ltr"
            lang="en"
            className="relative bg-white text-slate-900 rounded-2xl p-6 sm:p-10 md:p-14 shadow-2xl border-[10px] border-double border-amber-600/40 overflow-hidden flex flex-col justify-between select-text"
            style={{
              aspectRatio: '1.414 / 1', // International A4 Landscape
              minHeight: '480px',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Guilloche / Luxury watermark background */}
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-emerald-500/10 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Corner Decorative Accents */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-amber-600/70" />
            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-amber-600/70" />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-amber-600/70" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-amber-600/70" />

            {/* Header */}
            <div className="relative z-10 text-center flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
                  <IconAward size={24} />
                </div>
                <span className="tracking-[0.2em] uppercase font-black text-xs sm:text-sm text-amber-900">
                  ANTIGRAVITY ACADEMY OF DIGITAL EDUCATION
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-wider m-0 uppercase">
                CERTIFICATE OF COMPLETION
              </h1>
              <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-600 to-transparent my-1" />
            </div>

            {/* Body Certification Statement */}
            <div className="relative z-10 text-center my-auto py-3 flex flex-col items-center">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase mb-2">
                THIS IS PROUDLY PRESENTED TO
              </p>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-amber-950 tracking-tight mb-2 border-b-2 border-slate-300 pb-2 px-8 min-w-[280px]">
                {certificate.recipient_name}
              </h2>

              <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-xl mx-auto leading-relaxed mb-2">
                has successfully fulfilled all academic curriculum requirements, projects, and practical assessments for the certified course:
              </p>

              <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-emerald-900 mb-1 max-w-2xl">
                {certificate.course_title}
              </h3>
            </div>

            {/* Footer Credentials & Signatures */}
            <div className="relative z-10 grid grid-cols-3 items-end pt-4 border-t border-slate-200 mt-2 text-xs">
              {/* Left: Academic Dean / Board Signature */}
              <div className="flex flex-col items-start text-start">
                <div
                  className="text-3xl sm:text-4xl text-slate-900 leading-none mb-1 select-none font-normal"
                  style={{ fontFamily: "'Alex Brush', 'Great Vibes', 'Dancing Script', cursive" }}
                >
                  Sarah Jenkins
                </div>
                <div className="w-36 h-0.5 bg-slate-400 mb-1" />
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  Dean of Academic Affairs
                </span>
              </div>

              {/* Center: Official Verified Stamp & Metadata */}
              <div className="flex flex-col items-center text-center gap-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-double border-amber-600 bg-amber-50 text-amber-900 flex flex-col items-center justify-center p-1 shadow-sm">
                  <IconShieldCheck size={26} className="text-emerald-700" />
                  <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider text-amber-950">
                    OFFICIAL SEAL
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 mt-0.5">
                  <div>
                    <span className="font-medium">Issued: </span>
                    <span className="font-bold text-slate-800">{englishDate}</span>
                  </div>
                  <div>
                    <span className="font-medium">Grade: </span>
                    <span className="font-bold text-emerald-700">{scoreFormatted}</span>
                  </div>
                  <div className="font-mono text-[9.5px] text-slate-400">
                    ID: {certificate.serial}
                  </div>
                </div>
              </div>

              {/* Right: Instructor Signature */}
              <div className="flex flex-col items-end text-end">
                <div
                  className="text-3xl sm:text-4xl text-slate-900 leading-none mb-1 select-none font-normal"
                  style={{ fontFamily: "'Alex Brush', 'Great Vibes', 'Dancing Script', cursive" }}
                >
                  {instructorSignature}
                </div>
                <div className="w-36 h-0.5 bg-slate-400 mb-1" />
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  Authorized Lead Instructor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
