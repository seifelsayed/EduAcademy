import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconHeadset,
  IconMessageCircle,
  IconRefresh,
  IconSearch,
  IconSend,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Select, Textarea } from '@/components/atoms/inputs'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Modal } from '@/components/molecules/Modal'
import { PageHeader } from '@/components/templates/PageHeader'
import { useTranslation } from '@/shared/lib/i18n'
import {
  getStoredTickets,
  saveStoredTickets,
  type SupportMessage,
  type SupportTicket,
  type TicketDepartment,
  type TicketPriority,
  type TicketStatus,
} from '@/stores/supportStore'
import { toast } from '@/stores/toastStore'

export function AdminSupportPage() {
  const { t, isAr, formatDate, formatNumber } = useTranslation()

  const [tickets, setTickets] = useState<SupportTicket[]>(() => getStoredTickets())
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [adminReplyText, setAdminReplyText] = useState('')

  useEffect(() => {
    saveStoredTickets(tickets)
  }, [tickets])

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null

  const openTicketsCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length
  const urgentCount = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length

  const filteredTickets = tickets.filter((t) => {
    if (departmentFilter !== 'all' && t.department !== departmentFilter) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      t.subject.toLowerCase().includes(q) ||
      t.ticket_number.toLowerCase().includes(q) ||
      t.user_name.toLowerCase().includes(q) ||
      t.user_email.toLowerCase().includes(q)
    )
  })

  const departmentLabels: Record<TicketDepartment, string> = {
    financial_payouts: isAr ? 'المالية وسحب الأرباح' : 'Financial & Payouts',
    technical: isAr ? 'مشاكل تقنية وتصفح' : 'Technical Issues',
    live_sessions: isAr ? 'البث المباشر والورش' : 'Live Sessions',
    curriculum: isAr ? 'المحتوى والاختبارات' : 'Curriculum & Content',
    account: isAr ? 'الحساب والشهادات' : 'Account & Certificates',
  }

  const handleAdminReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !adminReplyText.trim()) return

    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender_name: isAr ? 'إدارة المنصة (فريق الدعم الفني)' : 'Platform Administration',
      sender_role: 'admin',
      content: adminReplyText.trim(),
      created_at: new Date().toISOString(),
    }

    const updated = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            updated_at: new Date().toISOString(),
            status: t.status === 'open' ? ('in_progress' as const) : t.status,
            messages: [...t.messages, newMsg],
          }
        : t,
    )

    setTickets(updated)
    setAdminReplyText('')
    toast.success(isAr ? 'تم إرسال الرد وتحديث التذكرة بنجاح!' : 'Reply sent and ticket updated!')
  }

  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: newStatus,
            updated_at: new Date().toISOString(),
          }
        : t,
    )
    setTickets(updated)
    toast.success(isAr ? 'تم تحديث حالة التذكرة.' : 'Ticket status updated.')
  }

  const handleUpdatePriority = (ticketId: string, newPriority: TicketPriority) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            priority: newPriority,
            updated_at: new Date().toISOString(),
          }
        : t,
    )
    setTickets(updated)
    toast.success(isAr ? 'تم تحديث أولوية التذكرة.' : 'Ticket priority updated.')
  }

  const applyCannedResponse = (text: string) => {
    setAdminReplyText(text)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'خدمة العملاء والدعم الفني' : 'Helpdesk Operations'}
        title={isAr ? 'مركز إدارة تذاكر الدعم والتواصل' : 'Support Tickets Operations'}
        description={
          isAr
            ? 'متابعة بلاغات واستفسارات الطلاب والمدرسين، الرد الفوري، وإدارة حلول المشاكل التقنية والمالية.'
            : 'Manage customer queries, resolve student and instructor tickets, and oversee communication workflows.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'تذاكر الدعم' : 'Support' },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'تذاكر جديدة بانتظار الرد' : 'Open Tickets'}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <IconClock size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {formatNumber(openTicketsCount)}
            </div>
            <span className="text-xs text-text-muted mt-1 block">{isAr ? 'تتطلب رد فريق الدعم' : 'Awaiting initial response'}</span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'تذاكر قيد المعالجة' : 'In Progress'}</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
              <IconRefresh size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-primary tabular-nums">
              {formatNumber(inProgressCount)}
            </div>
            <span className="text-xs text-text-muted mt-1 block">{isAr ? 'محادثات نشطة مع المستخدمين' : 'Active troubleshooting'}</span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'تذاكر ذات أولوية عاجلة' : 'Urgent Priority'}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
              <IconAlertCircle size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
              {formatNumber(urgentCount)}
            </div>
            <span className="text-xs text-text-muted mt-1 block">{isAr ? 'تتطلب تدخلاً عاجلاً' : 'Critical escalations'}</span>
          </div>
        </div>

        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">{isAr ? 'تذاكر تم حلها بنجاح' : 'Resolved Tickets'}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <IconShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatNumber(resolvedCount)}
            </div>
            <span className="text-xs text-text-muted mt-1 block">{isAr ? 'تم إغلاق البلاغ بنجاح' : 'Successfully completed'}</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3.5">
        <div className="sm:col-span-4 relative">
          <IconSearch
            size={16}
            className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'البحث بعنوان التذكرة، اسم المستخدم، البريد، أو الرقم...' : 'Search subject, user, email, or ticket #...'}
            className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            aria-label={isAr ? 'تصفية حسب القسم' : 'Filter by department'}
          >
            <option value="all">{isAr ? 'جميع الأقسام (All)' : 'All Departments'}</option>
            <option value="financial_payouts">{isAr ? 'المالية وسحب الأرباح' : 'Financial & Payouts'}</option>
            <option value="technical">{isAr ? 'مشاكل تقنية' : 'Technical'}</option>
            <option value="live_sessions">{isAr ? 'البث المباشر' : 'Live Sessions'}</option>
            <option value="curriculum">{isAr ? 'المحتوى والشهادات' : 'Curriculum'}</option>
            <option value="account">{isAr ? 'الحساب' : 'Account'}</option>
          </Select>
        </div>

        <div className="sm:col-span-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={isAr ? 'تصفية حسب الحالة' : 'Filter by status'}
          >
            <option value="all">{isAr ? 'جميع الحالات (All)' : 'All Statuses'}</option>
            <option value="open">{isAr ? 'مفتوحة (Open)' : 'Open'}</option>
            <option value="in_progress">{isAr ? 'قيد المعالجة (In Progress)' : 'In Progress'}</option>
            <option value="resolved">{isAr ? 'تم الحل (Resolved)' : 'Resolved'}</option>
            <option value="closed">{isAr ? 'مغلقة (Closed)' : 'Closed'}</option>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label={isAr ? 'تصفية حسب الأولوية' : 'Filter by priority'}
          >
            <option value="all">{isAr ? 'كل الأولويات' : 'All Priority'}</option>
            <option value="urgent">{isAr ? 'عاجلة' : 'Urgent'}</option>
            <option value="high">{isAr ? 'عالية' : 'High'}</option>
            <option value="medium">{isAr ? 'متوسطة' : 'Medium'}</option>
            <option value="low">{isAr ? 'منخفضة' : 'Low'}</option>
          </Select>
        </div>
      </div>

      {/* Tickets Management Table */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={<IconHeadset size={36} stroke={1.5} />}
          title={isAr ? 'لا توجد تذاكر دعم مطابقة' : 'No support tickets found'}
          description={isAr ? 'جرب تغيير خيارات التصفية أو البحث.' : 'Try changing filters.'}
        />
      ) : (
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                  <th className="py-3.5 px-5 text-start">{isAr ? 'المستخدم' : 'User'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'عنوان التذكرة والموضوع' : 'Subject'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'القسم' : 'Department'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'الأولوية' : 'Priority'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'آخر تحديث' : 'Last Updated'}</th>
                  <th className="py-3.5 px-5 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={ticket.user_name} size="sm" />
                        <div>
                          <div className="font-bold text-text-main text-xs flex items-center gap-1.5">
                            {ticket.user_name}
                            {ticket.user_role === 'instructor' ? (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                                {isAr ? 'مدرس' : 'Instructor'}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-text-muted font-mono">{ticket.user_email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 max-w-xs">
                      <div className="font-bold text-text-main text-xs sm:text-sm truncate">{ticket.subject}</div>
                      <code className="text-[10px] text-primary font-mono font-bold">{ticket.ticket_number}</code>
                    </td>

                    <td className="py-3.5 px-5 text-xs text-text-muted font-medium">
                      {departmentLabels[ticket.department]}
                    </td>

                    <td className="py-3.5 px-5">
                      <Badge
                        tone={
                          ticket.priority === 'urgent'
                            ? 'danger'
                            : ticket.priority === 'high'
                              ? 'warning'
                              : 'muted'
                        }
                        className="text-[11px]"
                      >
                        {ticket.priority === 'urgent'
                          ? (isAr ? 'عاجلة' : 'Urgent')
                          : ticket.priority === 'high'
                            ? (isAr ? 'عالية' : 'High')
                            : ticket.priority === 'medium'
                              ? (isAr ? 'متوسطة' : 'Medium')
                              : (isAr ? 'منخفضة' : 'Low')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 text-xs text-text-muted">
                      {formatDate(ticket.updated_at)}
                    </td>

                    <td className="py-3.5 px-5">
                      <Badge
                        tone={
                          ticket.status === 'resolved'
                            ? 'success'
                            : ticket.status === 'in_progress'
                              ? 'primary'
                              : 'warning'
                        }
                      >
                        {ticket.status === 'resolved'
                          ? (isAr ? 'تم الحل' : 'Resolved')
                          : ticket.status === 'in_progress'
                            ? (isAr ? 'قيد المتابعة' : 'In Progress')
                            : (isAr ? 'مفتوحة' : 'Open')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 text-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<IconMessageCircle size={15} />}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className="text-primary font-bold hover:bg-primary/10"
                      >
                        {isAr ? 'الرد والمحادثة' : 'Chat & Reply'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Ticket Chat & Resolution Modal */}
      {selectedTicket ? (
        <Modal
          open={selectedTicket !== null}
          onClose={() => setSelectedTicketId(null)}
          size="lg"
          title={isAr ? `تذكرة: ${selectedTicket.ticket_number}` : `Ticket: ${selectedTicket.ticket_number}`}
        >
          <div className="flex flex-col gap-5 select-text">
            {/* Header Information */}
            <div className="p-4 rounded-2xl bg-surface-muted/50 border border-border flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar name={selectedTicket.user_name} size="md" />
                <div>
                  <h4 className="font-bold text-text-main text-sm m-0 flex items-center gap-2">
                    {selectedTicket.user_name}
                    <Badge tone="muted" className="text-[10px]">
                      {departmentLabels[selectedTicket.department]}
                    </Badge>
                  </h4>
                  <span className="text-xs text-text-muted font-mono">{selectedTicket.user_email}</span>
                </div>
              </div>

              {/* Status & Priority Selectors */}
              <div className="flex items-center gap-2">
                <Select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                  className="text-xs py-1.5"
                >
                  <option value="open">{isAr ? 'مفتوحة (Open)' : 'Open'}</option>
                  <option value="in_progress">{isAr ? 'قيد المتابعة (In Progress)' : 'In Progress'}</option>
                  <option value="resolved">{isAr ? 'تم الحل (Resolved)' : 'Resolved'}</option>
                  <option value="closed">{isAr ? 'إغلاق (Closed)' : 'Closed'}</option>
                </Select>

                <Select
                  value={selectedTicket.priority}
                  onChange={(e) => handleUpdatePriority(selectedTicket.id, e.target.value as TicketPriority)}
                  className="text-xs py-1.5"
                >
                  <option value="low">{isAr ? 'أولوية منخفضة' : 'Low'}</option>
                  <option value="medium">{isAr ? 'أولوية متوسطة' : 'Medium'}</option>
                  <option value="high">{isAr ? 'أولوية عالية' : 'High'}</option>
                  <option value="urgent">{isAr ? 'عاجلة جداً' : 'Urgent'}</option>
                </Select>
              </div>
            </div>

            {/* Subject Title */}
            <div className="px-1">
              <span className="text-xs text-text-muted font-bold block">{isAr ? 'الموضوع:' : 'Subject:'}</span>
              <h3 className="font-heading font-black text-sm text-text-main m-0 mt-0.5">{selectedTicket.subject}</h3>
            </div>

            {/* Threaded Conversation Stream */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col gap-3.5 max-h-[380px] overflow-y-auto">
              {selectedTicket.messages.map((msg) => {
                const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'support_agent'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 max-w-[85%] ${
                      isAdmin ? 'self-end items-end' : 'self-start items-start'
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
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-primary/10 border border-primary/20 text-text-main rounded-tr-xs'
                          : 'bg-surface-muted/90 border border-border text-text-main rounded-tl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Canned Responses */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-text-muted font-bold flex items-center gap-1">
                <IconSparkles size={14} className="text-amber-500" />
                {isAr ? 'ردود سريعة جاهزة:' : 'Quick Canned Responses:'}
              </span>
              {[
                {
                  label: isAr ? 'تم استلام وتأكيد الحوالة' : 'Payout confirmed',
                  text: isAr
                    ? 'وعليكم السلام، تم مراجعة طلب السحب وتأكيد صحة الحساب البنكي. الحوالة معتمدة وجاري إرسالها خلال مهلة الـ 7 أيام عمل المقررة.'
                    : 'Your withdrawal request has been verified and approved for wire processing.',
                },
                {
                  label: isAr ? 'تم حل المشكلة التقنية' : 'Issue resolved',
                  text: isAr
                    ? 'مرحباً، تم فحص المشكلة التقنية من قبل الفريق الهندسي وإصلاحها بالكامل. يرجى إعادة المحاولة والتأكد.'
                    : 'The technical issue has been resolved by our engineering team.',
                },
                {
                  label: isAr ? 'طلب تفاصيل إضافية' : 'Request details',
                  text: isAr
                    ? 'أهلاً بك، نرجو تزويدنا بمزيد من التفاصيل أو صورة توضيحية لنتمكن من مساعدتك بأفضل شكل.'
                    : 'Please provide additional details or a screenshot so we can assist further.',
                },
              ].map((canned, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyCannedResponse(canned.text)}
                  className="px-2.5 py-1 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-[11px] font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  {canned.label}
                </button>
              ))}
            </div>

            {/* Admin Reply Form */}
            <form onSubmit={handleAdminReply} className="flex flex-col gap-2.5">
              <Textarea
                rows={3}
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                placeholder={isAr ? 'اكتب رد الدعم الفني والإدارة هنا...' : 'Write official reply to user...'}
                required
              />

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'resolved' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<IconCheck size={15} />}
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                      className="text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    >
                      {isAr ? 'تحديد التذكرة كـ "محلولة"' : 'Mark Resolved'}
                    </Button>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedTicketId(null)}>
                    {isAr ? 'إغلاق' : 'Close'}
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    icon={<IconSend size={15} />}
                    className="bg-primary hover:bg-primary-hover text-white font-bold"
                  >
                    {isAr ? 'إرسال الرد' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
