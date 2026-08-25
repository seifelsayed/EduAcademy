import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { CenteredSpinner } from '@/components/atoms/Spinner'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { PublicLayout } from '@/components/templates/PublicLayout'
import { RequireAdmin, RequireAuth, RequireGuest, RequireInstructor } from '@/app/router/guards'

/* Public pages load eagerly — they are the first paint for most visitors. */
import { CourseBrowsePage } from '@/pages/public/CourseBrowsePage'
import { CourseDetailPage } from '@/pages/public/CourseDetailPage'
import { HomePage } from '@/pages/public/HomePage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

/* Everything behind a login is code-split: most visitors never load it. */
const CertificateVerifyPage = lazy(() =>
  import('@/pages/public/CertificateVerifyPage').then((m) => ({ default: m.CertificateVerifyPage })),
)
const DashboardPage = lazy(() =>
  import('@/pages/learner/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const MyLearningPage = lazy(() =>
  import('@/pages/learner/MyLearningPage').then((m) => ({ default: m.MyLearningPage })),
)
const CoursePlayerPage = lazy(() =>
  import('@/pages/learner/CoursePlayerPage').then((m) => ({ default: m.CoursePlayerPage })),
)
const WishlistPage = lazy(() =>
  import('@/pages/learner/WishlistPage').then((m) => ({ default: m.WishlistPage })),
)
const CertificatesPage = lazy(() =>
  import('@/pages/learner/CertificatesPage').then((m) => ({ default: m.CertificatesPage })),
)
const OrdersPage = lazy(() =>
  import('@/pages/learner/OrdersPage').then((m) => ({ default: m.OrdersPage })),
)
const CheckoutPage = lazy(() =>
  import('@/pages/learner/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/learner/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const InstructorDashboardPage = lazy(() =>
  import('@/pages/instructor/InstructorDashboardPage').then((m) => ({
    default: m.InstructorDashboardPage,
  })),
)
const InstructorCoursesPage = lazy(() =>
  import('@/pages/instructor/InstructorCoursesPage').then((m) => ({
    default: m.InstructorCoursesPage,
  })),
)
const CourseEditorPage = lazy(() =>
  import('@/pages/instructor/CourseEditorPage').then((m) => ({ default: m.CourseEditorPage })),
)
const CurriculumEditorPage = lazy(() =>
  import('@/pages/instructor/CurriculumEditorPage').then((m) => ({
    default: m.CurriculumEditorPage,
  })),
)
const CourseStudentsPage = lazy(() =>
  import('@/pages/instructor/CourseStudentsPage').then((m) => ({ default: m.CourseStudentsPage })),
)
const GradingQueuePage = lazy(() =>
  import('@/pages/instructor/GradingQueuePage').then((m) => ({ default: m.GradingQueuePage })),
)
const InstructorEarningsPage = lazy(() =>
  import('@/pages/instructor/InstructorEarningsPage').then((m) => ({
    default: m.InstructorEarningsPage,
  })),
)
const SupportPage = lazy(() =>
  import('@/pages/public/SupportPage').then((m) => ({ default: m.SupportPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })),
)
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
)
const AdminReviewsPage = lazy(() =>
  import('@/pages/admin/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })),
)
const AdminCertificatesPage = lazy(() =>
  import('@/pages/admin/AdminCertificatesPage').then((m) => ({ default: m.AdminCertificatesPage })),
)
const AdminReportsPage = lazy(() =>
  import('@/pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })),
)
const AdminPayoutsPage = lazy(() =>
  import('@/pages/admin/AdminPayoutsPage').then((m) => ({ default: m.AdminPayoutsPage })),
)
const AdminBankApprovalsPage = lazy(() =>
  import('@/pages/admin/AdminBankApprovalsPage').then((m) => ({ default: m.AdminBankApprovalsPage })),
)
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })),
)
const AdminSupportPage = lazy(() =>
  import('@/pages/admin/AdminSupportPage').then((m) => ({ default: m.AdminSupportPage })),
)

export function AppRoutes() {
  return (
    <Suspense fallback={<CenteredSpinner />}>
      <Routes>
        {/* Auth screens sit outside the shell — they have their own layout. */}
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route
          path="/register"
          element={
            <RequireGuest>
              <RegisterPage />
            </RequireGuest>
          }
        />

        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CourseBrowsePage />} />
          <Route path="courses/:slug" element={<CourseDetailPage />} />
          <Route path="certificates/verify" element={<CertificateVerifyPage />} />
          <Route path="certificates/verify/:serial" element={<CertificateVerifyPage />} />

          {/* Learner area */}
          <Route
            path="learn/:slug"
            element={
              <RequireAuth>
                <CoursePlayerPage />
              </RequireAuth>
            }
          />
          <Route
            path="checkout/:reference"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Learning + account. All three signed-in areas share one shell;
            the sidebar filters itself by role. */}
        <Route
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Teaching */}
        <Route
          element={
            <RequireInstructor>
              <DashboardLayout />
            </RequireInstructor>
          }
        >
          <Route path="/teach" element={<InstructorDashboardPage />} />
          <Route path="/teach/courses" element={<InstructorCoursesPage />} />
          <Route path="/teach/courses/new" element={<CourseEditorPage />} />
          <Route path="/teach/courses/:slug" element={<CourseEditorPage />} />
          <Route path="/teach/courses/:slug/curriculum" element={<CurriculumEditorPage />} />
          <Route path="/teach/courses/:slug/students" element={<CourseStudentsPage />} />
          <Route path="/teach/grading" element={<GradingQueuePage />} />
          <Route path="/teach/earnings" element={<InstructorEarningsPage />} />
        </Route>

        {/* Administration */}
        <Route
          element={
            <RequireAdmin>
              <DashboardLayout />
            </RequireAdmin>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/payouts" element={<AdminPayoutsPage />} />
          <Route path="/admin/bank-approvals" element={<AdminBankApprovalsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
        </Route>

        {/* Legacy alias, kept so old links keep working. */}
        <Route path="/instructor/*" element={<Navigate to="/teach" replace />} />
      </Routes>
    </Suspense>
  )
}
