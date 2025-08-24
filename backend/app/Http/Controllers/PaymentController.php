<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Display a listing of all payments with related order.
     */
    public function index()
    {
        $payments = Payment::with('order')->get();
        return response()->json($payments);
    }

    /**
     * Store a newly created payment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,order_id',
            'amount_paid' => 'required|numeric',
            'payment_method' => 'required|in:cash,gcash,card',
            'payment_status' => 'required|in:pending,completed,failed',
            'payment_timestamp' => 'nullable|date',
        ]);

        $payment = Payment::create($request->all());
        return response()->json($payment, 201);
    }

    /**
     * Display a specific payment with related order.
     */
    public function show($id)
    {
        $payment = Payment::with('order')->findOrFail($id);
        return response()->json($payment);
    }

    /**
     * Update an existing payment.
     */
    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $request->validate([
            'order_id' => 'sometimes|exists:orders,order_id',
            'amount_paid' => 'sometimes|numeric',
            'payment_method' => 'sometimes|in:cash,gcash,card',
            'payment_status' => 'sometimes|in:pending,completed,failed',
            'payment_timestamp' => 'sometimes|date',
        ]);

        $payment->update($request->all());
        return response()->json($payment);
    }

    /**
     * Remove a payment from the database.
     */
    public function destroy($id)
    {
        Payment::destroy($id);
        return response()->json(null, 204);
    }
}
