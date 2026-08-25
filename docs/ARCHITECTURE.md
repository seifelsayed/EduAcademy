# Architecture

Both halves of this project follow the same idea: business rules sit in the
middle and know nothing about the outside world; frameworks, HTTP and databases
sit at the edges and depend inwards.

```
        ┌──────────────────────────────────────────┐
        │  Presentation   controllers, components  │
        │      ↓ depends on                        │
        │  Application    use-cases, DTOs          │
        │      ↓ depends on                        │
        │  Domain         entities, rules, ports   │
        │      ↑ implemented by                    │
        │  Infrastructure Eloquent, axios, storage │
        └──────────────────────────────────────────┘
```

The one rule that matters: **Domain imports nothing from the layers around it.**
Everything else follows from that.

---

## Backend — `backend/app`

```
Domain/                     Business rules. No HTTP, no Eloquent queries.
  Shared/
    Contracts/              TransactionManager, Repository
    Exceptions/             DomainException, BusinessRuleViolation
    ValueObjects/           Money
  User/       Enums, Contracts
  Catalog/    Enums, Contracts, Criteria (CourseCriteria)
  Learning/   Enums, Contracts, Services (ProgressCalculator)
  Assessment/ Enums, Contracts, Services (QuizGrader)
  Engagement/ Contracts
  Billing/    Enums, Contracts, Services (PricingService)

Application/                Orchestration. One class per use-case.
  Auth/       DTOs + UseCases (RegisterUser, LoginUser, ChangePassword, …)
  Catalog/    CreateCourse, UpdateCourse, PublishCourse, ManageSections, …
  Learning/   EnrollInCourse, TrackLessonProgress, GetCoursePlayer
  Assessment/ ManageQuiz, StartQuizAttempt, SubmitQuizAttempt, GradeSubmission
  Engagement/ SubmitReview, IssueCertificate, ToggleWishlist
  Billing/    CheckoutCourse
  Dashboard/  GetStudentDashboard, GetInstructorDashboard, GetAdminDashboard
  Shared/     SlugGenerator

Infrastructure/             Adapters for the Domain's ports.
  Persistence/Eloquent/Models/         20 Eloquent models
  Persistence/Eloquent/Repositories/   14 repository implementations
  Persistence/DatabaseTransactionManager.php

Presentation/               HTTP boundary.
  Http/Controllers/Api/V1/  Thin — parse, delegate, respond
  Http/Requests/            Validation
  Http/Resources/           Serialisation
  Http/Responses/           ApiResponse envelope
  Http/Middleware/          ForceJsonResponse, EnsureUserIsActive
  Policies/                 Authorisation
  Exceptions/               ExceptionRenderer
```

### Where the rules actually live

Three domain services hold logic that would otherwise scatter across
controllers, and each is a plain PHP class you can unit-test without a database:

- **`QuizGrader`** — grading for all four question types, weighted points,
  partial-credit rules, short-answer matching.
- **`ProgressCalculator`** — completion percentages, the 95%-watched threshold
  for video auto-completion, completion thresholds.
- **`PricingService`** — effective price, discount percentage, and the
  commission/payout split.

Their tests (`tests/Unit/Domain/`) boot no framework at all.

### The pragmatic trade-off

Repositories return **Eloquent models**, not hand-mapped domain entities.

A textbook Clean Architecture would map every row into a framework-free entity
and back. For a project this size that means roughly 20 extra entity classes and
20 mappers, and every schema change touches four files instead of one.

What is kept, because it is where the value is:

- Use-cases depend on **interfaces** (`CourseRepositoryInterface`), never on a
  concrete repository, and never build a query.
- Business rules live in Domain services and use-cases, not in models or
  controllers.
- Query criteria are expressed as objects (`CourseCriteria`), so "which courses"
  is a domain concept rather than a chain of `where()` calls in a controller.
- Swapping the persistence layer means writing new repositories and rebinding
  them in `RepositoryServiceProvider` — nothing above changes.

What is given up: models are Eloquent, so an aggressive refactor away from
Laravel would touch the Application layer's type hints.

Two smaller leaks, both deliberate and both isolated to a single line:
`Money::defaultCurrency()` and the `fromConfig()` factories read Laravel's
`config()` helper. The alternative — threading currency and thresholds through
every constructor — costs more than it buys.

### Request flow

```
Route → FormRequest (validation + authorize)
      → Controller (thin)
      → UseCase (rules, transactions)
      → Repository interface → Eloquent repository → MySQL
      ← Resource (serialisation)
      ← ApiResponse (envelope)
```

Failures take one path: a use-case throws `BusinessRuleViolation` carrying a
machine-readable code and an HTTP status hint, and `ExceptionRenderer` turns it —
along with validation, auth and framework exceptions — into the same JSON error
shape.

---

## Frontend — `frontend/src`

```
core/                       Framework-agnostic core.
  domain/
    schemas/                Zod schemas — the single source of truth for types
    repositories/           Ports (AuthRepository, CatalogRepository, …)
    errors/                 ApiError
  infrastructure/
    http/httpClient.ts      Axios + auth + error normalisation + validation
    api/                    Repository implementations
    storage/                Token storage

features/                   React glue: one hooks module per domain.
  auth/ catalog/ learning/ assessment/ engagement/ billing/ dashboard/

components/                 Atomic Design. Presentational, no data fetching.
  atoms/       Button, Badge, Avatar, Spinner, Skeleton, ProgressBar, inputs
  molecules/   FormField, StatTile, StarRating, Pagination, Modal, SearchInput
  organisms/   Navbar, CourseCard, CurriculumAccordion, QuizRunner, SparkChart
  templates/   PublicLayout, DashboardLayout, AuthLayout, PageHeader

pages/                      Route screens: compose templates + feature hooks.
  public/ auth/ learner/ instructor/ admin/

stores/                     Zustand: client state only.
app/                        Composition root: providers, router, guards.
shared/                     Config, formatters, query keys.
```

### The state split

This is the decision that keeps the frontend coherent:

- **React Query owns server state.** Anything that lives in the database is
  fetched, cached and invalidated by Query. Cache keys are centralised in
  `shared/lib/queryKeys.ts` so a mutation can invalidate a whole subtree.
- **Zustand owns client state.** Identity (`authStore`), theme and sidebar
  (`uiStore`), toasts (`toastStore`), catalogue filters
  (`catalogFilterStore`). Nothing here is ever fetched.

Mixing the two is what makes auth state drift, so `authStore` deliberately holds
only the user object; refreshing it is Query's job.

### Zod as the type source

Every API response is parsed against a Zod schema in `httpClient` before it
reaches a component, and all TypeScript types are inferred from those schemas.
A backend contract change surfaces as one loud, attributed error
(`schema_mismatch`, naming the endpoint) rather than `undefined is not an
object` three components deep.

The same file also holds the form schemas, so client-side validation mirrors the
server's rules. Because Zod v4 gives `.default()` and `z.coerce` different input
and output types, forms export both (`CourseFormInput` / `CourseForm`) and
`useForm` is parameterised with each.

### Styling: Tabler and Tailwind together

Tabler is Bootstrap-based, and Bootstrap and Tailwind both ship class names like
`p-3` and `gap-4` — on *different* scales. Loading both naively means silent,
order-dependent layout bugs.

The resolution, in `src/styles/index.css`:

1. Tabler's CSS loads first and owns the component layer and the global reset.
2. Tailwind is imported **without Preflight** (theme and utilities only), so
   Bootstrap's Reboot stays the single reset.
3. Tailwind is namespaced behind a `tw:` prefix — `tw:flex tw:gap-4` — which
   makes collisions impossible rather than merely unlikely.

So: reach for Tabler's components (`card`, `btn`, `form-control`, `table`,
`avatar`, `progress`) first, and use `tw:` utilities for layout and spacing that
Tabler does not cover.

### Route protection

Four guards in `app/router/guards.tsx`: `RequireAuth`, `RequireInstructor`,
`RequireAdmin`, `RequireGuest`. Each waits for `isReady` before deciding —
without that, a page reload flashes the login screen at every signed-in user.

Everything behind a login is lazy-loaded, so a first-time visitor downloads the
public pages and nothing else.

---

## Testing

`backend/tests/Unit/Domain/` covers the three domain services with no framework
boot: grading edge cases (partial multiple-choice selections, unanswered
questions, weighted points, short-answer normalisation), progress arithmetic
(zero-lesson courses, over-counting, thresholds), and pricing (invalid
discounts, split rounding).

`backend/tests/Feature/` covers the HTTP contract: registration and role
escalation, credential handling, suspended accounts, and the enrolment rules
(paid gating, double enrolment, draft courses, self-enrolment, counter updates).
