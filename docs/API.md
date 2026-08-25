# API reference

Base URL: `/api/v1`

Authentication is a Sanctum bearer token:

```
Authorization: Bearer <token>
```

Every response is JSON. The `ForceJsonResponse` middleware sets `Accept` for
you, so clients never need to send it.

---

## Response envelope

**Success**

```json
{
  "data": { },
  "message": "Course published.",
  "meta": { }
}
```

**Paginated**

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 7,
    "per_page": 15,
    "total": 98,
    "from": 1,
    "to": 15
  }
}
```

Some endpoints add their own keys to `meta` alongside the pagination fields —
`rating_breakdown` on course detail, `statistics` on the admin user list,
`total_revenue_cents` on admin orders.

**Failure**

```json
{
  "message": "You are already enrolled in this course.",
  "error": { "code": "already_enrolled" },
  "errors": { "email": ["The email field is required."] }
}
```

`error.code` is stable and machine-readable; `errors` appears only on validation
failures. `error` may carry extra context — `price_cents` on `payment_required`,
`problems` on `course_not_publishable`, `required_percent` on
`certificate_not_earned`.

### Error codes

| Code | Status | Meaning |
| --- | --- | --- |
| `validation_failed` | 422 | Field validation failed; see `errors` |
| `invalid_credentials` | 401 | Email or password is wrong |
| `unauthenticated` | 401 | Missing or expired token |
| `account_inactive` | 403 | Account suspended or pending |
| `forbidden` | 403 | Policy denied the action |
| `not_found` | 404 | Resource does not exist |
| `email_taken` | 409 | Email already registered |
| `already_enrolled` | 409 | Learner already holds an enrolment |
| `payment_required` | 402 | Paid course needs a settled order first |
| `course_not_published` | 403 | Course is not open for enrolment |
| `own_course` | 403 | Instructors cannot enrol in their own course |
| `not_enrolled` | 403 | Action needs an active enrolment |
| `course_not_publishable` | 422 | Readiness checklist failed; see `problems` |
| `course_has_students` | 409 | Delete blocked — archive instead |
| `no_attempts_remaining` | 403 | Quiz attempt cap reached |
| `attempt_already_submitted` | 409 | Attempt is final |
| `submission_locked` | 409 | Assignment already submitted |
| `submission_closed` | 403 | Past the deadline, late work not accepted |
| `insufficient_progress` | 403 | Not far enough through to review |
| `certificate_not_earned` | 403 | Below the certificate threshold |
| `category_in_use` | 409 | Category still holds courses |
| `rate_limited` | 429 | Throttled |
| `schema_mismatch` | — | Client-side: response did not match its schema |

### Rate limits

| Bucket | Limit |
| --- | --- |
| `auth` (login, register) | 5/min per email+IP, 20/min per IP |
| `api` (default) | 120/min per user or IP |
| `uploads` | 30/min per user |

---

## Public

| Method | Endpoint | Notes |
| --- | --- | --- |
| `POST` | `/auth/register` | `name`, `email`, `password`, `password_confirmation`, optional `role` (`student` \| `instructor`) |
| `POST` | `/auth/login` | Returns `{ user, token }` |
| `GET` | `/categories` | `?with_counts=1` adds published course counts |
| `GET` | `/categories/{slug}` | |
| `GET` | `/courses` | Filters below |
| `GET` | `/courses/featured` | Top 8 |
| `GET` | `/courses/{slug}` | Detail + curriculum; `meta` carries `related` and `rating_breakdown` |
| `GET` | `/courses/{slug}/reviews` | `?rating=`, `?page=` |
| `GET` | `/certificates/verify/{serial}` | Public verification |

**Course filters:** `search`, `category_id`, `level`
(`beginner`/`intermediate`/`advanced`/`all_levels`), `free`, `min_rating`,
`sort` (`newest`, `oldest`, `popular`, `rating`, `price_asc`, `price_desc`,
`title`), `page`, `per_page`.

---

## Authenticated

All of the following need `Authorization` and an active account.

### Account

| Method | Endpoint | Notes |
| --- | --- | --- |
| `GET` | `/auth/me` | Session bootstrap |
| `POST` | `/auth/logout` | `all_devices` to revoke every token |
| `PATCH` | `/profile` | JSON, or multipart with `avatar` + `_method=PATCH` |
| `POST` | `/profile/password` | Revokes all other tokens |

### Learning

| Method | Endpoint | Notes |
| --- | --- | --- |
| `GET` | `/dashboard/student` | |
| `GET` | `/my/enrollments` | `?status=active\|completed` |
| `GET` | `/my/wishlist` | |
| `GET` | `/my/certificates` | |
| `GET` | `/my/orders` | |
| `POST` | `/courses/{slug}/enroll` | 402 when the course is paid and unsettled |
| `GET` | `/courses/{slug}/enrollment` | 404 when not enrolled |
| `GET` | `/courses/{slug}/player` | `?lesson={slug}`; curriculum + progress + navigation |
| `POST` | `/courses/{slug}/wishlist` | Toggles |
| `POST` | `/courses/{slug}/certificate` | Issues once; idempotent afterwards |
| `GET` | `/lessons/{id}` | |
| `POST` | `/lessons/{id}/progress` | `watched_seconds`, `position_seconds` |
| `POST` | `/lessons/{id}/complete` | `undo` to reverse |

### Assessment — learner

| Method | Endpoint | Notes |
| --- | --- | --- |
| `POST` | `/quizzes/{id}/attempts` | Starts or resumes; answers are stripped |
| `GET` | `/quizzes/{id}/attempts` | History; `meta` has attempt allowance and best score |
| `GET` | `/attempts/{id}` | |
| `POST` | `/attempts/{id}/submit` | `answers[]` of `{ question_id, option_ids?, text? }` |
| `GET` | `/assignments/{id}` | Includes the caller's own submission |
| `POST` | `/assignments/{id}/submissions` | `content`, `as_draft` |
| `GET` | `/submissions/{id}` | Author or course instructor |

### Reviews and billing

| Method | Endpoint | Notes |
| --- | --- | --- |
| `POST` | `/courses/{slug}/reviews` | Needs ≥10% progress |
| `DELETE` | `/reviews/{id}` | |
| `POST` | `/reviews/{id}/reply` | Course instructor only |
| `GET` | `/courses/{slug}/quote` | Price breakdown |
| `POST` | `/courses/{slug}/orders` | Creates a pending order |
| `GET` | `/orders/{reference}` | |
| `POST` | `/orders/{reference}/confirm` | Settles and enrols; idempotent |

---

## Instructor

Requires the `instructor` or `admin` role; course-scoped actions also require
ownership.

| Method | Endpoint |
| --- | --- |
| `GET` | `/dashboard/instructor?days=30` |
| `GET` | `/instructor/courses` |
| `GET` | `/instructor/submissions/pending` |
| `POST` | `/courses` |
| `PATCH` \| `POST` | `/courses/{slug}` — `POST` for multipart uploads |
| `DELETE` | `/courses/{slug}` |
| `GET` | `/courses/{slug}/readiness` |
| `POST` | `/courses/{slug}/publish` \| `/unpublish` \| `/archive` |
| `GET` | `/courses/{slug}/students` |
| `GET` | `/courses/{slug}/assignments` |
| `GET` \| `POST` | `/courses/{slug}/sections` |
| `POST` | `/courses/{slug}/sections/reorder` — `{ ids: [] }` |
| `PATCH` \| `DELETE` | `/sections/{id}` |
| `POST` | `/sections/{id}/lessons` |
| `POST` | `/sections/{id}/lessons/reorder` |
| `PATCH` \| `DELETE` | `/lessons/{id}` |
| `PUT` | `/lessons/{id}/quiz` — creates or updates |
| `GET` \| `DELETE` | `/quizzes/{id}` |
| `POST` | `/quizzes/{id}/questions` |
| `PATCH` \| `DELETE` | `/questions/{id}` |
| `PUT` | `/lessons/{id}/assignment` |
| `DELETE` | `/assignments/{id}` |
| `GET` | `/assignments/{id}/submissions` |
| `POST` | `/submissions/{id}/grade` — `{ score, feedback? }` |
| `POST` | `/submissions/{id}/return` — `{ feedback }` |

---

## Admin

| Method | Endpoint |
| --- | --- |
| `GET` | `/dashboard/admin?days=30` |
| `GET` | `/admin/users` — `?search=`, `?role=`, `?status=` |
| `GET` \| `PATCH` \| `DELETE` | `/admin/users/{id}` |
| `POST` | `/admin/categories` |
| `PATCH` \| `DELETE` | `/admin/categories/{id}` |
| `GET` | `/admin/orders` — `?status=` |
| `POST` | `/admin/orders/{reference}/refund` |

Admins cannot change their own role or status, or delete their own account —
those return `self_demotion` and `self_delete`.

---

## Domain rules worth knowing

- **Money** is integer minor units (`*_cents`) everywhere. Never a float.
- **Publishing** requires a description, thumbnail, category, at least one
  outcome, one section and one published lesson. `GET /readiness` returns the
  outstanding items.
- **Video lessons** auto-complete at 95% watched. Watch time only moves forward,
  so re-scrubbing cannot reduce it.
- **Quiz grading**: multiple-choice needs the exact correct set — no partial
  credit. Short answers are matched case- and whitespace-insensitively, with
  alternatives separated by `|`. Passing a quiz completes its lesson.
- **Grading an assignment** completes its lesson too.
- **Enrolment progress** can regress if an instructor adds lessons; a completed
  enrolment reverts to active when that happens.
- **Certificates** snapshot the recipient, course and instructor names at issue
  time, so a later rename cannot alter an issued certificate.
- **Refunding** an order cancels the enrolment.
- **Deleting a course** with enrolled students is blocked; archive instead.
