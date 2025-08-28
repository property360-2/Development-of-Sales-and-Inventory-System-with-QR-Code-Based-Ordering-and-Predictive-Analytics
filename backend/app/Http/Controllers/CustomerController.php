<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StoreCustomerRequest;
use App\Http\Requests\Update\UpdateCustomerRequest;

class CustomerController extends Controller
{
    /**
     * Display all customers
     */
    public function index(Request $request)
    {
        // default 20, pero pwede i-set sa query param
        $perPage = $request->input('per_page', 20);

        $customers = Customer::select('customer_id', 'customer_name', 'table_number', 'order_reference')
            ->paginate($perPage);

        // Log "view all" action
        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed all Customers (per_page=' . $perPage . ')',
            'timestamp' => now(),
        ]);

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
            abort(403, 'Unauthorized'); // don’t log anything if no user
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed Customer: ' . $customer->customer_id,
            'timestamp' => now(),
        ]);


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
