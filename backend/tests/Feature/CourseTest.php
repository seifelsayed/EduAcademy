<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\User\Enums\UserRole;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class CourseTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_instructor_can_create_a_course(): void
    {
        $instructor = User::factory()->create(['role' => UserRole::Instructor]);

        $response = $this->actingAs($instructor)
            ->postJson('/api/v1/courses', [
                'title' => 'Complete Laravel & React Masterclass',
                'subtitle' => 'From beginner to senior full-stack developer',
                'description' => 'A comprehensive deep dive into scalable web apps.',
                'level' => CourseLevel::Intermediate->value,
                'language' => 'Arabic',
                'price' => 49.99,
                'discount_price' => 29.99,
                'requirements' => ['Basic PHP', 'Basic JavaScript'],
                'outcomes' => ['Build production web apps'],
                'target_audience' => ['Web Developers'],
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Complete Laravel & React Masterclass')
            ->assertJsonPath('data.level', CourseLevel::Intermediate->value)
            ->assertJsonPath('data.status', CourseStatus::Draft->value);

        $this->assertDatabaseHas('courses', [
            'instructor_id' => $instructor->id,
            'title' => 'Complete Laravel & React Masterclass',
        ]);
    }

    public function test_an_instructor_can_view_draft_course(): void
    {
        $instructor = User::factory()->create(['role' => UserRole::Instructor]);
        $course = Course::factory()->create([
            'instructor_id' => $instructor->id,
            'status' => CourseStatus::Draft,
            'title' => 'Draft Course For Instructor',
        ]);

        $this->actingAs($instructor)
            ->getJson("/api/v1/courses/{$course->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $course->id)
            ->assertJsonPath('data.title', 'Draft Course For Instructor');
    }


    public function test_instructor_dashboard_endpoint(): void
    {
        $instructor = User::factory()->create(['role' => UserRole::Instructor]);
        Course::factory()->create([
            'instructor_id' => $instructor->id,
            'students_count' => 15,
            'status' => CourseStatus::Published,
        ]);

        $this->actingAs($instructor)
            ->getJson('/api/v1/dashboard/instructor?days=30')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'stats',
                    'charts',
                    'top_courses',
                    'recent_reviews',
                ],
            ]);
    }
}
