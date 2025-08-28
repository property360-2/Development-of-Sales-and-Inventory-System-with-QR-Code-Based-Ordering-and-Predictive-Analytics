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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('user_id');
            $table->string('action', 255)->index(); // ✅ mabilis i-search by action
            $table->timestamp('timestamp')->useCurrent()->index(); // ✅ para sa timeline queries
            $table->timestamps(); // ✅ consistency across tables

            // Foreign Key
            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('cascade');

            // 🔑 Composite Index (useful kung gusto mo tingnan logs ng specific user within date range)
            $table->index(['user_id', 'timestamp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
