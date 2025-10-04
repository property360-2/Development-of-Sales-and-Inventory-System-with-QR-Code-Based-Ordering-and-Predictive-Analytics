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
Route::post('customers', [CustomerController::class, 'store']); // walk-in/QR register
Route::get('menus', [MenuController::class, 'index']); // read-only for QR ordering

// Login route (public)
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Admin-only routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:Admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('menus', MenuController::class);
        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('audit-logs/{id}', [AuditLogController::class, 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | Cashier + Admin routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:Cashier,Admin')->group(function () {

        // Orders → Full CRUD
        Route::apiResource('orders', OrderController::class);

        // Payments → Only store + update + index + show (NO delete)
        Route::get('payments', [PaymentController::class, 'index']);
        Route::get('payments/{id}', [PaymentController::class, 'show']);
        Route::post('payments', [PaymentController::class, 'store']);
        Route::put('payments/{id}', [PaymentController::class, 'update']);

        // Customers → Only store + update + index + show (NO delete)
        Route::get('customers', [CustomerController::class, 'index']);
        Route::get('customers/{id}', [CustomerController::class, 'show']);
        Route::post('customers', [CustomerController::class, 'store']);
        Route::put('customers/{id}', [CustomerController::class, 'update']);

        // Menus → Cashier can only READ (index/show)
        Route::get('menus', [MenuController::class, 'index']);
        Route::get('menus/{id}', [MenuController::class, 'show']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
});