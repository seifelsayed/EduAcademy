<?php

declare(strict_types=1);

namespace App\Application\Engagement\UseCases;

use App\Domain\Engagement\Contracts\CertificateRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Certificate;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use Illuminate\Support\Str;

final readonly class IssueCertificate
{
    public function __construct(
        private CertificateRepositoryInterface $certificates,
    ) {}

    /**
     * Certificates are issued once per enrolment and are immutable afterwards,
     * so the serial stays a stable public reference.
     */
    public function execute(Enrollment $enrollment): Certificate
    {
        $existing = $this->certificates->findForEnrollment($enrollment);

        if ($existing !== null) {
            return $existing;
        }

        $threshold = (int) config('platform.certificate_pass_threshold', 70);

        if ($enrollment->progress_percent < $threshold) {
            throw BusinessRuleViolation::forbidden(
                "You need at least {$threshold}% progress to earn a certificate.",
                'certificate_not_earned',
                [
                    'required_percent' => $threshold,
                    'current_percent' => $enrollment->progress_percent,
                ],
            );
        }

        $course = $enrollment->course;

        return $this->certificates->create([
            'enrollment_id' => $enrollment->id,
            'user_id' => $enrollment->user_id,
            'course_id' => $course->id,
            'serial' => $this->generateSerial(),
            'final_score' => $enrollment->progress_percent,
            // Names are snapshotted so a later rename cannot alter an issued
            // certificate.
            'recipient_name' => $enrollment->user->name,
            'course_title' => $course->title,
            'instructor_name' => $course->instructor->name,
            'issued_at' => now(),
        ]);
    }

    public function verify(string $serial): ?Certificate
    {
        return $this->certificates->findBySerial($serial);
    }

    private function generateSerial(): string
    {
        do {
            $serial = sprintf('EDU-%s-%s', now()->format('Y'), Str::upper(Str::random(8)));
        } while ($this->certificates->serialExists($serial));

        return $serial;
    }
}
