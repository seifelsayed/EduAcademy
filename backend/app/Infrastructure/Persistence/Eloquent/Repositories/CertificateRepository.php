<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Engagement\Contracts\CertificateRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Certificate;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Certificate>
 */
final class CertificateRepository extends BaseRepository implements CertificateRepositoryInterface
{
    protected function model(): string
    {
        return Certificate::class;
    }

    public function findForEnrollment(Enrollment $enrollment): ?Certificate
    {
        return $this->query()->where('enrollment_id', $enrollment->id)->first();
    }

    public function findBySerial(string $serial): ?Certificate
    {
        return $this->query()
            ->with(['course', 'course.instructor:id,name,avatar_path,role', 'user:id,name,avatar_path,role'])
            ->where('serial', $serial)
            ->first();
    }

    public function serialExists(string $serial): bool
    {
        return $this->query()->where('serial', $serial)->exists();
    }

    public function forStudent(User $student): Collection
    {
        return $this->query()
            ->where('user_id', $student->id)
            ->with(['course', 'course.instructor:id,name,avatar_path,role'])
            ->orderByDesc('issued_at')
            ->get();
    }
}
