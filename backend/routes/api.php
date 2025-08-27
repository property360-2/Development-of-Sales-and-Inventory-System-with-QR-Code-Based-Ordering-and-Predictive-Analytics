<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (QR code customers)
Route::post('customers', [CustomerController::class, 'store']);
Route::get('menus', [MenuController::class, 'index']); // read-only for QR ordering

// Authenticated routes (all users must be logged in)
Route::middleware('auth:sanctum')->group(function () {

    // Admin-only routes
    Route::middleware('role:Admin')->group(function () {
        Route::apiResource('menus', MenuController::class);
        Route::apiResource('users', UserController::class);
        Route::apiResource('customers', CustomerController::class);
    });

    // Cashier + Admin routes
    Route::middleware('role:Cashier,Admin')->group(function () {
        Route::apiResource('orders', OrderController::class);
        Route::apiResource('payments', PaymentController::class);
    });

    // Audit log routes (read-only)
    Route::get('audit-logs', [AuditLogController::class, 'index']);
    Route::get('audit-logs/{id}', [AuditLogController::class, 'show']);
});

// Login route (public)
Route::post('/login', [AuthController::class, 'login']);
