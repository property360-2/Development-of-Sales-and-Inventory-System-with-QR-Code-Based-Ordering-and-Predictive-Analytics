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
            $table->enum('order_type', ['dine-in', 'take-out']);
            $table->enum('status', ['pending', 'preparing', 'ready', 'served'])->default('pending');
            $table->decimal('total_amount', 10, 2);
            $table->timestamp('order_timestamp')->useCurrent();
            $table->timestamp('expiry_timestamp')->nullable();
            $table->enum('order_source', ['QR', 'Counter']);
            $table->timestamps();

            // Foreign Keys
            $table->foreign('customer_id')->references('customer_id')->on('customers')->onDelete('cascade');
            $table->foreign('handled_by')->references('user_id')->on('users')->onDelete('cascade');
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
