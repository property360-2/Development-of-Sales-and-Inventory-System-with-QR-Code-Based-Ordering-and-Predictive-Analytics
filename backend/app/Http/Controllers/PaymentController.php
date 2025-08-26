<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StorePaymentRequest;
use App\Http\Requests\Update\UpdatePaymentRequest;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    /**
     * Display a listing of all payments with related order.
     */
    public function index()
    {
        $payments = Payment::with('order')->get();

        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized'); // don’t log anything if no user
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed all menus',
            'timestamp' => now(),
        ]);


        return response()->json($payments);
    }

    public function show($id)
    {
        $payment = Payment::with('order')->findOrFail($id);

        // Audit log for viewing a specific payment
        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized'); // don’t log anything if no user
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed all menus',
            'timestamp' => now(),
        ]);

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
