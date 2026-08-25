import { useUiStore } from '@/stores/uiStore'

/**
 * Exact matches and regex dictionary mapping English validation, toasts, and API error messages to fluent Arabic.
 */
const ERROR_TRANSLATIONS_AR: Record<string, string> = {
  // --- Zod & Forms Validation ---
  'Give the lesson a title.': 'يرجى إدخال عنوان للدرس.',
  'Give the section a title.': 'يرجى إدخال عنوان للقسم/الفصل.',
  'Give the course a descriptive title.': 'يرجى إدخال عنوان وصفي شامل للدورة التدريبية.',
  'Enter your password.': 'يرجى إدخال كلمة المرور.',
  'Enter a valid email address.': 'يرجى إدخال بريد إلكتروني صالح.',
  'Your name is a little short.': 'الاسم قصير جداً (حرفين على الأقل).',
  'Use at least 8 characters.': 'استخدم 8 أحرف على الأقل.',
  'Include at least one letter.': 'يجب أن تحتوي كلمة المرور على حرف واحد على الأقل.',
  'Include at least one number.': 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.',
  'The passwords do not match.': 'كلمتا المرور غير متطابقتين.',
  'Enter your current password.': 'يرجى إدخال كلمة المرور الحالية.',
  'The discounted price cannot exceed the regular price.': 'لا يمكن أن يكون سعر الخصم أكبر من السعر الأساسي للدورة.',
  'Enter a valid URL.': 'يرجى إدخال رابط صالح (URL).',
  'Enter a valid video URL.': 'يرجى إدخال رابط فيديو صالح (YouTube, Vimeo, MP4...).',
  'A video or resource lesson needs a URL.': 'درس الفيديو أو المورد يتطلب إضافة رابط صالح.',
  'An article lesson needs content.': 'درس المقال يتطلب كتابة محتوى الدرس أولاً.',
  'Write the question.': 'يرجى كتابة نص السؤال.',
  'Options cannot be empty.': 'لا يمكن ترك نص الخيار فارغاً.',
  'Provide the accepted answer(s), separated by "|".': 'يرجى كتابة الإجابة المقبولة، أو إجابات بديلة مفصولة بـ "|".',
  'Add at least two options.': 'يرجى إضافة خيارين على الأقل للسؤال.',
  'Mark one option as correct.': 'يرجى تحديد خيار واحد صحيح على الأقل.',
  'This question type allows only one correct option.': 'هذا النوع من الأسئلة يسمح بإجابة صحيحة واحدة فقط.',
  'A true/false question needs exactly two options.': 'سؤال الصواب والخطأ يتطلب خيارين بالضبط.',
  'Write your answer.': 'يرجى كتابة إجابتك أو تسليمك للواجب.',
  'Pick a rating.': 'يرجى اختيار التقييم بالنجوم.',
  'Required': 'هذا الحقل مطلوب.',
  'Invalid email': 'صيغة البريد الإلكتروني غير صحيحة.',
  'String must contain at least 1 character(s)': 'هذا الحقل مطلوب.',

  // --- Network & Server Errors ---
  'Cannot reach the server. Check your connection.': 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
  'Something went wrong.': 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.',
  'The request timed out.': 'استغرق الطلب وقتاً أطول من المتوقع، انتهت المهلة.',
  'Network error.': 'خطأ في الاتصال بالشبكة.',
  'Unexpected error.': 'حدث خطأ غير متوقع.',

  // --- Business Rule & API Exceptions ---
  'These credentials do not match our records.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'An account with that email already exists.': 'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.',
  'Authentication required.': 'يرجى تسجيل الدخول أولاً لإتمام هذا الإجراء.',
  'Only instructors can create courses.': 'حسابات المعلمين فقط هي المصرح لها بإنشاء الكورسات.',
  'A course needs a title.': 'الدورة التدريبية تتطلب عنواناً.',
  'Course not found.': 'لم يتم العثور على الدورة التدريبية المطلوبة.',
  'This action is unauthorized.': 'ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء.',
  'You cannot enrol in your own course.': 'لا يمكنك التسجيل كطالب في كورس أنت من يدرسه.',
  'You are already enrolled in this course.': 'أنت مسجل بالفعل في هذه الدورة التدريبية.',
  'A draft course cannot be enrolled in.': 'لا يمكن التسجيل في كورس ما زال قيد الإعداد (مسودة).',
  'This course requires payment before enrollment.': 'هذه الدورة تتطلب إتمام الدفع قبل التسجيل.',
  'This attempt belongs to someone else.': 'هذه المحاولة تخص مستخدماً آخر.',
  'This order belongs to someone else.': 'هذا الطلب يخص مستخدماً آخر.',
  'You are not enrolled in this course.': 'أنت غير مسجل في هذه الدورة التدريبية.',
  'You cannot delete your own account here.': 'لا يمكنك حذف حسابك الشخصي من هنا.',
  'You cannot delete the last active administrator.': 'لا يمكن حذف المسؤول النشط الوحيد في النظام.',
  'You cannot review your own course.': 'لا يمكنك كتابة تقييم لدورة أنت من يقدمها.',
  'You must be enrolled to review this course.': 'يجب أن تكون مسجلاً في الدورة لتتمكن من تقييمها.',
  'You have already reviewed this course.': 'لقد قمت بتقييم هذه الدورة مسبقاً.',
  'Only the course instructor can reply to this review.': 'مدرس الدورة فقط هو المصرح له بالرد على هذا التقييم.',
  'You have not completed this course yet.': 'لم تكمل جميع متطلبات الدورة بعد.',
  'That lesson does not exist.': 'هذا الدرس غير موجود.',
  'A section with this position already exists.': 'يوجد فصل بهذا الترتيب مسبقاً.',
  'This quiz is not available.': 'هذا الاختبار غير متاح حالياً.',
  'Maximum attempts reached for this quiz.': 'لقد استنفدت الحد الأقصى للمحاولات المسموحة في هذا الاختبار.',
  'Time limit exceeded for this attempt.': 'انتهى الوقت المحدد لهذه المحاولة.',
  'Quiz has already been submitted.': 'تم تسليم هذا الاختبار مسبقاً.',
  'Assignment is closed for submissions.': 'هذا الواجب مغلق ولم يعد يقبل أي تسليمات جديدة.',
  'Cannot grade a draft submission.': 'لا يمكن تقييم مسودة واجب لم يتم تسليمها نهائياً بعد.',
  'Cannot delete a section containing lessons. Delete or move the lessons first.':
    'لا يمكن حذف فصل يحتوي على دروس. يرجى حذف الدروس أو نقلها أولاً.',
  'Your account is suspended.': 'تم تعليق حسابك، يرجى التواصل مع الدعم الفني أو الإدارة.',
  'Registration is currently disabled.': 'التسجيل معطل حالياً من قبل الإدارة.',
  'The current password is incorrect.': 'كلمة المرور الحالية غير صحيحة.',
  'The new password cannot be the same as the current password.':
    'لا يمكن أن تكون كلمة المرور الجديدة مطابقة لكلمة المرور الحالية.',
  'This category still contains active courses.': 'هذا التخصص يحتوي على كورسات نشطة ولا يمكن حذفه.',
  'This course is already published.': 'هذه الدورة منشورة بالفعل.',
  'Course is not ready to publish.': 'الدورة التدريبية غير جاهزة للنشر بعد.',

  // --- Course & Curriculum Toasts & Actions ---
  'Course created.': 'تم إنشاء الدورة بنجاح.',
  'Now add your curriculum.': 'يمكنك الآن بناء الفصول وإضافة الدروس والـ Quizzes.',
  'Course saved.': 'تم حفظ بيانات الدورة بنجاح.',
  'Course deleted.': 'تم حذف الدورة بنجاح.',
  'Course published.': 'تم نشر الدورة بنجاح.',
  'Learners can find it now.': 'أصبحت الدورة متاحة الآن للطلاب في الدليل.',
  'Course moved back to draft.': 'تمت إعادة الدورة إلى مسودة.',
  'Course archived.': 'تمت أرشفة الدورة بنجاح.',
  'Section added.': 'تمت إضافة الفصل بنجاح.',
  'Section deleted.': 'تم حذف الفصل بنجاح.',
  'Lesson added.': 'تمت إضافة الدرس بنجاح.',
  'Lesson saved.': 'تم حفظ الدرس بنجاح.',
  'Lesson deleted.': 'تم حذف الدرس بنجاح.',
  'Lesson complete.': 'تم إكمال الدرس بنجاح.',
  'Category saved successfully.': 'تم حفظ التخصص بنجاح.',
  'Category removed.': 'تم حذف التخصص بنجاح.',

  // --- Learning & Enrollment Toasts ---
  'You are enrolled.': 'تم تسجيلك بنجاح في الدورة.',
  'Jump in whenever you are ready.': 'ابدأ التعلم متى ما كنت مستعداً.',
  'This course needs to be purchased first.': 'هذه الدورة تتطلب إتمام عملية الشراء أولاً.',
  'Certificate issued.': 'تم إصدار الشهادة بنجاح.',
  'Congratulations on finishing the course.': 'تهانينا على إكمال الدورة بنجاح!',
  'Certificate serial copied to clipboard!': 'تم نسخ الرقم التسلسلي للشهادة!',

  // --- Assessments & Submissions Toasts ---
  'Quiz saved.': 'تم حفظ الاختبار بنجاح.',
  'Question added.': 'تمت إضافة السؤال بنجاح.',
  'Question updated.': 'تم تحديث السؤال بنجاح.',
  'Question removed.': 'تم حذف السؤال بنجاح.',
  'Assignment saved.': 'تم حفظ الواجب بنجاح.',
  'Draft saved.': 'تم حفظ المسودة بنجاح.',
  'Assignment submitted.': 'تم تسليم الواجب بنجاح.',
  'Graded.': 'تم تقييم الواجب بنجاح.',
  'Sent back for revision.': 'تمت إعادة الواجب للطالب للتعديل.',

  // --- Engagement, Reviews & Wishlist Toasts ---
  'Thanks for your review.': 'شكراً لمشاركتك تقييمك.',
  'Review removed.': 'تم حذف التقييم بنجاح.',
  'Reply posted.': 'تم نشر الرد بنجاح.',
  'Saved to your wishlist.': 'تمت الإضافة إلى قائمة الرغبات.',
  'Removed from your wishlist.': 'تمت الإزالة من قائمة الرغبات.',

  // --- Billing & Orders Toasts ---
  'Payment confirmed.': 'تم تأكيد الدفع بنجاح.',
  'You are enrolled — enjoy the course.': 'تم تسجيلك في الدورة — نتمنى لك رحلة تعليمية ممتعة!',
  'Order refunded.': 'تم استرجاع الطلب بنجاح.',
  'Order reference copied!': 'تم نسخ رقم الطلب بنجاح!',

  // --- Auth & Account Management Toasts ---
  'Your account is ready.': 'تم إنشاء حسابك بنجاح. أهلاً بك!',
  'Profile updated.': 'تم تحديث بيانات الملف الشخصي بنجاح.',
  'User created successfully.': 'تم إنشاء المستخدم بنجاح.',
  'User updated.': 'تم تحديث بيانات المستخدم بنجاح.',
  'User deleted.': 'تم حذف المستخدم بنجاح.',
  'Password changed.': 'تم تغيير كلمة المرور بنجاح.',
  'Your other devices have been signed out.': 'تم تسجيل الخروج من الأجهزة الأخرى.',

  // --- Publishing Checklist & Readiness ---
  'Add a course description.': 'أضف وصفاً شاملاً للدورة التدريبية.',
  'Upload a course thumbnail.': 'ارفع صورة غلاف (Thumbnail) للدورة.',
  'Choose a category.': 'اختر التخصص / القسم المناسب للكورس.',
  'List at least one learning outcome.': 'أضف مخرجاً تعليمياً واحداً على الأقل (ماذا سيتعلم الطالب).',
  'Add at least one section.': 'أضف فصلاً واحداً على الأقل في المنهج الدراسي.',
  'Add at least one published lesson.': 'أضف درساً واحداً منشوراً على الأقل في المنهج.',
  'This course is not ready to publish yet.': 'هذه الدورة ليست جاهزة للنشر بعد، يرجى استكمال قائمة الجاهزية.',
  'This course is not ready for review yet.': 'هذه الدورة ليست جاهزة للمراجعة بعد.',
  'Validating course completeness…': 'جاري فحص وتدقيق اكتمال متطلبات الكورس...',

  // --- Common UI Fallback Messages ---
  'Could not start checkout.': 'تعذر بدء عملية الدفع والشراء.',
  'Payment could not be confirmed.': 'تعذر تأكيد عملية الدفع.',
  'Could not post your review.': 'تعذر نشر تقييمك للكورس.',
  'Sign in to use your wishlist.': 'يرجى تسجيل الدخول لاستخدام قائمة الرغبات.',
  'Could not enrol you in this course.': 'تعذر تسجيلك في هذه الدورة التدريبية.',
  'This certificate is not available yet.': 'الشهادة غير متاحة بعد، أكمل متطلبات الدورة أولاً.',
  'Could not create the course.': 'تعذر إنشاء الدورة التدريبية، يرجى مراجعة الحقول.',
  'Could not save the course.': 'تعذر حفظ تعديلات الدورة التدريبية.',
  'Could not delete the course.': 'تعذر حذف الدورة التدريبية.',
  'The course is not ready to publish.': 'الدورة التدريبية غير مكتملة وجاهزة للنشر بعد.',
  'Could not update your profile.': 'تعذر تحديث بيانات ملفك الشخصي.',
  'Could not start the quiz.': 'تعذر بدء الاختبار الآن.',
  'Could not submit your answers.': 'تعذر تسليم إجابات الاختبار.',
  'Could not submit your work.': 'تعذر تسليم الواجب العملي.',
  'Could not save the grade.': 'تعذر حفظ تقييم الدرجة والملاحظات.',
  'Could not load this content.': 'تعذر تحميل هذا المحتوى.',
}

function getActiveLang(explicitLang?: string): string {
  if (explicitLang) return explicitLang
  try {
    const storeLang = useUiStore.getState?.()?.language
    if (storeLang) return storeLang
  } catch {
    // fallback
  }
  if (typeof document !== 'undefined') {
    const langAttr = document.documentElement.getAttribute('lang')
    if (langAttr) return langAttr
  }
  return 'ar'
}

/**
 * Localizes any error or toast message string based on the active language (default: Arabic).
 */
export function localizeErrorMessage(message?: string | null, lang?: string): string {
  if (!message || typeof message !== 'string') {
    return ''
  }

  const activeLang = getActiveLang(lang)
  if (activeLang !== 'ar') {
    return message
  }

  const trimmed = message.trim()

  // 1. Direct dictionary match
  if (ERROR_TRANSLATIONS_AR[trimmed]) {
    return ERROR_TRANSLATIONS_AR[trimmed]
  }

  // 2. Pattern matches for common dynamic strings
  if (/^Welcome back,\s*([^.]+)\.?$/i.test(trimmed)) {
    const name = trimmed.match(/^Welcome back,\s*([^.]+)\.?$/i)?.[1] ?? ''
    return `مرحباً بعودتك، ${name}.`
  }

  if (/^String must contain at least (\d+) character\(s\)/i.test(trimmed)) {
    const min = trimmed.match(/\d+/)?.[0] ?? '1'
    return `يجب أن يحتوي هذا الحقل على ${min} أحرف على الأقل.`
  }

  if (/^String must contain at most (\d+) character\(s\)/i.test(trimmed)) {
    const max = trimmed.match(/\d+/)?.[0] ?? '255'
    return `لا يمكن أن يتجاوز هذا الحقل ${max} حرفاً.`
  }

  if (/^The (.*) field is required\.$/i.test(trimmed)) {
    return 'هذا الحقل مطلوب.'
  }

  if (/cannot exceed/i.test(trimmed) && /price/i.test(trimmed)) {
    return 'لا يمكن أن يتجاوز سعر الخصم السعر الأساسي.'
  }

  return message
}

export const localizeMessage = localizeErrorMessage
export const localizeToastMessage = localizeErrorMessage

