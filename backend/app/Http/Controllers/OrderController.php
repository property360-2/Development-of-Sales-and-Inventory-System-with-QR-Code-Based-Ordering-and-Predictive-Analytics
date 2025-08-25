<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
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
        return response()->json($orders);
    }
    public function store(StoreOrderRequest $request)
    {
        $order = Order::create($request->validated());
        return response()->json($order, 201);
    }

    public function update(UpdateOrderRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->validated());
        return response()->json($order);
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
     * Remove an order from the database.
     */
    public function destroy($id)
    {
        Order::destroy($id);
        return response()->json(null, 204);
    }
}
