<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StorePaymentRequest;
use App\Http\Requests\Update\UpdatePaymentRequest;

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
     * Display a specific payment with related order.
     */
    public function show($id)
    {
        $payment = Payment::with('order')->findOrFail($id);
        return response()->json($payment);
    }

    public function store(StorePaymentRequest $request)
    {
        $payment = Payment::create($request->validated());
        return response()->json($payment, 201);
    }

    public function update(UpdatePaymentRequest $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->update($request->validated());
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
