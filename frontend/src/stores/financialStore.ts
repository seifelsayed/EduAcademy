export interface BankCardDetails {
  bank_name: string
  card_number: string
  card_holder_name: string
  expiry_date: string // MM/YY
  cvv: string
  approval_status: 'pending_admin_approval' | 'approved' | 'rejected'
  submitted_at: string
  approved_at?: string
  admin_notes?: string
}

export interface StatementItem {
  id: string
  type: 'course' | 'live_session'
  title: string
  unit_price_cents: number // in EGP cents
  buyers_count: number
  gross_cents: number // unit_price * buyers_count
  commission_rate: number // e.g. 0.20 for 20%
  commission_cut_cents: number
  net_earnings_cents: number
  date: string
}

export interface InstructorAccountStatement {
  instructor_id: number
  instructor_name: string
  instructor_email: string
  items: StatementItem[]
  total_gross_cents: number
  total_commission_cut_cents: number
  total_net_cents: number
  total_paid_out_cents: number
  available_balance_cents: number
}

export const EGYPTIAN_BANKS = [
  'البنك الأهلي المصري (National Bank of Egypt - NBE)',
  'بنك مصر (Banque Misr)',
  'البنك التجاري الدولي (CIB Egypt)',
  'بنك الإسكندرية (Bank of Alexandria)',
  'بنك القاهرة (Banque du Caire)',
  'بنك QNB الأهلي (QNB Alahli)',
  'مصرف أبوظبي الإسلامي - مصر (ADIB Egypt)',
  'بنك فيصل الإسلامي المصري (Faisal Islamic Bank)',
  'بنك التعمير والإسكان (HDBank)',
  'فودافون كاش / إنستاباي ومحافظ الهاتف (Vodafone Cash / InstaPay)',
]

export const DEFAULT_INSTRUCTOR_STATEMENT: InstructorAccountStatement = {
  instructor_id: 12,
  instructor_name: 'د. أحمد محمود الشريف',
  instructor_email: 'ahmed.mahmoud@education.platform',
  items: [
    {
      id: 'stmt-1',
      type: 'course',
      title: 'Full-Stack Web Development with React & Laravel',
      unit_price_cents: 120000, // 1,200 EGP
      buyers_count: 85,
      gross_cents: 10200000, // 102,000 EGP
      commission_rate: 0.20,
      commission_cut_cents: 2040000, // 20,400 EGP
      net_earnings_cents: 8160000, // 81,600 EGP
      date: '2026-08-20T10:00:00Z',
    },
    {
      id: 'stmt-2',
      type: 'course',
      title: 'Mobile App Development with Flutter Masterclass',
      unit_price_cents: 95000, // 950 EGP
      buyers_count: 64,
      gross_cents: 6080000, // 60,800 EGP
      commission_rate: 0.20,
      commission_cut_cents: 1216000, // 12,160 EGP
      net_earnings_cents: 4864000, // 48,640 EGP
      date: '2026-08-18T14:30:00Z',
    },
    {
      id: 'stmt-3',
      type: 'live_session',
      title: 'ورشة عمل تفاعلية مباشرة: بناء وتأمين واجهات RESTful API',
      unit_price_cents: 45000, // 450 EGP
      buyers_count: 70,
      gross_cents: 3150000, // 31,500 EGP
      commission_rate: 0.15,
      commission_cut_cents: 472500, // 4,725 EGP
      net_earnings_cents: 2677500, // 26,775 EGP
      date: '2026-08-15T18:00:00Z',
    },
    {
      id: 'stmt-4',
      type: 'live_session',
      title: 'بث تدريبي مباشر: الذكاء الاصطناعي وهندسة الأوامر المتقدمة',
      unit_price_cents: 50000, // 500 EGP
      buyers_count: 52,
      gross_cents: 2600000, // 26,000 EGP
      commission_rate: 0.15,
      commission_cut_cents: 390000, // 3,900 EGP
      net_earnings_cents: 2210000, // 22,100 EGP
      date: '2026-08-10T19:00:00Z',
    },
  ],
  total_gross_cents: 22030000, // 220,300 EGP
  total_commission_cut_cents: 4118500, // 41,185 EGP
  total_net_cents: 17911500, // 179,115 EGP
  total_paid_out_cents: 6000000, // 60,000 EGP
  available_balance_cents: 11911500, // 119,115 EGP
}

export const INITIAL_BANK_CARD: BankCardDetails = {
  bank_name: 'البنك الأهلي المصري (National Bank of Egypt - NBE)',
  card_number: '5200 4589 1234 4129',
  card_holder_name: 'أحمد محمود الشريف',
  expiry_date: '09/28',
  cvv: '842',
  approval_status: 'approved',
  submitted_at: '2026-08-15T10:00:00Z',
  approved_at: '2026-08-16T11:00:00Z',
  admin_notes: 'تمت مطابقة والتحقق من صحة البطاقة والحساب البنكي رسمياً.',
}

const STORAGE_BANK_KEY = 'platform_instructor_bank_card_v2'

export function getStoredBankCard(): BankCardDetails {
  try {
    const raw = localStorage.getItem(STORAGE_BANK_KEY)
    return raw ? JSON.parse(raw) : INITIAL_BANK_CARD
  } catch {
    return INITIAL_BANK_CARD
  }
}

export function saveStoredBankCard(details: BankCardDetails): void {
  try {
    localStorage.setItem(STORAGE_BANK_KEY, JSON.stringify(details))
  } catch (e) {
    console.error('Failed to save bank card details', e)
  }
}

export function maskCardNumber(cardNumber?: string, showFirst4 = true): string {
  if (!cardNumber) return '•••• •••• •••• ••••'
  const clean = cardNumber.replace(/\s+/g, '')
  if (clean.length < 8) return '•••• •••• •••• ••••'
  const first4 = clean.slice(0, 4)
  const last4 = clean.slice(-4)
  return showFirst4 ? `${first4} •••• •••• ${last4}` : `•••• •••• •••• ${last4}`
}

export function maskCvv(): string {
  return '•••'
}
