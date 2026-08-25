<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();

            // Public verification code, e.g. "EDU-2024-A1B2C3D4".
            $table->string('serial', 32)->unique();
            $table->decimal('final_score', 5, 2)->default(0);
            $table->string('recipient_name');
            $table->string('course_title');
            $table->string('instructor_name');
            $table->timestamp('issued_at')->useCurrent();
            $table->timestamps();

            $table->unique('enrollment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
