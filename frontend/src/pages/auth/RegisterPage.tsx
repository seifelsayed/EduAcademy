import { zodResolver } from '@hookform/resolvers/zod'
import { IconChalkboard, IconSchool } from '@tabler/icons-react'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs'
import { FormField } from '@/components/molecules/FormField'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { isApiError } from '@/core/domain/errors/ApiError'
import { registerFormSchema, type RegisterForm, type RegisterFormInput } from '@/core/domain/schemas/forms'
import { useRegister } from '@/features/auth/hooks'
import { useTranslation } from '@/shared/lib/i18n'

export function RegisterPage() {
  const registerUser = useRegister()
  const { t, isAr } = useTranslation()

  const roles = [
    {
      value: 'student' as const,
      label: isAr ? 'أنا طالب أود التعلّم' : 'I am a Student',
      description: isAr ? 'اشترك في الكورسات، اجتز الاختبارات، واكسب شهادات معتمدة.' : 'Enroll in courses, take quizzes, and earn certificates.',
      icon: <IconSchool size={22} />,
    },
    {
      value: 'instructor' as const,
      label: isAr ? 'أنا مدرّب أود التدريس' : 'I am an Instructor',
      description: isAr ? 'أنشئ مناهجك، انشر دوراتك، وتابع طلابك وأرباحك.' : 'Create curricula, publish courses, and teach students.',
      icon: <IconChalkboard size={22} />,
    },
  ]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterForm>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'student',
    },
  })

  const role = watch('role')

  const serverError =
    registerUser.error && isApiError(registerUser.error) && !registerUser.error.isValidationError
      ? registerUser.error.message
      : null

  return (
    <AuthLayout
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            {t('navigation.login')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((values) => registerUser.mutate(values))} noValidate className="flex flex-col">
        {serverError ? (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-4" role="alert">
            {serverError}
          </div>
        ) : null}

        <div className="mb-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            {isAr ? 'ما هو هدفك الأساسي في المنصة؟' : 'What is your primary goal?'}
          </span>

          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account Type">
            {roles.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={role === option.value}
                className={clsx(
                  'p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col',
                  role === option.value
                    ? 'border-primary bg-primary-light text-primary shadow-xs ring-2 ring-primary/20'
                    : 'border-border bg-surface hover:bg-surface-hover',
                )}
                onClick={() => setValue('role', option.value)}
              >
                <div className="mb-2 text-primary">{option.icon}</div>
                <div className="font-bold text-xs sm:text-sm text-text-main mb-1">{option.label}</div>
                <div className="text-[11px] text-text-muted leading-relaxed">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <FormField label={t('auth.nameLabel')} error={errors.name?.message} required>
          <Input
            autoComplete="name"
            placeholder={t('auth.namePlaceholder')}
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </FormField>

        <FormField label={t('auth.emailLabel')} error={errors.email?.message} required>
          <Input
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField
          label={t('auth.passwordLabel')}
          error={errors.password?.message}
          hint={isAr ? '8 أحرف على الأقل، تتضمن حروفاً وأرقاماً.' : 'At least 8 characters, including letters & numbers.'}
          required
        >
          <Input
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <FormField label={t('auth.confirmPasswordLabel')} error={errors.password_confirmation?.message} required>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
            invalid={Boolean(errors.password_confirmation)}
            {...register('password_confirmation')}
          />
        </FormField>

        <Button type="submit" fullWidth size="md" loading={registerUser.isPending} className="mt-2">
          {t('auth.signUpBtn')}
        </Button>
      </form>
    </AuthLayout>
  )
}
