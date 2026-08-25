<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('title')->nullable();
            $table->text('comment')->nullable();
            $table->boolean('is_approved')->default(true);
            $table->text('instructor_reply')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();

            // One review per learner per course.
            $table->unique(['course_id', 'user_id']);
            $table->index(['course_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
