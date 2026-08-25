import type {
  Assignment,
  Question,
  Quiz,
  QuizAttempt,
  QuizStart,
  QuizSubmission,
  Submission,
  SubmissionStatus,
} from '@/core/domain/schemas/assessment'
import type {
  Category,
  Course,
  CourseDetail,
  CourseReadiness,
  CourseSort,
  Lesson,
  Section,
} from '@/core/domain/schemas/catalog'
import type { Paginated } from '@/core/domain/schemas/common'
import type {
  AdminDashboard,
  InstructorDashboard,
  StudentDashboard,
} from '@/core/domain/schemas/dashboard'
import type {
  CheckoutQuote,
  Order,
  OrderStatus,
  RatingBreakdown,
  Review,
} from '@/core/domain/schemas/engagement'
import type {
  Certificate,
  CoursePlayer,
  Enrollment,
  EnrollmentStatus,
  LessonProgressResult,
} from '@/core/domain/schemas/learning'
import type { AuthPayload, User, UserRole, UserStatus } from '@/core/domain/schemas/user'

/**
 * Ports. Everything above this line in the dependency graph — use-cases, hooks,
 * components — depends on these interfaces, never on axios or an endpoint URL.
 * Swapping REST for GraphQL means writing new adapters, nothing else.
 */

export interface AuthRepository {
  register(input: {
    name: string
    email: string
    password: string
    password_confirmation: string
    role?: UserRole
  }): Promise<AuthPayload>

  login(input: { email: string; password: string; remember?: boolean }): Promise<AuthPayload>

  logout(allDevices?: boolean): Promise<void>

  me(): Promise<User>

  updateProfile(input: Record<string, unknown>, avatar?: File | null): Promise<User>

  changePassword(input: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<void>
}

export interface CourseFilters {
  search?: string
  category_id?: number
  level?: string
  free?: boolean
  min_rating?: number
  sort?: CourseSort
  status?: string
  page?: number
  per_page?: number
}

export interface CatalogRepository {
  listCourses(filters: CourseFilters): Promise<Paginated<Course>>
  listMyCourses(filters: CourseFilters): Promise<Paginated<Course>>
  featuredCourses(): Promise<Course[]>
  getCourse(slug: string): Promise<{ course: CourseDetail; related: Course[]; ratingBreakdown: RatingBreakdown }>

  createCourse(input: Record<string, unknown>, thumbnail?: File | null): Promise<CourseDetail>
  updateCourse(slug: string, input: Record<string, unknown>, thumbnail?: File | null): Promise<CourseDetail>
  deleteCourse(slug: string): Promise<void>

  readiness(slug: string): Promise<CourseReadiness>
  publishCourse(slug: string): Promise<CourseDetail>
  unpublishCourse(slug: string): Promise<CourseDetail>
  archiveCourse(slug: string): Promise<CourseDetail>

  listCategories(withCounts?: boolean): Promise<Category[]>
  createCategory(input: Record<string, unknown>): Promise<Category>
  updateCategory(id: number, input: Record<string, unknown>): Promise<Category>
  deleteCategory(id: number): Promise<void>
}

export interface CurriculumRepository {
  listSections(slug: string): Promise<Section[]>
  createSection(slug: string, input: Record<string, unknown>): Promise<Section>
  updateSection(id: number, input: Record<string, unknown>): Promise<Section>
  deleteSection(id: number): Promise<void>
  reorderSections(slug: string, ids: number[]): Promise<Section[]>

  getLesson(id: number): Promise<Lesson>
  createLesson(sectionId: number, input: Record<string, unknown>): Promise<Lesson>
  updateLesson(id: number, input: Record<string, unknown>): Promise<Lesson>
  deleteLesson(id: number): Promise<void>
  reorderLessons(sectionId: number, ids: number[]): Promise<Lesson[]>
}

export interface LearningRepository {
  listEnrollments(params: { status?: EnrollmentStatus; page?: number }): Promise<Paginated<Enrollment>>
  getEnrollment(slug: string): Promise<Enrollment>
  enroll(slug: string): Promise<Enrollment>
  getPlayer(slug: string, lessonSlug?: string): Promise<CoursePlayer>

  trackProgress(
    lessonId: number,
    input: { watched_seconds: number; position_seconds: number },
  ): Promise<LessonProgressResult>

  completeLesson(lessonId: number, undo?: boolean): Promise<Enrollment>

  roster(slug: string, page?: number): Promise<Paginated<Enrollment>>

  listCertificates(): Promise<Certificate[]>
  claimCertificate(slug: string): Promise<Certificate>
  verifyCertificate(serial: string): Promise<Certificate>
}

export interface AssessmentRepository {
  getQuiz(id: number): Promise<Quiz>
  saveQuiz(lessonId: number, input: Record<string, unknown>): Promise<Quiz>
  deleteQuiz(id: number): Promise<void>
  addQuestion(quizId: number, input: Record<string, unknown>): Promise<Question>
  updateQuestion(id: number, input: Record<string, unknown>): Promise<Question>
  deleteQuestion(id: number): Promise<void>

  startAttempt(quizId: number): Promise<QuizStart>
  submitAttempt(
    attemptId: number,
    answers: { question_id: number; option_ids?: number[]; text?: string | null }[],
  ): Promise<QuizSubmission>
  getAttempt(id: number): Promise<QuizAttempt>
  attemptHistory(quizId: number): Promise<{ attempts: QuizAttempt[]; extra: Record<string, unknown> }>

  getAssignment(id: number): Promise<Assignment>
  saveAssignment(lessonId: number, input: Record<string, unknown>): Promise<Assignment>
  deleteAssignment(id: number): Promise<void>

  submitAssignment(
    assignmentId: number,
    input: { content?: string; as_draft?: boolean },
  ): Promise<Submission>
  getSubmission(id: number): Promise<Submission>
  listSubmissions(
    assignmentId: number,
    params: { status?: SubmissionStatus; page?: number },
  ): Promise<Paginated<Submission>>
  pendingSubmissions(page?: number): Promise<Paginated<Submission>>
  gradeSubmission(id: number, input: { score: number; feedback?: string }): Promise<Submission>
  returnSubmission(id: number, feedback: string): Promise<Submission>
}

export interface EngagementRepository {
  listReviews(
    slug: string,
    params: { rating?: number; page?: number },
  ): Promise<Paginated<Review>>
  submitReview(slug: string, input: Record<string, unknown>): Promise<Review>
  deleteReview(id: number): Promise<void>
  replyToReview(id: number, body: string): Promise<Review>

  listWishlist(): Promise<Course[]>
  toggleWishlist(slug: string): Promise<{ wishlisted: boolean }>
}

export interface BillingRepository {
  quote(slug: string): Promise<CheckoutQuote>
  createOrder(slug: string, paymentMethod?: string): Promise<Order>
  getOrder(reference: string): Promise<Order>
  confirmOrder(reference: string, paymentReference?: string): Promise<{ order: Order; enrollment: Enrollment }>
  listOrders(page?: number): Promise<Paginated<Order>>

  adminListOrders(params: { status?: OrderStatus; page?: number }): Promise<Paginated<Order>>
  refundOrder(reference: string): Promise<Order>
}

export interface DashboardRepository {
  student(): Promise<StudentDashboard>
  instructor(days?: number): Promise<InstructorDashboard>
  admin(days?: number): Promise<AdminDashboard>
}

export interface AdminRepository {
  listUsers(params: {
    search?: string
    role?: UserRole
    status?: UserStatus
    page?: number
  }): Promise<Paginated<User>>
  getUser(id: number): Promise<User>
  createUser(input: {
    name: string
    email: string
    password: string
    role: UserRole
    status: UserStatus
    headline?: string
    bio?: string
  }): Promise<User>
  updateUser(
    id: number,
    input: {
      name?: string
      email?: string
      password?: string
      role?: UserRole
      status?: UserStatus
      headline?: string
      bio?: string
    },
  ): Promise<User>
  deleteUser(id: number): Promise<void>
}
