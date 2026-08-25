<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class EnrollmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_learner_can_enrol_in_a_free_published_course(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->published()->free()->create();

        $this->actingAs($student)
            ->postJson("/api/v1/courses/{$course->slug}/enroll")
            ->assertCreated()
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_a_paid_course_requires_payment_first(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->published()->create(['price_cents' => 4999]);

        $this->actingAs($student)
            ->postJson("/api/v1/courses/{$course->slug}/enroll")
            ->assertStatus(402)
            ->assertJsonPath('error.code', 'payment_required');

        $this->assertDatabaseMissing('enrollments', ['course_id' => $course->id]);
    }

    public function test_a_learner_cannot_enrol_twice(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->published()->free()->create();

        $this->actingAs($student)->postJson("/api/v1/courses/{$course->slug}/enroll")->assertCreated();

        $this->actingAs($student)
            ->postJson("/api/v1/courses/{$course->slug}/enroll")
            ->assertStatus(409)
            ->assertJsonPath('error.code', 'already_enrolled');
    }

    public function test_a_draft_course_cannot_be_enrolled_in(): void
    {
        $student = User::factory()->create();
        $course = Course::factory()->free()->create();

        $this->actingAs($student)
            ->postJson("/api/v1/courses/{$course->slug}/enroll")
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'course_not_published');
    }

    public function test_an_instructor_cannot_enrol_in_their_own_course(): void
    {
        $instructor = User::factory()->instructor()->create();
        $course = Course::factory()->published()->free()->for_instructor($instructor)->create();

        $this->actingAs($instructor)
            ->postJson("/api/v1/courses/{$course->slug}/enroll")
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'own_course');
    }

    public function test_enrolling_increments_the_course_student_counter(): void
    {
        $course = Course::factory()->published()->free()->create();

        foreach (User::factory()->count(3)->create() as $student) {
            $this->actingAs($student)->postJson("/api/v1/courses/{$course->slug}/enroll")->assertCreated();
        }

        $this->assertSame(3, $course->refresh()->students_count);
    }
}
