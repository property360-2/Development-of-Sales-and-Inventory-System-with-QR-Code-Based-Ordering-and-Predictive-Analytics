<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StorePaymentRequest;
use App\Http\Requests\Update\UpdatePaymentRequest;
// use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    /**
     * Display a listing of all payments with related order.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        $payments = Payment::
        with([
            'order:order_id,customer_id,total_amount,status,order_timestamp'
        ])
            ->select('payment_id', 'order_id', 'amount_paid', 'payment_method', 'payment_status', 'payment_timestamp')
            ->paginate($perPage);

        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        // AuditLog::create([
        //     'user_id' => $userId,
        //     'action' => 'Viewed all Payments',
        //     'timestamp' => now(),
        // ]);

        return response()->json($payments);
    }

    public function show($id)
    {
        $payment = Payment::with([
            'order:order_id,customer_id,total_amount,status,order_timestamp'
        ])
            ->select('payment_id', 'order_id', 'amount_paid', 'payment_method', 'payment_status', 'payment_timestamp')
            ->findOrFail($id);

        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        // AuditLog::create([
        //     'user_id' => $userId,
        //     'action' => 'Viewed Payment ID: ' . $id,
        //     'timestamp' => now(),
        // ]);

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
