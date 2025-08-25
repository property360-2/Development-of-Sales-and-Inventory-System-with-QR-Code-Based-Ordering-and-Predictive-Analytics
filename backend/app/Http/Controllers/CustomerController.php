<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StoreCustomerRequest;
use App\Http\Requests\Update\UpdateCustomerRequest;

class CustomerController extends Controller
{
    /**
     * Display all customers
     */
    public function index()
    {
        return response()->json(Customer::all());
    }

    /**
     * Store a new customer
     */
    public function store(StoreCustomerRequest $request)
    {
        // validated() = clean, validated data
        $customer = Customer::create($request->validated());
        return response()->json($customer, 201);
    }

    /**
     * Show specific customer
     */
    public function show($id)
    {
        return response()->json(Customer::findOrFail($id));
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
        Customer::destroy($id);
        return response()->json(null, 204);
    }
}
