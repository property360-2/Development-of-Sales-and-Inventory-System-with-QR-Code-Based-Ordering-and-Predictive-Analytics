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
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('name', 100);
            $table->string('username', 50)->unique();
            $table->string('password');
            $table->enum('role', ['Admin', 'Cashier'])->index(); // index for role filters
            $table->string('contact_number', 20)->nullable();
            $table->timestamps();

            // 🔑 Additional indexes
            $table->index('name'); // useful for searching by name
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
