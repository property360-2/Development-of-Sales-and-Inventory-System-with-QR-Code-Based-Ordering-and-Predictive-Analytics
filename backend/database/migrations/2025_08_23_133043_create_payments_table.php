<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('order_id');
            $table->decimal('amount_paid', 10, 2)->index(); // ✅ useful for reports & filtering
            $table->enum('payment_method', ['cash', 'gcash', 'card'])->index(); // ✅ mabilis sa filtering
            $table->enum('payment_status', ['pending', 'completed', 'failed'])->default('pending')->index(); // ✅ filtering for pending/failed payments
            $table->timestamp('payment_timestamp')->useCurrent()->index(); // ✅ for timeline-based reports
            $table->timestamps();

            // Foreign Key
            $table->foreign('order_id')
                ->references('order_id')
                ->on('orders')
                ->onDelete('cascade');

            // 🔑 Composite Index (fast queries: payments per order)
            $table->index(['order_id', 'payment_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
