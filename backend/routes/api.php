<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\MenuController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;


// Admin-only routes
Route::middleware(['auth:sanctum', 'role:Admin'])->group(function () {
    Route::apiResource('menus', MenuController::class);
    Route::apiResource('users', UserController::class);
});

// Cashier + Admin routes
Route::middleware(['auth:sanctum', 'role:Cashier,Admin'])->group(function () {
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('payments', PaymentController::class);
});

// Public routes (customers via QR code)
Route::post('customers', [CustomerController::class, 'store']);
Route::get('menus', [MenuController::class, 'index']); // read-only for QR ordering
// Audit logs: read-only
Route::get('audit-logs', [AuditLogController::class, 'index']);
Route::get('audit-logs/{id}', [AuditLogController::class, 'show']);


Route::post('/login', [AuthController::class, 'login']);
