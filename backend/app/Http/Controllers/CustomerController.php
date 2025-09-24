<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StoreCustomerRequest;
use App\Http\Requests\Update\UpdateCustomerRequest;

class CustomerController extends Controller
{
    /**
     * Display all customers (no pagination)
     */
    public function index(Request $request)
    {
        $customers = Customer::select('customer_id', 'customer_name', 'table_number', 'order_reference')
            ->get(); // fetch all customers at once

        // Log "view all" action (optional)
        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        // AuditLog::create([
        //     'user_id' => $userId,
        //     'action' => 'Viewed all Customers',
        //     'timestamp' => now(),
        // ]);

        return response()->json($customers);
    }

    /**
     * Store a new customer
     */
    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        return response()->json($customer, 201);
    }

    /**
     * Show specific customer
     */
    public function show($id)
    {
        $customer = Customer::findOrFail($id);

        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        // AuditLog::create([
        //     'user_id' => $userId,
        //     'action' => 'Viewed Customer: ' . $customer->customer_id,
        //     'timestamp' => now(),
        // ]);

        return response()->json($customer);
    }

    /**
     * Update existing customer
     */
    public function update(UpdateCustomerRequest $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->update($request->validated());
        return response()->json($customer);
    }

    /**
     * Delete a customer
     */
    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();
        return response()->json(null, 204);
    }
}
