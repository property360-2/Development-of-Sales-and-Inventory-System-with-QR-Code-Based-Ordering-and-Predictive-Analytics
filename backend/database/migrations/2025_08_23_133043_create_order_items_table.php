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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id('order_item_id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('menu_id');
            $table->integer('quantity')->index(); // ✅ for reports/filters
            $table->decimal('price', 10, 2)->index(); // ✅ keep track of item price at order time
            $table->timestamps();

            // Foreign Keys
            $table->foreign('order_id')
                ->references('order_id')
                ->on('orders')
                ->onDelete('cascade');

            $table->foreign('menu_id')
                ->references('menu_id')
                ->on('menus')
                ->onDelete('cascade');

            // 🔑 Composite Index (fast lookups per order + item)
            $table->index(['order_id', 'menu_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
