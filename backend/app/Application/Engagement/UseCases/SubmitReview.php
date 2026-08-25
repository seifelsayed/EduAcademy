<?php

declare(strict_types=1);

namespace App\Application\Engagement\UseCases;

use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Engagement\Contracts\ReviewRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Shared\Contracts\TransactionManager;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Review;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class SubmitReview
{
    /**
     * Learners must have made some progress before reviewing, which keeps
     * drive-by ratings out of the catalogue.
     */
    private const MINIMUM_PROGRESS_PERCENT = 10.0;

    public function __construct(
        private ReviewRepositoryInterface $reviews,
        private EnrollmentRepositoryInterface $enrollments,
        private CourseRepositoryInterface $courses,
        private TransactionManager $transaction,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $student, Course $course, array $data): Review
    {
        $enrollment = $this->enrollments->findFor($student, $course);

        if ($enrollment === null) {
            throw BusinessRuleViolation::forbidden(
                'Only enrolled learners can review this course.',
                'not_enrolled',
            );
        }

        if ($enrollment->progress_percent < self::MINIMUM_PROGRESS_PERCENT) {
            throw BusinessRuleViolation::forbidden(
                'Complete a little more of the course before leaving a review.',
                'insufficient_progress',
                ['required_percent' => self::MINIMUM_PROGRESS_PERCENT],
            );
        }

        $rating = (int) $data['rating'];

        if ($rating < 1 || $rating > 5) {
            throw new BusinessRuleViolation(
                'Ratings run from 1 to 5.',
                'invalid_rating',
                422,
                ['field' => 'rating'],
            );
        }

        return $this->transaction->run(function () use ($student, $course, $data, $rating): Review {
            $existing = $this->reviews->findFor($course, $student);

            $attributes = [
                'rating' => $rating,
                'title' => $data['title'] ?? null,
                'comment' => $data['comment'] ?? null,
            ];

            $review = $existing !== null
                ? $this->reviews->update($existing, $attributes)
                : $this->reviews->create([
                    ...$attributes,
                    'course_id' => $course->id,
                    'user_id' => $student->id,
                    'is_approved' => true,
                ]);

            $this->courses->refreshAggregates($course);

            return $review->load('user:id,name,avatar_path');
        });
    }

    public function delete(Review $review): void
    {
        $course = $review->course;

        $this->reviews->delete($review);
        $this->courses->refreshAggregates($course);
    }

    /**
     * The course author's public response to a review.
     */
    public function reply(User $instructor, Review $review, string $body): Review
    {
        if (! $review->course->isOwnedBy($instructor) && ! $instructor->isAdmin()) {
            throw BusinessRuleViolation::forbidden(
                'Only the course instructor can reply to this review.',
                'not_course_owner',
            );
        }

        return $this->reviews->update($review, [
            'instructor_reply' => $body,
            'replied_at' => now(),
        ]);
    }
}
