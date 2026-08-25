<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * @extends BaseRepository<Enrollment>
 */
final class EnrollmentRepository extends BaseRepository implements EnrollmentRepositoryInterface
{
    protected function model(): string
    {
        return Enrollment::class;
    }

    public function findFor(User $student, Course $course): ?Enrollment
    {
        return $this->query()
            ->where('user_id', $student->id)
            ->where('course_id', $course->id)
            ->first();
    }

    public function exists(User $student, Course $course): bool
    {
        return $this->query()
            ->where('user_id', $student->id)
            ->where('course_id', $course->id)
            ->exists();
    }

    public function paginateForStudent(User $student, ?EnrollmentStatus $status, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $student->id)
            ->when($status !== null, fn ($q) => $q->where('status', $status->value))
            ->with(['course.instructor:id,name,avatar_path,role', 'course.category:id,name,slug,icon,position,is_active'])
            ->orderByDesc('last_accessed_at')
            ->orderByDesc('enrolled_at')
            ->paginate($this->normalisePerPage($perPage));
    }

    public function paginateForCourse(Course $course, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('course_id', $course->id)
            ->with(['user:id,name,email,avatar_path'])
            ->orderByDesc('enrolled_at')
            ->paginate($this->normalisePerPage($perPage));
    }

    public function countForCourse(Course $course): int
    {
        return $this->query()->where('course_id', $course->id)->count();
    }

    public function countForInstructor(User $instructor): int
    {
        return $this->query()
            ->whereHas('course', fn ($q) => $q->where('instructor_id', $instructor->id))
            ->count();
    }

    public function recentlyActive(User $student, int $limit): Collection
    {
        return $this->query()
            ->where('user_id', $student->id)
            ->where('status', EnrollmentStatus::Active->value)
            ->with([
                'course',
                'course.instructor:id,name,avatar_path,role',
                'course.category:id,name,slug,icon,position,is_active',
                'lastLesson',
            ])
            ->orderByDesc('last_accessed_at')
            ->limit($limit)
            ->get();
    }

    public function dailyCounts(int $days, ?int $instructorId = null): array
    {
        $rows = $this->query()
            ->when($instructorId !== null, fn ($q) => $q->whereHas(
                'course',
                fn ($c) => $c->where('instructor_id', $instructorId)
            ))
            ->where('enrolled_at', '>=', now()->subDays($days)->startOfDay())
            ->select(DB::raw('DATE(enrolled_at) as day'), DB::raw('COUNT(*) as total'))
            ->groupBy('day')
            ->pluck('total', 'day');

        return $this->fillMissingDays($rows->all(), $days);
    }

    /**
     * Charts need a value for every day, not only days that had activity.
     *
     * @param  array<string, int|string>  $counts
     * @return array<string, int>
     */
    private function fillMissingDays(array $counts, int $days): array
    {
        $series = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $day = now()->subDays($i)->toDateString();
            $series[$day] = (int) ($counts[$day] ?? 0);
        }

        return $series;
    }
}
