<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    /**
     * Display a listing of all order items with related order and menu.
     */
    public function index()
    {
        $orderItems = OrderItem::with(['order', 'menu'])->get();
        return response()->json($orderItems);
    }

    /**
     * Store a newly created order item.
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,order_id',
            'menu_id' => 'required|exists:menus,menu_id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric',
        ]);

        $orderItem = OrderItem::create($request->all());
        return response()->json($orderItem, 201);
    }

    /**
     * Display a specific order item with related order and menu.
     */
    public function show($id)
    {
        $orderItem = OrderItem::with(['order', 'menu'])->findOrFail($id);
        return response()->json($orderItem);
    }

    /**
     * Update an existing order item.
     */
    public function update(Request $request, $id)
    {
        $orderItem = OrderItem::findOrFail($id);

        $request->validate([
            'order_id' => 'sometimes|exists:orders,order_id',
            'menu_id' => 'sometimes|exists:menus,menu_id',
            'quantity' => 'sometimes|integer|min:1',
            'price' => 'sometimes|numeric',
        ]);

        $orderItem->update($request->all());
        return response()->json($orderItem);
    }

    /**
     * Remove an order item from the database.
     */
    public function destroy($id)
    {
        OrderItem::destroy($id);
        return response()->json(null, 204);
    }
}
