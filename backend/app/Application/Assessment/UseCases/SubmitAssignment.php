<?php

declare(strict_types=1);

namespace App\Application\Assessment\UseCases;

use App\Domain\Assessment\Contracts\SubmissionRepositoryInterface;
use App\Domain\Assessment\Enums\SubmissionStatus;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use App\Infrastructure\Persistence\Eloquent\Models\Submission;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class SubmitAssignment
{
    public function __construct(
        private SubmissionRepositoryInterface $submissions,
        private EnrollmentRepositoryInterface $enrollments,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $student, Assignment $assignment, array $data, bool $asDraft = false): Submission
    {
        $course = $assignment->lesson->course;
        $enrollment = $this->enrollments->findFor($student, $course);

        if ($enrollment === null || ! $enrollment->grantsAccess()) {
            throw BusinessRuleViolation::forbidden(
                'Enrol in this course to submit the assignment.',
                'not_enrolled',
            );
        }

        $existing = $this->submissions->findFor($assignment, $student);

        if ($existing !== null && ! $existing->status->isEditableByStudent()) {
            throw BusinessRuleViolation::conflict(
                'This assignment has already been submitted.',
                'submission_locked',
                ['status' => $existing->status->value],
            );
        }

        if (! $asDraft && ! $assignment->acceptsSubmissions()) {
            throw BusinessRuleViolation::forbidden(
                'The deadline for this assignment has passed.',
                'submission_closed',
                ['due_at' => $assignment->due_at?->toIso8601String()],
            );
        }

        $attributes = [
            'content' => $data['content'] ?? null,
            'attachments' => $data['attachments'] ?? null,
            'status' => $asDraft ? SubmissionStatus::Draft->value : SubmissionStatus::Submitted->value,
            'submitted_at' => $asDraft ? null : now(),
            'is_late' => ! $asDraft && $assignment->isOverdue(),
        ];

        if ($existing !== null) {
            return $this->submissions->update($existing, $attributes);
        }

        return $this->submissions->create([
            ...$attributes,
            'assignment_id' => $assignment->id,
            'user_id' => $student->id,
        ]);
    }
}
