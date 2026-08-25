import { zodResolver } from '@hookform/resolvers/zod'
import { IconEdit, IconFolder, IconPlus, IconTrash } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'


import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Checkbox, Input, Select, Textarea } from '@/components/atoms/inputs'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { FormField } from '@/components/molecules/FormField'
import { ConfirmDialog, Modal } from '@/components/molecules/Modal'
import { PageHeader } from '@/components/templates/PageHeader'
import type { Category } from '@/core/domain/schemas/catalog'
import { categoryFormSchema, type CategoryForm, type CategoryFormInput } from '@/core/domain/schemas/forms'
import { catalogApi } from '@/core/infrastructure/api/catalogApi'
import { useCategories } from '@/features/catalog/hooks'
import { getLocalizedCategoryName } from '@/features/catalog/localizedCatalog'
import { useTranslation } from '@/shared/lib/i18n'
import { queryKeys } from '@/shared/lib/queryKeys'
import { toast } from '@/stores/toastStore'

export function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories(true)
  const queryClient = useQueryClient()
  const { t, isAr, language, formatNumber } = useTranslation()

  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
  }

  const save = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: CategoryForm }) => {
      const payload = { ...input, parent_id: input.parent_id === '' ? null : input.parent_id }

      return id ? catalogApi.updateCategory(id, payload) : catalogApi.createCategory(payload)
    },
    onSuccess: async () => {
      await invalidate()
      toast.success(isAr ? 'تم حفظ التخصص بنجاح.' : 'Category saved successfully.')
      setEditing(null)
      setCreating(false)
    },
    onError: (error) => toast.fromError(error),
  })

  const remove = useMutation({
    mutationFn: (id: number) => catalogApi.deleteCategory(id),
    onSuccess: async () => {
      await invalidate()
      toast.success(isAr ? 'تم حذف التخصص.' : 'Category removed.')
    },
    onError: (error) => toast.fromError(error, isAr ? 'هذا التخصص يحتوي على كورسات نشطة.' : 'This category still contains active courses.'),
  })

  if (isLoading) return <CenteredSpinner label={t('common.loading')} />

  const roots = categories ?? []

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'هيكلية التصنيفات والملاحة' : 'Taxonomy & Navigation'}
        title={isAr ? 'إدارة تصنيفات الكورسات' : 'Course Categories'}
        description={isAr ? 'التصنيفات والمسارات متعددة المستويات لتسهيل استكشاف وتصفية الدورات عبر المنصة.' : 'The multi-level taxonomy learners use to browse and filter courses across the catalog.'}
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.admin'), to: '/admin' }, { label: isAr ? 'التصنيفات' : 'Categories' }]}
        actions={
          <Button size="sm" icon={<IconPlus size={15} />} onClick={() => setCreating(true)}>
            {isAr ? 'إنشاء تصنيف جديد' : 'New Category'}
          </Button>
        }
      />

      <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                <th className="py-3.5 px-5 text-start">{isAr ? 'اسم التصنيف' : 'Category Name'}</th>
                <th className="py-3.5 px-5 text-start">{isAr ? 'الرابط التعريفي Slug' : 'URL Slug'}</th>
                <th className="py-3.5 px-5 text-start">{t('navigation.courses')}</th>
                <th className="py-3.5 px-5 text-start">{t('common.status')}</th>
                <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {roots.flatMap((category) => [
                <CategoryRow
                  key={category.id}
                  category={category}
                  language={language}
                  formatNumber={formatNumber}
                  isAr={isAr}
                  onEdit={setEditing}
                  onDelete={setPendingDelete}
                />,
                ...(category.children ?? []).map((child) => (
                  <CategoryRow
                    key={child.id}
                    category={child}
                    language={language}
                    formatNumber={formatNumber}
                    isAr={isAr}
                    nested
                    onEdit={setEditing}
                    onDelete={setPendingDelete}
                  />
                )),
              ])}
            </tbody>
          </table>
        </div>
      </div>

      {creating || editing ? (
        <CategoryModal
          category={editing}
          roots={roots}
          saving={save.isPending}
          isAr={isAr}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
          onSubmit={(values) => save.mutate({ id: editing?.id, input: values })}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={isAr ? 'هل أنت متأكد من حذف هذا التصنيف؟' : 'Delete this category?'}
        message={isAr ? `سيتم حذف “${pendingDelete?.name ?? ''}”. لا يمكن حذف تصنيف يحتوي على كورسات نشطة.` : `“${pendingDelete?.name ?? ''}” will be removed. Categories with courses cannot be deleted until courses are reassigned.`}
        confirmLabel={isAr ? 'حذف التصنيف' : 'Delete Category'}
        destructive
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) remove.mutate(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}

function CategoryRow({
  category,
  nested = false,
  language,
  formatNumber,
  isAr,
  onEdit,
  onDelete,
}: {
  category: Category
  nested?: boolean
  language: 'ar' | 'en'
  formatNumber: (n: number) => string
  isAr: boolean
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  const catName = getLocalizedCategoryName(category, language)

  return (
    <tr className="hover:bg-surface-hover/50 transition-colors">
      <td className={`py-3.5 px-5 ${nested ? 'ps-8 text-text-muted font-medium' : 'font-bold text-text-main'}`}>
        <div className="flex items-center gap-2">
          {nested ? (
            <span className="text-text-subtle select-none">↳</span>
          ) : (
            <span className="w-6 h-6 rounded-lg bg-primary-light text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <IconFolder size={14} />
            </span>
          )}
          <span>{catName}</span>
        </div>
      </td>
      <td className="py-3.5 px-5">
        <code className="text-xs font-mono text-text-muted bg-surface-muted px-2 py-0.5 rounded-md border border-border">
          {category.slug}
        </code>
      </td>
      <td className="py-3.5 px-5 tabular-nums font-bold text-text-main">
        {formatNumber(category.courses_count ?? 0)}
      </td>
      <td className="py-3.5 px-5">
        <Badge tone={category.is_active ? 'success' : 'muted'}>
          {category.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'مخفي' : 'Hidden')}
        </Badge>
      </td>
      <td className="py-3.5 px-5 text-end">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${category.name}`}
            icon={<IconEdit size={16} />}
            onClick={() => onEdit(category)}
          />
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${category.name}`}
            icon={<IconTrash size={16} />}
            className="text-text-muted hover:text-danger hover:bg-danger-light"
            onClick={() => onDelete(category)}
          />
        </div>
      </td>
    </tr>
  )
}

function CategoryModal({
  category,
  roots,
  saving,
  isAr,
  onClose,
  onSubmit,
}: {
  category: Category | null
  roots: Category[]
  saving: boolean
  isAr: boolean
  onClose: () => void
  onSubmit: (values: CategoryForm) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryForm>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? '',
      parent_id: category?.parent_id ?? '',
      description: category?.description ?? '',
      icon: category?.icon ?? '',
      color: category?.color ?? '',
      position: category?.position ?? 0,
      is_active: category?.is_active ?? true,
    },
  })

  return (
    <Modal
      open
      title={category ? (isAr ? 'تعديل التصنيف' : 'Edit Category') : (isAr ? 'إنشاء تصنيف جديد' : 'Create New Category')}
      size="md"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button size="sm" loading={saving} onClick={handleSubmit(onSubmit)}>
            {category ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إنشاء التصنيف' : 'Create Category')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label={isAr ? 'اسم التصنيف' : 'Category Name'} error={errors.name?.message} required>
          <Input invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>

        <FormField label={isAr ? 'التصنيف الأب (اختياري)' : 'Parent Category'} error={errors.parent_id?.message}>
          <Select {...register('parent_id')}>
            <option value="">{isAr ? 'بدون — هذا تصنيف رئيسي' : 'None — This is a top-level category'}</option>
            {roots
              .filter((root) => root.id !== category?.id)
              .map((root) => (
                <option key={root.id} value={root.id}>
                  {root.name}
                </option>
              ))}
          </Select>
        </FormField>

        <FormField label={isAr ? 'الوصف' : 'Description'} error={errors.description?.message}>
          <Textarea rows={2} placeholder={isAr ? 'نبذة مختصرة عن هذا التخصص...' : 'Brief summary of topics under this category...'} {...register('description')} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label={isAr ? 'معرف الأيقونة' : 'Icon identifier'}
            error={errors.icon?.message}
            hint={isAr ? "مثال: 'code', 'database', 'palette'" : "e.g. 'code', 'database', 'palette'"}
          >
            <Input placeholder="code" {...register('icon')} />
          </FormField>

          <FormField label={isAr ? 'ترتيب الظهور' : 'Display Sort Order'} error={errors.position?.message}>
            <Input type="number" min={0} {...register('position')} />
          </FormField>
        </div>

        <div className="pt-1">
          <Checkbox label={isAr ? 'مرئي للطلاب في الدليل' : 'Visible to learners in catalogue'} {...register('is_active')} />
        </div>
      </div>
    </Modal>
  )
}

