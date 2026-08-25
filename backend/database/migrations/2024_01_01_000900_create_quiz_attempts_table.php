<?php

declare(strict_types=1);

use App\Domain\Assessment\Enums\AttemptStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('status', AttemptStatus::values())->default(AttemptStatus::InProgress->value);
            $table->unsignedInteger('attempt_number')->default(1);
            $table->decimal('score', 5, 2)->default(0);
            $table->unsignedInteger('earned_points')->default(0);
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedInteger('correct_count')->default(0);
            $table->unsignedInteger('question_count')->default(0);
            $table->boolean('passed')->default(false);

            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['quiz_id', 'user_id', 'status']);
        });

        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->json('selected_option_ids')->nullable();
            $table->text('text_answer')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('earned_points')->default(0);
            $table->timestamps();

            $table->unique(['quiz_attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('quiz_attempts');
    }
};
