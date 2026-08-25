export type TicketDepartment =
  | 'financial_payouts'
  | 'technical'
  | 'live_sessions'
  | 'curriculum'
  | 'account'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface SupportMessage {
  id: string
  sender_name: string
  sender_role: 'user' | 'admin' | 'support_agent'
  content: string
  created_at: string
}

export interface SupportTicket {
  id: string
  ticket_number: string
  user_id: number
  user_name: string
  user_email: string
  user_role: 'student' | 'instructor'
  subject: string
  department: TicketDepartment
  priority: TicketPriority
  status: TicketStatus
  created_at: string
  updated_at: string
  messages: SupportMessage[]
}

const STORAGE_KEY = 'platform_support_tickets_v1'

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tick-101',
    ticket_number: 'TICK-2026-1042',
    user_id: 12,
    user_name: 'د. أحمد محمود الشريف',
    user_email: 'ahmed.mahmoud@education.platform',
    user_role: 'instructor',
    subject: 'استفسار بخصوص موعد وصول حوالة أرباح البث المباشر #PAY-2026-9931',
    department: 'financial_payouts',
    priority: 'high',
    status: 'in_progress',
    created_at: '2026-08-24T12:00:00Z',
    updated_at: '2026-08-24T14:30:00Z',
    messages: [
      {
        id: 'msg-1',
        sender_name: 'د. أحمد محمود الشريف',
        sender_role: 'user',
        content:
          'السلام عليكم، قمت بتقديم طلب سحب أرباح البث المباشر وأريد التأكد من استلام الحساب البنكي المعتمد لديكم (البنك الأهلي). شكراً لكم.',
        created_at: '2026-08-24T12:00:00Z',
      },
      {
        id: 'msg-2',
        sender_name: 'فريق الدعم المالي (إدارة المنصة)',
        sender_role: 'admin',
        content:
          'وعليكم السلام د. أحمد. تم استلام طلبك ومراجعته وتأكيد صحة رقم الآيبان. طلبك معتمد وجاري تنفيذ التحويل البنكي خلال مهلة الـ 7 أيام عمل المقررة.',
        created_at: '2026-08-24T14:30:00Z',
      },
    ],
  },
  {
    id: 'tick-102',
    ticket_number: 'TICK-2026-1089',
    user_id: 5,
    user_name: 'سيف الدين طارق',
    user_email: 'seif.tariq@example.com',
    user_role: 'student',
    subject: 'مشكلة في تشغيل الفيديو التفاعلي بالدرس رقم 8 في دورة React',
    department: 'technical',
    priority: 'medium',
    status: 'open',
    created_at: '2026-08-24T16:20:00Z',
    updated_at: '2026-08-24T16:20:00Z',
    messages: [
      {
        id: 'msg-3',
        sender_name: 'سيف الدين طارق',
        sender_role: 'user',
        content:
          'مرحباً، يظهر لي خطأ في تحميل الفيديو التفاعلي في الدرس رقم 8 أثناء محاولة إكمال الاختبار النهائي.',
        created_at: '2026-08-24T16:20:00Z',
      },
    ],
  },
  {
    id: 'tick-103',
    ticket_number: 'TICK-2026-0955',
    user_id: 8,
    user_name: 'سارة عبد الله',
    user_email: 'sara.a@example.com',
    user_role: 'student',
    subject: 'طلب تحديث اسم الطالب على الشهادة المعتمدة',
    department: 'curriculum',
    priority: 'low',
    status: 'resolved',
    created_at: '2026-08-20T09:00:00Z',
    updated_at: '2026-08-20T11:45:00Z',
    messages: [
      {
        id: 'msg-4',
        sender_name: 'سارة عبد الله',
        sender_role: 'user',
        content: 'أرجو تعديل الاسم في شهادة تخرج دورة UI/UX ليظهر بالاسم الثلاثي كاملاً.',
        created_at: '2026-08-20T09:00:00Z',
      },
      {
        id: 'msg-5',
        sender_name: 'إدارة الشؤون الأكاديمية',
        sender_role: 'admin',
        content: 'تم تحديث الاسم بنجاح وإعادة إصدار وثيقة الشهادة والرقم التسلسلي.',
        created_at: '2026-08-20T11:45:00Z',
      },
    ],
  },
]

export function getStoredTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : INITIAL_TICKETS
  } catch {
    return INITIAL_TICKETS
  }
}

export function saveStoredTickets(tickets: SupportTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  } catch (e) {
    console.error('Failed to save tickets to localStorage', e)
  }
}
