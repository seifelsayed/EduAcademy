<?php

declare(strict_types=1);

namespace App\Domain\Engagement\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Certificate;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<Certificate>
 */
interface CertificateRepositoryInterface extends Repository
{
    public function findForEnrollment(Enrollment $enrollment): ?Certificate;

    public function findBySerial(string $serial): ?Certificate;

    public function serialExists(string $serial): bool;

    /**
     * @return Collection<int, Certificate>
     */
    public function forStudent(User $student): Collection;
}
