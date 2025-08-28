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
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        $orders = Order::with([
            'customer:customer_id,customer_name,table_number,order_reference',
            'user:user_id,name,role',
            'items.menu:menu_id,name,price',
            'payments:payment_id,order_id,amount_paid,payment_method,payment_status'
        ])
            ->select('order_id', 'customer_id', 'handled_by', 'status', 'total_amount', 'order_timestamp', 'order_source')
            ->paginate($perPage);

        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        // Create Audit Log safely
        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed all Orders (per_page=' . $perPage . ')',
            'timestamp' => now(),
        ]);

        return response()->json($orders);
    }

    /**
     * Store a newly created order in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();

        // Ensure timestamps
        $data['order_timestamp'] = $data['order_timestamp'] ?? now();
        $data['expiry_timestamp'] = $data['expiry_timestamp'] ?? null;

        // Normalize enum
        if (!empty($data['order_source'])) {
            $data['order_source'] = strtoupper($data['order_source']);
        }

        $order = Order::create($data);

        // Load relationships
        $order->load(['customer', 'user', 'items', 'payments']);

        return response()->json([
            'message' => 'Order created successfully.',
            'order' => $order
        ], 201);
    }

    /**
     * Display a specific order with related data.
     */
    public function show($id)
    {
        $order = Order::with([
            'customer:customer_id,customer_name,table_number,order_reference',
            'user:user_id,name,role',
            'items.menu:menu_id,name,price',
            'payments:payment_id,order_id,amount_paid,payment_method,payment_status'
        ])
            ->select('order_id', 'customer_id', 'handled_by', 'status', 'total_amount', 'order_timestamp', 'order_source')
            ->findOrFail($id);

        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed Order ID: ' . $order->order_id,
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

        // Audit logging handled in model
        return response()->json($order);
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete(); // triggers model booted() deleted event

        return response()->json(null, 204);
    }
}
