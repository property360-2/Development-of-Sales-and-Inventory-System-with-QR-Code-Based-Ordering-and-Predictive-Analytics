<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of all orders with related data.
     */
    public function index()
    {
        $orders = Order::with(['customer', 'user', 'items', 'payments'])->get();
        return response()->json($orders);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,customer_id',
            'handled_by' => 'required|exists:users,user_id',
            'order_type' => 'required|in:dine-in,take-out',
            'status' => 'required|in:pending,preparing,ready,served',
            'total_amount' => 'required|numeric',
            'order_timestamp' => 'nullable|date',
            'expiry_timestamp' => 'nullable|date',
            'order_source' => 'required|in:QR,Counter',
        ]);

        $order = Order::create($request->all());
        return response()->json($order, 201);
    }

    /**
     * Display a specific order with related data.
     */
    public function show($id)
    {
        $order = Order::with(['customer', 'user', 'items', 'payments'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Update an existing order.
     */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'customer_id' => 'sometimes|exists:customers,customer_id',
            'handled_by' => 'sometimes|exists:users,user_id',
            'order_type' => 'sometimes|in:dine-in,take-out',
            'status' => 'sometimes|in:pending,preparing,ready,served',
            'total_amount' => 'sometimes|numeric',
            'order_timestamp' => 'sometimes|date',
            'expiry_timestamp' => 'sometimes|date',
            'order_source' => 'sometimes|in:QR,Counter',
        ]);

        $order->update($request->all());
        return response()->json($order);
    }

    /**
     * Remove an order from the database.
     */
    public function destroy($id)
    {
        Order::destroy($id);
        return response()->json(null, 204);
    }
}
