import {
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Input, Select, Textarea } from '@/components/atoms/inputs'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { ConfirmDialog, Modal } from '@/components/molecules/Modal'
import { Pagination } from '@/components/molecules/Pagination'
import { SearchInput } from '@/components/molecules/SearchInput'
import { PageHeader } from '@/components/templates/PageHeader'
import type { User, UserRole, UserStatus } from '@/core/domain/schemas/user'
import { useAdminUsers, useCreateUser, useDeleteUser, useUpdateUser } from '@/features/dashboard/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'

const ROLE_TONE: Record<UserRole, 'danger' | 'primary' | 'muted'> = {
  admin: 'danger',
  instructor: 'primary',
  student: 'muted',
}

export function AdminUsersPage() {
  const [searchParams] = useSearchParams()
  const { t, isAr, formatDate, formatNumber } = useTranslation()

  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole | undefined>(
    (searchParams.get('role') as UserRole | null) ?? undefined,
  )
  const [status, setStatus] = useState<UserStatus | undefined>(undefined)
  const [page, setPage] = useState(1)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null)

  const currentUser = useCurrentUser()
  const { data, isLoading } = useAdminUsers({ search: search || undefined, role, status, page })
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const statistics = data?.extra.statistics as
    | { total: number; students: number; instructors: number; admins: number }
    | undefined

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'إدارة حسابات المستخدمين' : 'User Administration'}
        title={isAr ? 'المستخدمون والصلاحيات' : 'Manage Users'}
        description={
          statistics
            ? isAr
              ? `${formatNumber(statistics.total)} حساب مسجل · ${formatNumber(statistics.students)} طالب · ${formatNumber(statistics.instructors)} مدرب · ${formatNumber(statistics.admins)} مدير`
              : `${statistics.total} registered accounts · ${statistics.students} students · ${statistics.instructors} instructors · ${statistics.admins} admins`
            : isAr ? 'إدارة حسابات المنصة والأدوار الأمنية وحالات الحسابات.' : 'Manage platform accounts, security roles, and user statuses.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.admin'), to: '/admin' },
          { label: isAr ? 'المستخدمون' : 'Users' },
        ]}
        actions={
          <Button
            size="sm"
            icon={<IconPlus size={16} />}
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-hover text-white font-bold"
          >
            {isAr ? 'إضافة مستخدم جديد' : 'Add New User'}
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        {/* Filters and search toolbar */}
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-6">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder={isAr ? 'البحث بالاسم الكامل أو البريد الإلكتروني...' : 'Search by full name or email address...'}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={role ?? ''}
              aria-label={isAr ? 'تصفية حسب الدور' : 'Filter by role'}
              onChange={(event) => {
                setRole((event.target.value || undefined) as UserRole | undefined)
                setPage(1)
              }}
            >
              <option value="">{isAr ? 'جميع الأدوار' : 'All Roles'}</option>
              <option value="student">{isAr ? 'الطلاب' : 'Students'}</option>
              <option value="instructor">{isAr ? 'المدرسون' : 'Instructors'}</option>
              <option value="admin">{isAr ? 'المديرون' : 'Administrators'}</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select
              value={status ?? ''}
              aria-label={isAr ? 'تصفية حسب الحالة' : 'Filter by status'}
              onChange={(event) => {
                setStatus((event.target.value || undefined) as UserStatus | undefined)
                setPage(1)
              }}
            >
              <option value="">{isAr ? 'جميع الحالات' : 'Any Status'}</option>
              <option value="active">{isAr ? 'نشط' : 'Active'}</option>
              <option value="suspended">{isAr ? 'موقوف' : 'Suspended'}</option>
              <option value="pending">{isAr ? 'قيد الانتظار' : 'Pending'}</option>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <CenteredSpinner label={t('common.loading')} />
        ) : (
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                    <th className="py-3.5 px-5 text-start">{isAr ? 'المستخدم' : 'User Account'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'الدور والصلاحية' : 'Role'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'حالة الحساب' : 'Account Status'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                    <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data?.items.map((user) => {
                    const isSelf = user.id === currentUser?.id

                    return (
                      <tr key={user.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} src={user.avatar_url} size="sm" />
                            <div className="min-w-0">
                              <div className="font-bold text-text-main text-xs sm:text-sm truncate">
                                {user.name}
                                {isSelf ? <span className="text-primary text-xs font-semibold">{isAr ? ' (أنت)' : ' (you)'}</span> : null}
                              </div>
                              <div className="text-[11px] text-text-muted font-mono truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <Badge tone={ROLE_TONE[user.role]}>
                            {user.role === 'admin' ? (isAr ? 'مدير' : 'Admin') : user.role === 'instructor' ? (isAr ? 'مدرس' : 'Instructor') : (isAr ? 'طالب' : 'Student')}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              user.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                : user.status === 'suspended'
                                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {user.status === 'active' ? (isAr ? 'نشط' : 'Active') : user.status === 'suspended' ? (isAr ? 'موقوف' : 'Suspended') : (isAr ? 'قيد الانتظار' : 'Pending')}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-xs text-text-muted font-medium font-sans">
                          {formatDate(user.created_at)}
                        </td>

                        <td className="py-3.5 px-5 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<IconEdit size={15} />}
                              onClick={() => setEditingUser(user)}
                              title={isAr ? 'تعديل بيانات المستخدم' : 'Edit user'}
                            />

                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete ${user.name}`}
                              icon={<IconTrash size={15} />}
                              className="text-text-muted hover:text-danger hover:bg-danger-light"
                              disabled={isSelf}
                              onClick={() => setPendingDelete({ id: user.id, name: user.name })}
                              title={isAr ? 'حذف المستخدم' : 'Delete user'}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {data ? (
              <div className="p-4 border-t border-border bg-surface-muted/30">
                <Pagination meta={data.meta} onChange={setPage} />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        isAr={isAr}
        onSubmit={async (values) => {
          await createUser.mutateAsync(values)
          setShowCreateModal(false)
        }}
        loading={createUser.isPending}
      />

      {/* Edit User Modal */}
      {editingUser ? (
        <EditUserModal
          open={editingUser !== null}
          user={editingUser}
          isSelf={editingUser.id === currentUser?.id}
          isAr={isAr}
          onClose={() => setEditingUser(null)}
          onSubmit={async (input) => {
            await updateUser.mutateAsync({ id: editingUser.id, input })
            setEditingUser(null)
          }}
          loading={updateUser.isPending}
        />
      ) : null}

      {/* Delete User Dialog */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title={isAr ? 'حذف هذا المستخدم نهائياً؟' : 'Delete this user permanently?'}
        message={
          isAr
            ? `سيتم حذف “${pendingDelete?.name ?? 'المستخدم'}” مع جميع تسجيلاته وبياناته.`
            : `${pendingDelete?.name ?? 'This user'} will be removed along with their courses, enrollments, and activity history.`
        }
        confirmLabel={isAr ? 'حذف المستخدم' : 'Delete User'}
        destructive
        loading={deleteUser.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteUser.mutate(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}

function CreateUserModal({
  open,
  onClose,
  isAr,
  onSubmit,
  loading,
}: {
  open: boolean
  onClose: () => void
  isAr: boolean
  onSubmit: (values: {
    name: string
    email: string
    password: string
    role: UserRole
    status: UserStatus
    headline?: string
    bio?: string
  }) => Promise<void>
  loading: boolean
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [status, setStatus] = useState<UserStatus>('active')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return
    await onSubmit({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
      status,
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
    })
    setName('')
    setEmail('')
    setPassword('')
    setHeadline('')
    setBio('')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={isAr ? 'إضافة مستخدم جديد للمنصة' : 'Create New User Account'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'الاسم الكامل *' : 'Full Name *'}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? 'مثال: سيف الدين طارق' : 'e.g. John Doe'}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'كلمة المرور الابتدائية *' : 'Initial Password *'}
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isAr ? '8 أحرف على الأقل' : 'At least 8 characters'}
            minLength={8}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-text-main block mb-1.5">
              {isAr ? 'الدور والصلاحية' : 'User Role'}
            </label>
            <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="student">{isAr ? 'طالب (Student)' : 'Student'}</option>
              <option value="instructor">{isAr ? 'مدرس (Instructor)' : 'Instructor'}</option>
              <option value="admin">{isAr ? 'مدير (Admin)' : 'Administrator'}</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-text-main block mb-1.5">
              {isAr ? 'حالة الحساب' : 'Account Status'}
            </label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as UserStatus)}>
              <option value="active">{isAr ? 'نشط (Active)' : 'Active'}</option>
              <option value="suspended">{isAr ? 'موقوف (Suspended)' : 'Suspended'}</option>
              <option value="pending">{isAr ? 'قيد الانتظار (Pending)' : 'Pending'}</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'المسمى الوظيفي / النبذة (اختياري)' : 'Headline (Optional)'}
          </label>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={isAr ? 'مثال: مهندس برمجيات ومطور واجهات' : 'e.g. Senior Software Engineer'}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={loading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button size="sm" type="submit" loading={loading} className="bg-primary hover:bg-primary-hover text-white font-bold">
            {isAr ? 'إنشاء المستخدم' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditUserModal({
  open,
  user,
  isSelf,
  isAr,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean
  user: User
  isSelf: boolean
  isAr: boolean
  onClose: () => void
  onSubmit: (input: {
    name?: string
    email?: string
    password?: string
    role?: UserRole
    status?: UserStatus
    headline?: string
    bio?: string
  }) => Promise<void>
  loading: boolean
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(user.role)
  const [status, setStatus] = useState<UserStatus>(user.status ?? 'active')
  const [headline, setHeadline] = useState(user.headline ?? '')
  const [bio, setBio] = useState(user.bio ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name: name.trim() || undefined,
      email: (email || '').trim() || undefined,
      password: password.trim() || undefined,
      role: isSelf ? undefined : role,
      status: isSelf ? undefined : status,
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={isAr ? `تعديل بيانات: ${user.name}` : `Edit User: ${user.name}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'الاسم الكامل *' : 'Full Name *'}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'إعادة تعيين كلمة المرور (اتركه فارغاً للإبقاء عليها)' : 'Reset Password (Leave blank to keep current)'}
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isAr ? 'أدخل كلمة مرور جديدة...' : 'Enter new password...'}
            minLength={8}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-text-main block mb-1.5">
              {isAr ? 'الدور والصلاحية' : 'User Role'}
            </label>
            <Select
              value={role}
              disabled={isSelf}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="student">{isAr ? 'طالب (Student)' : 'Student'}</option>
              <option value="instructor">{isAr ? 'مدرس (Instructor)' : 'Instructor'}</option>
              <option value="admin">{isAr ? 'مدير (Admin)' : 'Administrator'}</option>
            </Select>
            {isSelf ? (
              <span className="text-[10px] text-text-muted mt-1 block">
                {isAr ? 'لا يمكنك تغيير دورك بنفسك' : 'Self-role changes disabled'}
              </span>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-bold text-text-main block mb-1.5">
              {isAr ? 'حالة الحساب' : 'Account Status'}
            </label>
            <Select
              value={status}
              disabled={isSelf}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
            >
              <option value="active">{isAr ? 'نشط (Active)' : 'Active'}</option>
              <option value="suspended">{isAr ? 'موقوف (Suspended)' : 'Suspended'}</option>
              <option value="pending">{isAr ? 'قيد الانتظار (Pending)' : 'Pending'}</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'المسمى الوظيفي' : 'Headline'}
          </label>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={isAr ? 'المسمى الوظيفي' : 'Headline'}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-text-main block mb-1.5">
            {isAr ? 'السيرة الذاتية والنبذة' : 'Bio'}
          </label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder={isAr ? 'نبذة تعريفية عن المستخدم...' : 'Short user biography...'}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={loading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button size="sm" type="submit" loading={loading} className="bg-primary hover:bg-primary-hover text-white font-bold">
            {isAr ? 'حفظ التعديلات' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
