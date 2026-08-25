import type { Course } from '@/core/domain/schemas/catalog'

/**
 * Centrally resolves the course thumbnail URL.
 * Guarantees that CourseCard, CourseDetailPage, and CoursePlayerPage always display the exact same thumbnail.
 */
export function getCourseThumbnail(
  course: Course | { title: string; category?: { name: string; slug?: string } | null; slug: string; thumbnail_url?: string | null },
): string {
  if (course.thumbnail_url && course.thumbnail_url.trim() !== '') {
    return course.thumbnail_url
  }

  const text = `${course.title} ${course.category?.name ?? ''} ${course.category?.slug ?? ''} ${course.slug}`.toLowerCase()

  // 1. Digital Marketing & SEO
  if (text.includes('market') || text.includes('تسويق') || text.includes('ads') || text.includes('seo')) {
    return '/assets/brand/digital-marketing-specialization.webp'
  }

  // 2. Entrepreneurship & Startups
  if (text.includes('entrepreneur') || text.includes('startup') || text.includes('ريادة') || text.includes('مشروع')) {
    return '/assets/brand/entrepreneurship-specialization.webp'
  }

  // 3. Business & Project Management
  if (
    text.includes('business') ||
    text.includes('manage') ||
    text.includes('أعمال') ||
    text.includes('إدارة') ||
    text.includes('agile') ||
    text.includes('scrum')
  ) {
    return '/assets/brand/business-specialization.webp'
  }

  // 4. Web & Fullstack Development / React / Node / Laravel
  if (
    text.includes('react') ||
    text.includes('node') ||
    text.includes('fullstack') ||
    text.includes('laravel') ||
    text.includes('ويب') ||
    text.includes('web')
  ) {
    return '/assets/brand/development-specialization.webp'
  }

  // 5. UI/UX Design & Figma
  if (
    text.includes('ui') ||
    text.includes('ux') ||
    text.includes('design') ||
    text.includes('figma') ||
    text.includes('تصميم')
  ) {
    return '/assets/brand/thumb_uiux_design.jpg'
  }

  // 6. AI & Machine Learning / Python Data Science
  if (
    text.includes('ai') ||
    text.includes('machine') ||
    text.includes('python') ||
    text.includes('data') ||
    text.includes('intelligence') ||
    text.includes('ذكاء') ||
    text.includes('بيانات')
  ) {
    return '/assets/brand/thumb_ai_data.jpg'
  }

  // 7. Cyber Security & Ethical Hacking
  if (text.includes('cyber') || text.includes('sec') || text.includes('hack') || text.includes('أمن')) {
    return '/assets/brand/thumb_cyber_sec.jpg'
  }

  // 8. Cloud & DevOps / Docker / Kubernetes
  if (
    text.includes('docker') ||
    text.includes('kubernetes') ||
    text.includes('devops') ||
    text.includes('cloud') ||
    text.includes('سحاب')
  ) {
    return '/assets/brand/development-specialization.webp'
  }

  // 9. Mobile App Development
  if (text.includes('mobile') || text.includes('flutter') || text.includes('تطبيق')) {
    return '/assets/brand/thumb_mobile_dev.jpg'
  }

  return '/assets/brand/student_learning_3d.jpg'
}
