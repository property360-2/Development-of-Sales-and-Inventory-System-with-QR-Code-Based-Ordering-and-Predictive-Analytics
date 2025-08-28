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
        Schema::create('customers', function (Blueprint $table) {
            $table->id('customer_id');
            $table->string('customer_name', 100)->nullable();
            $table->string('table_number', 20)->index(); // ✅ often used to locate customers/orders
            $table->string('order_reference', 50)->unique(); // ✅ unique receipt code
            $table->timestamps();

            // 🔑 Additional indexes
            $table->index('customer_name'); // ✅ useful if searching by name
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
