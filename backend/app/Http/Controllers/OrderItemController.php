<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StoreOrderItemRequest;
use App\Http\Requests\Update\UpdateOrderItemRequest;

class OrderItemController extends Controller
{
    /**
     * Display a listing of all order items with related order and menu.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20); // default 20

        $orderItems = OrderItem::with([
            'order:id,order_id,customer_id,status,total_amount,order_timestamp',
            'menu:id,menu_id,name,price'
        ])
            ->select('order_item_id', 'order_id', 'menu_id', 'quantity', 'price')
            ->paginate($perPage);

        return response()->json($orderItems);
    }



    /**
     * Display a specific order item with related order and menu.
     */
    public function show($id)
    {
        $orderItem = OrderItem::with([
            'order:id,order_id,customer_id,status,total_amount,order_timestamp',
            'menu:id,menu_id,name,price'
        ])
            ->select('order_item_id', 'order_id', 'menu_id', 'quantity', 'price')
            ->findOrFail($id);

        return response()->json($orderItem);
    }

    public function store(StoreOrderItemRequest $request)
    {
        $item = OrderItem::create($request->validated());
        return response()->json($item, 201);
    }

    public function update(UpdateOrderItemRequest $request, $id)
    {
        $item = OrderItem::findOrFail($id);
        $item->update($request->validated());
        return response()->json($item);
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
