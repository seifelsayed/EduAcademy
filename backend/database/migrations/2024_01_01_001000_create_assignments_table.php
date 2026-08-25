<?php

declare(strict_types=1);

use App\Domain\Assessment\Enums\SubmissionStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('instructions')->nullable();
            $table->json('attachments')->nullable();
            $table->unsignedInteger('max_points')->default(100);
            $table->timestamp('due_at')->nullable();
            $table->boolean('allow_late_submissions')->default(true);
            $table->timestamps();

            $table->unique('lesson_id');
        });

        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->longText('content')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', SubmissionStatus::values())->default(SubmissionStatus::Draft->value);
            $table->unsignedInteger('score')->nullable();
            $table->text('feedback')->nullable();
            $table->boolean('is_late')->default(false);

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->timestamps();

            $table->unique(['assignment_id', 'user_id']);
            $table->index(['assignment_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('assignments');
    }
};
