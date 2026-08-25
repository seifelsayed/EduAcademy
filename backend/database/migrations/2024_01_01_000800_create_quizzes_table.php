<?php

declare(strict_types=1);

use App\Domain\Assessment\Enums\QuestionType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('time_limit_minutes')->nullable();
            $table->unsignedTinyInteger('passing_score')->default(60);
            // Null means unlimited attempts.
            $table->unsignedTinyInteger('max_attempts')->nullable();
            $table->boolean('shuffle_questions')->default(false);
            $table->boolean('show_correct_answers')->default(true);
            $table->timestamps();

            $table->unique('lesson_id');
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->enum('type', QuestionType::values())->default(QuestionType::SingleChoice->value);
            $table->text('prompt');
            $table->text('explanation')->nullable();
            // Accepted answers for short-answer questions, separated by "|".
            $table->text('answer_key')->nullable();
            $table->unsignedTinyInteger('points')->default(1);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['quiz_id', 'position']);
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->text('text');
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['question_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('quizzes');
    }
};
