<?php

declare(strict_types=1);

use App\Domain\Learning\Enums\EnrollmentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('last_lesson_id')->nullable()->constrained('lessons')->nullOnDelete();

            $table->enum('status', EnrollmentStatus::values())->default(EnrollmentStatus::Active->value);
            $table->decimal('progress_percent', 5, 2)->default(0);
            $table->unsignedInteger('completed_lessons_count')->default(0);

            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            // A learner can only hold one enrolment per course.
            $table->unique(['user_id', 'course_id']);
            $table->index(['course_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
