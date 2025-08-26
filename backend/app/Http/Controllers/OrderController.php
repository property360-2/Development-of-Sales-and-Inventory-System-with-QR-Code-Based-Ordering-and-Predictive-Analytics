<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Store\StoreOrderRequest;
use App\Http\Requests\Update\UpdateOrderRequest;

class OrderController extends Controller
{
    /**
     * Display a listing of all orders with related data.
     */
    public function index()
    {
        $orders = Order::with(['customer', 'user', 'items', 'payments'])->get();

        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized'); // don’t log anything if no user
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed all menus',
            'timestamp' => now(),
        ]);

        return response()->json($orders);
    }

    /**
     * Store a newly created order in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $order = Order::create($request->validated());

        // Audit log is already handled in Order model booted() (created event)
        return response()->json($order, 201);
    }

    /**
     * Display a specific order with related data.
     */
    public function show($id)
    {
        $order = Order::with(['customer', 'user', 'items', 'payments'])->findOrFail($id);

        // Log "view" action
        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized'); // don’t log anything if no user
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed all menus',
            'timestamp' => now(),
        ]);

        return response()->json($order);
    }

    /**
     * Update the specified order in storage.
     */
    public function update(UpdateOrderRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->validated());

        // Audit log is already handled in Order model booted() (updated event)
        return response()->json($order);
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete(); // triggers booted() deleted event for audit

        return response()->json(null, 204);
    }
}
