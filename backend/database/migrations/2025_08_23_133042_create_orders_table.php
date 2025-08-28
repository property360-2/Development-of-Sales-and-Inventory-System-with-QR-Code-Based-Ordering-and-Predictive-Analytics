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
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('handled_by'); // Cashier/Admin
            $table->enum('order_type', ['dine-in', 'take-out'])->index(); // ✅ for filtering
            $table->enum('status', ['pending', 'preparing', 'ready', 'served'])->default('pending')->index(); // ✅ fast lookups
            $table->decimal('total_amount', 10, 2)->index(); // ✅ for reporting/analytics
            $table->timestamp('order_timestamp')->useCurrent()->index(); // ✅ query by date
            $table->timestamp('expiry_timestamp')->nullable();
            $table->enum('order_source', ['QR', 'Counter'])->index(); // ✅ filter by source
            $table->timestamps();

            // Foreign Keys + Indexes
            $table->foreign('customer_id')->references('customer_id')->on('customers')->onDelete('cascade');
            $table->foreign('handled_by')->references('user_id')->on('users')->onDelete('cascade');

            // 🔑 Additional indexes
            $table->index(['customer_id', 'handled_by']); // ✅ optimize joins/queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
