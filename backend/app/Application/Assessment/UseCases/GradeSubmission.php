<?php

declare(strict_types=1);

namespace App\Application\Assessment\UseCases;

use App\Application\Learning\UseCases\TrackLessonProgress;
use App\Domain\Assessment\Contracts\SubmissionRepositoryInterface;
use App\Domain\Assessment\Enums\SubmissionStatus;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Shared\Contracts\TransactionManager;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Submission;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class GradeSubmission
{
    public function __construct(
        private SubmissionRepositoryInterface $submissions,
        private EnrollmentRepositoryInterface $enrollments,
        private TrackLessonProgress $progress,
        private TransactionManager $transaction,
    ) {}

    public function execute(User $grader, Submission $submission, int $score, ?string $feedback = null): Submission
    {
        $assignment = $submission->assignment;

        if ($score < 0 || $score > $assignment->max_points) {
            throw new BusinessRuleViolation(
                "The score must be between 0 and {$assignment->max_points}.",
                'score_out_of_range',
                422,
                ['field' => 'score', 'max_points' => $assignment->max_points],
            );
        }

        if (! $submission->status->isGradable()) {
            throw BusinessRuleViolation::conflict(
                'Only submitted work can be graded.',
                'submission_not_gradable',
                ['status' => $submission->status->value],
            );
        }

        return $this->transaction->run(function () use ($grader, $submission, $assignment, $score, $feedback): Submission {
            $graded = $this->submissions->update($submission, [
                'status' => SubmissionStatus::Graded->value,
                'score' => $score,
                'feedback' => $feedback,
                'graded_by' => $grader->id,
                'graded_at' => now(),
            ]);

            // Grading closes the loop: the lesson counts as done for the learner.
            $enrollment = $this->enrollments->findFor($graded->user, $assignment->lesson->course);

            if ($enrollment !== null && $enrollment->grantsAccess()) {
                $this->progress->complete($enrollment, $assignment->lesson);
            }

            return $graded->load(['user', 'grader']);
        });
    }

    /**
     * Sends the work back for another pass instead of scoring it.
     */
    public function returnForRevision(User $grader, Submission $submission, string $feedback): Submission
    {
        if (! $submission->status->isGradable()) {
            throw BusinessRuleViolation::conflict(
                'Only submitted work can be returned.',
                'submission_not_gradable',
                ['status' => $submission->status->value],
            );
        }

        return $this->submissions->update($submission, [
            'status' => SubmissionStatus::ReturnedForRevision->value,
            'feedback' => $feedback,
            'graded_by' => $grader->id,
            'graded_at' => now(),
        ]);
    }
}
