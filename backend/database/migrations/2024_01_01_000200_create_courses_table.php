<?php

declare(strict_types=1);

use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->string('subtitle')->nullable();
            $table->longText('description')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('promo_video_url')->nullable();

            $table->enum('level', CourseLevel::values())->default(CourseLevel::AllLevels->value);
            $table->string('language', 32)->default('English');
            $table->enum('status', CourseStatus::values())->default(CourseStatus::Draft->value);

            // Money is stored as integer minor units to avoid float drift.
            $table->unsignedInteger('price_cents')->default(0);
            $table->unsignedInteger('discount_price_cents')->nullable();
            $table->string('currency', 3)->default('USD');

            $table->json('requirements')->nullable();
            $table->json('outcomes')->nullable();
            $table->json('target_audience')->nullable();

            // Denormalised counters kept in sync by CourseRepository::refreshAggregates().
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->unsignedInteger('lessons_count')->default(0);
            $table->unsignedInteger('sections_count')->default(0);
            $table->unsignedInteger('students_count')->default(0);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);

            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
            $table->index(['category_id', 'status']);
            $table->index(['instructor_id', 'status']);
            $table->index(['is_featured', 'status']);
            $table->index('rating_avg');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
