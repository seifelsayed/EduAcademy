import {
  IconHeadset,
  IconMessageCircle,
  IconPlus,
  IconSend,
  IconShieldCheck,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Input, Select, Textarea } from '@/components/atoms/inputs'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Modal } from '@/components/molecules/Modal'
import { PageHeader } from '@/components/templates/PageHeader'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'
import {
  getStoredTickets,
  saveStoredTickets,
  type SupportMessage,
  type SupportTicket,
  type TicketDepartment,
  type TicketPriority,
} from '@/stores/supportStore'
import { toast } from '@/stores/toastStore'

export function SupportPage() {
  const { t, isAr, formatDate } = useTranslation()
  const currentUser = useCurrentUser()

  const [tickets, setTickets] = useState<SupportTicket[]>(() => getStoredTickets())
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  // Create Ticket Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newDepartment, setNewDepartment] = useState<TicketDepartment>('technical')
  const [newPriority, setNewPriority] = useState<TicketPriority>('medium')
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    saveStoredTickets(tickets)
  }, [tickets])

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0] ?? null

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject.trim() || !newMessage.trim()) return

    const now = new Date().toISOString()
    const ticketId = `tick-${Date.now()}`
    const ticketNum = `TICK-2026-${Math.floor(1000 + Math.random() * 9000)}`

    const newTicket: SupportTicket = {
      id: ticketId,
      ticket_number: ticketNum,
      user_id: currentUser?.id ?? 1,
      user_name: currentUser?.name ?? (isAr ? 'المستخدم' : 'User'),
      user_email: currentUser?.email ?? 'user@example.com',
      user_role: (currentUser?.role as any) === 'instructor' ? 'instructor' : 'student',
      subject: newSubject.trim(),
      department: newDepartment,
      priority: newPriority,
      status: 'open',
      created_at: now,
      updated_at: now,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender_name: currentUser?.name ?? (isAr ? 'المستخدم' : 'User'),
          sender_role: 'user',
          content: newMessage.trim(),
          created_at: now,
        },
      ],
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    setSelectedTicketId(newTicket.id)
    setShowCreateModal(false)
    setNewSubject('')
    setNewMessage('')
    toast.success(isAr ? `تم فتح التذكرة رقم ${ticketNum} بنجاح!` : `Support ticket ${ticketNum} created!`)
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyText.trim()) return

    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender_name: currentUser?.name ?? (isAr ? 'أنا' : 'Me'),
      sender_role: 'user',
      content: replyText.trim(),
      created_at: new Date().toISOString(),
    }

    const updated = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            updated_at: new Date().toISOString(),
            status: t.status === 'resolved' ? ('in_progress' as const) : t.status,
            messages: [...t.messages, newMsg],
          }
        : t,
    )

    setTickets(updated)
    setReplyText('')
    toast.success(isAr ? 'تم إرسال ردك بنجاح!' : 'Reply sent successfully!')
  }

  const departmentLabels: Record<TicketDepartment, string> = {
    financial_payouts: isAr ? 'المالية وسحب الأرباح' : 'Financial & Payouts',
    technical: isAr ? 'مشاكل تقنية وتصفح' : 'Technical Issues',
    live_sessions: isAr ? 'البث المباشر والورش' : 'Live Sessions',
    curriculum: isAr ? 'المحتوى والاختبارات' : 'Curriculum & Content',
    account: isAr ? 'الحساب والشهادات' : 'Account & Certificates',
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'مركز المساعدة وخدمة العملاء' : 'Help & Customer Care'}
        title={isAr ? 'الدعم الفني والتواصل مع الإدارة' : 'Support Tickets Center'}
        description={
          isAr
            ? 'تواصل مباشرة مع فريق الدعم الفني والإدارة لحل المشاكل التقنية أو الاستفسار عن الأرباح والشهادات.'
            : 'Open support tickets and communicate directly with technical assistance and administration teams.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: isAr ? 'الدعم الفني' : 'Support' },
        ]}
        actions={
          <Button
            size="sm"
            icon={<IconPlus size={16} />}
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-hover text-white font-bold shadow-sm"
          >
            {isAr ? 'فتح تذكرة جديدة' : 'Open New Ticket'}
          </Button>
        }
      />

      {/* Main Support Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-4 bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-border px-2">
            <span className="font-bold text-text-main text-xs">{isAr ? 'تذاكري السابقة' : 'My Tickets'}</span>
            <Badge tone="primary">{tickets.length}</Badge>
          </div>

          {tickets.length === 0 ? (
            <EmptyState
              icon={<IconHeadset size={32} stroke={1.5} />}
              title={isAr ? 'لا توجد تذاكر حالية' : 'No active tickets'}
              description={isAr ? 'اضغط على زر فتح تذكرة جديدة لطلب المساعدة.' : 'Click new ticket button to request assistance.'}
            />
          ) : (
            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-2xl border text-start flex flex-col gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-border bg-surface hover:bg-surface-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-primary">{t.ticket_number}</span>
                      <Badge
                        tone={
                          t.status === 'resolved'
                            ? 'success'
                            : t.status === 'in_progress'
                              ? 'primary'
                              : 'warning'
                        }
                        className="text-[10px] py-0 px-1.5"
                      >
                        {t.status === 'resolved'
                          ? (isAr ? 'تم الحل' : 'Resolved')
                          : t.status === 'in_progress'
                            ? (isAr ? 'قيد المعالجة' : 'In Progress')
                            : (isAr ? 'مفتوحة' : 'Open')}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-text-main text-xs m-0 line-clamp-1 leading-snug">
                      {t.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-text-muted mt-0.5">
                      <span>{departmentLabels[t.department]}</span>
                      <span>{formatDate(t.updated_at)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div className="lg:col-span-8 bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col min-h-[550px]">
          {selectedTicket ? (
            <>
              {/* Conversation Header */}
              <div className="p-5 border-b border-border bg-surface-muted/30 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary">{selectedTicket.ticket_number}</span>
                    <span className="text-xs text-text-subtle">·</span>
                    <Badge tone="muted" className="text-[10px]">
                      {departmentLabels[selectedTicket.department]}
                    </Badge>
                    <Badge
                      tone={
                        selectedTicket.priority === 'urgent'
                          ? 'danger'
                          : selectedTicket.priority === 'high'
                            ? 'warning'
                            : 'muted'
                      }
                      className="text-[10px]"
                    >
                      {selectedTicket.priority === 'urgent'
                        ? (isAr ? 'أولوية عاجلة' : 'Urgent')
                        : selectedTicket.priority === 'high'
                          ? (isAr ? 'أولوية عالية' : 'High')
                          : (isAr ? 'أولوية عادية' : 'Normal')}
                    </Badge>
                  </div>

                  <h3 className="font-heading font-black text-sm sm:text-base text-text-main m-0 mt-1">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <Badge
                  tone={
                    selectedTicket.status === 'resolved'
                      ? 'success'
                      : selectedTicket.status === 'in_progress'
                        ? 'primary'
                        : 'warning'
                  }
                >
                  {selectedTicket.status === 'resolved'
                    ? (isAr ? 'تم الحل بنجاح' : 'Resolved')
                    : selectedTicket.status === 'in_progress'
                      ? (isAr ? 'جاري المتابعة والرد' : 'In Progress')
                      : (isAr ? 'بانتظار رد الدعم' : 'Awaiting Reply')}
                </Badge>
              </div>

              {/* Messages Flow */}
              <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[450px]">
                {selectedTicket.messages.map((msg) => {
                  const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'support_agent'
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 max-w-[85%] ${
                        isAdmin ? 'self-start items-start' : 'self-end items-end'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[11px] text-text-muted px-1">
                        <span className="font-bold text-text-main flex items-center gap-1">
                          {isAdmin ? (
                            <span className="text-primary font-bold flex items-center gap-1">
                              <IconShieldCheck size={14} />
                              {msg.sender_name}
                            </span>
                          ) : (
                            msg.sender_name
                          )}
                        </span>
                        <span>·</span>
                        <span>{formatDate(msg.created_at)}</span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isAdmin
                            ? 'bg-primary/10 border border-primary/20 text-text-main rounded-tl-xs'
                            : 'bg-surface-muted/90 border border-border text-text-main rounded-tr-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-border bg-surface-muted/20 flex gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isAr ? 'اكتب ردك أو استفسارك هنا...' : 'Type your reply here...'}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-surface border border-border text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
                <Button
                  type="submit"
                  icon={<IconSend size={16} />}
                  className="bg-primary hover:bg-primary-hover text-white font-bold"
                >
                  {isAr ? 'إرسال' : 'Send'}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12">
              <EmptyState
                icon={<IconMessageCircle size={36} stroke={1.5} />}
                title={isAr ? 'اختر تذكرة لعرض المحادثة' : 'Select a ticket'}
                description={isAr ? 'يمكنك استعراض التذاكر السابقة أو فتح تذكرة جديدة.' : 'Choose a ticket from list.'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        size="md"
        title={isAr ? 'فتح تذكرة دعم فني جديدة' : 'Open Support Ticket'}
      >
        <form onSubmit={handleCreateTicket} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="font-bold text-text-main block mb-1.5">
              {isAr ? 'القسم المختص *' : 'Department *'}
            </label>
            <Select
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value as TicketDepartment)}
            >
              <option value="financial_payouts">{isAr ? 'المالية وسحب أرباح اللايف والكورسات' : 'Financial & Live Payouts'}</option>
              <option value="technical">{isAr ? 'مشاكل تقنية وتصفح المنصة' : 'Technical & Platform Issues'}</option>
              <option value="live_sessions">{isAr ? 'البث المباشر والورش التفاعلية' : 'Live Interactive Sessions'}</option>
              <option value="curriculum">{isAr ? 'محتوى الكورسات والشهادات والتقييم' : 'Curriculum & Certificates'}</option>
              <option value="account">{isAr ? 'إدارة الحساب وكلمة المرور' : 'Account & Access'}</option>
            </Select>
          </div>

          <div>
            <label className="font-bold text-text-main block mb-1.5">
              {isAr ? 'مستوى الأهمية' : 'Priority Level'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 'low', label: isAr ? 'منخفضة' : 'Low' },
                { val: 'medium', label: isAr ? 'متوسطة' : 'Medium' },
                { val: 'high', label: isAr ? 'عالية' : 'High' },
                { val: 'urgent', label: isAr ? 'عاجلة' : 'Urgent' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setNewPriority(p.val as TicketPriority)}
                  className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    newPriority === p.val
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface text-text-muted hover:bg-surface-muted'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-text-main block mb-1.5">
              {isAr ? 'عنوان المشكلة أو الاستفسار *' : 'Subject *'}
            </label>
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder={isAr ? 'مثال: استفسار بخصوص تفعيل حوالة الأرباح البنكية' : 'Brief subject summary...'}
              required
            />
          </div>

          <div>
            <label className="font-bold text-text-main block mb-1.5">
              {isAr ? 'التفاصيل والشرح *' : 'Detailed Description *'}
            </label>
            <Textarea
              rows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAr ? 'اشرح المشكلة بالتفصيل لمساعدة فريق الدعم على حلها سريعاً...' : 'Provide details...'}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button size="sm" type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold">
              {isAr ? 'إرسال التذكرة' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
