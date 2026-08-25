<?php

declare(strict_types=1);

use App\Domain\Catalog\Enums\LessonType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->string('slug');
            $table->enum('type', LessonType::values())->default(LessonType::Video->value);
            $table->longText('content')->nullable();

            $table->string('video_url')->nullable();
            $table->string('video_provider', 32)->nullable();
            $table->unsignedInteger('video_duration_seconds')->nullable();
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->json('attachments')->nullable();

            $table->unsignedInteger('position')->default(0);
            // Preview lessons are watchable without enrolling.
            $table->boolean('is_preview')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->unique(['course_id', 'slug']);
            $table->index(['section_id', 'position']);
            $table->index(['course_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
