<?php

declare(strict_types=1);

use App\Domain\Billing\Enums\OrderStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();

            $table->enum('status', OrderStatus::values())->default(OrderStatus::Pending->value);

            $table->unsignedInteger('amount_cents');
            $table->unsignedInteger('discount_cents')->default(0);
            $table->unsignedInteger('total_cents');
            $table->unsignedInteger('platform_fee_cents')->default(0);
            $table->unsignedInteger('instructor_payout_cents')->default(0);
            $table->string('currency', 3)->default('USD');

            $table->string('payment_method', 32)->nullable();
            $table->string('payment_reference')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['course_id', 'status']);
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
