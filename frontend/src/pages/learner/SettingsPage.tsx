import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconCamera,
  IconLock,
  IconShieldLock,
  IconUpload,
  IconUser,
} from '@tabler/icons-react'
import { useRef, useState } from 'react'

import { useForm } from 'react-hook-form'

import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { Input, Textarea } from '@/components/atoms/inputs'
import { FormField } from '@/components/molecules/FormField'
import { PageHeader } from '@/components/templates/PageHeader'
import {
  passwordFormSchema,
  profileFormSchema,
  type PasswordForm,
  type PasswordFormInput,
  type ProfileForm,
  type ProfileFormInput,
} from '@/core/domain/schemas/forms'
import { useChangePassword, useUpdateProfile } from '@/features/auth/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'

export function SettingsPage() {
  const user = useCurrentUser()
  const { t, isAr } = useTranslation()

  if (!user) return null

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'إدارة الحساب' : 'Account Center'}
        title={t('navigation.settings')}
        description={
          isAr
            ? 'تحديث بياناتك الشخصية، النبذة التعريفية، وإعدادات الأمان وكلمة المرور.'
            : 'Manage your public persona, profile bio, avatar, and security credentials.'
        }
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.settings') }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        <div className="lg:col-span-7">
          <ProfileCard />
        </div>
        <div className="lg:col-span-5">
          <PasswordCard />
        </div>
      </div>
    </div>
  )
}

function ProfileCard() {
  const user = useCurrentUser()
  const update = useUpdateProfile()
  const { t, isAr } = useTranslation()
  const fileInput = useRef<HTMLInputElement>(null)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormInput, unknown, ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      headline: user?.headline ?? '',
      bio: user?.bio ?? '',
      website: user?.website ?? '',
    },
  })

  const onPickAvatar = (file: File | undefined) => {
    if (!file) return

    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <form
      className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-xs flex flex-col"
      onSubmit={handleSubmit((values) => update.mutate({ input: values, avatar }))}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center border border-primary/20">
            <IconUser size={16} />
          </div>
          <h2 className="text-sm sm:text-base font-black text-text-main m-0">
            {isAr ? 'الملف الشخصي العام' : 'Public Profile'}
          </h2>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {/* Avatar Upload Banner */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-muted/40 border border-border mb-2">
          <div className="relative group cursor-pointer" onClick={() => fileInput.current?.click()}>
            <Avatar name={user?.name ?? ''} src={preview ?? user?.avatar_url} size="lg" />
            <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <IconCamera size={18} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<IconUpload size={14} />}
              onClick={() => fileInput.current?.click()}
            >
              {isAr ? 'تغيير الصورة الشخصية' : 'Upload Avatar'}
            </Button>
            <p className="text-[11px] text-text-muted mt-1.5 mb-0">
              {isAr ? 'JPG, PNG أو WebP بحد أقصى 4MB.' : 'JPG, PNG, or WebP up to 4MB.'}
            </p>

            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => onPickAvatar(event.target.files?.[0])}
            />
          </div>
        </div>

        <FormField label={t('auth.nameLabel')} error={errors.name?.message} required>
          <Input invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>

        <FormField
          label={t('auth.emailLabel')}
          error={errors.email?.message}
          hint={isAr ? 'تغيير البريد الإلكتروني قد يتطلب إعادة التحقق.' : 'Changing your email may require re-verification.'}
          required
        >
          <Input type="email" invalid={Boolean(errors.email)} {...register('email')} />
        </FormField>

        <FormField label={isAr ? 'المسمى الوظيفي / التخصص' : 'Headline / Professional Title'} error={errors.headline?.message}>
          <Input placeholder={isAr ? 'مثال: مهندس برمجيات ومطور واجهات' : 'e.g. Senior Full-Stack Engineer'} {...register('headline')} />
        </FormField>

        <FormField label={isAr ? 'نبذة تعريفية قصيرة' : 'Biography'} error={errors.bio?.message}>
          <Textarea rows={3} placeholder={isAr ? 'اكتب نبذة مختصرة عن خبراتك ومجالات اهتمامك...' : 'Tell the community about your background, skills, and goals...'} {...register('bio')} />
        </FormField>

        <FormField label={isAr ? 'الموقع الشخصي / رابط Portfolio' : 'Website / Portfolio URL'} error={errors.website?.message}>
          <Input type="url" placeholder="https://example.com" {...register('website')} />
        </FormField>
      </div>

      <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-surface-muted/30">
        <Button size="sm" type="submit" loading={update.isPending} disabled={!isDirty && !avatar}>
          {isAr ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

function PasswordCard() {
  const changePassword = useChangePassword()
  const { isAr } = useTranslation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormInput, unknown, PasswordForm>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  return (
    <form
      className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-xs flex flex-col"
      onSubmit={handleSubmit((values) =>
        changePassword.mutate(values, { onSuccess: () => reset() }),
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-secondary-light text-secondary flex items-center justify-center border border-secondary/20">
            <IconLock size={16} />
          </div>
          <h2 className="text-sm sm:text-base font-black text-text-main m-0">
            {isAr ? 'الأمان وكلمة المرور' : 'Security & Password'}
          </h2>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <FormField label={isAr ? 'كلمة المرور الحالية' : 'Current Password'} error={errors.current_password?.message} required>
          <Input
            type="password"
            autoComplete="current-password"
            invalid={Boolean(errors.current_password)}
            {...register('current_password')}
          />
        </FormField>

        <FormField label={isAr ? 'كلمة المرور الجديدة' : 'New Password'} error={errors.password?.message} required>
          <Input
            type="password"
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <FormField label={isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} error={errors.password_confirmation?.message} required>
          <Input
            type="password"
            autoComplete="new-password"
            invalid={Boolean(errors.password_confirmation)}
            {...register('password_confirmation')}
          />
        </FormField>

        <div className="p-3.5 rounded-2xl bg-surface-muted/40 border border-border text-xs text-text-muted flex items-start gap-2.5">
          <IconShieldLock size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="m-0 leading-relaxed text-[11px]">
            {isAr
              ? 'تغيير كلمة المرور سيؤدي إلى إنهاء الجلسات المفتوحة على الأجهزة الأخرى لأغراض الأمان.'
              : 'Updating your credentials will invalidate active sessions on other devices for account protection.'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-surface-muted/30">
        <Button size="sm" type="submit" loading={changePassword.isPending}>
          {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
        </Button>
      </div>
    </form>
  )
}

