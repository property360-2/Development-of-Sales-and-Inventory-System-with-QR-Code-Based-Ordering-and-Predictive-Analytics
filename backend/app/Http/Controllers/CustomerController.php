<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of all customers.
     */
    public function index()
    {
        $customers = Customer::all();
        return response()->json($customers);
    }

    /**
     * Store a newly created customer in the database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'nullable|string|max:100',
            'table_number' => 'required|string|max:20',
            'order_reference' => 'required|string|max:50|unique:customers,order_reference',
        ]);

        $customer = Customer::create($request->all());
        return response()->json($customer, 201);
    }

    /**
     * Display a specific customer.
     */
    public function show($id)
    {
        $customer = Customer::findOrFail($id);
        return response()->json($customer);
    }

    /**
     * Update an existing customer.
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'customer_name' => 'sometimes|string|max:100',
            'table_number' => 'sometimes|string|max:20',
            'order_reference' => 'sometimes|string|max:50|unique:customers,order_reference,'.$id.',customer_id',
        ]);

        $customer->update($request->all());
        return response()->json($customer);
    }

    /**
     * Remove a customer from the database.
     */
    public function destroy($id)
    {
        Customer::destroy($id);
        return response()->json(null, 204);
    }
}
