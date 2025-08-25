<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'customer_name'   => 'nullable|string|max:100',
            'table_number'    => 'required|string|max:20',
            'order_reference' => 'required|string|max:50|unique:customers,order_reference',
        ];
    }

    public function messages()
    {
        return [
            'customer_name.string'      => 'Customer name must be a valid text.',
            'customer_name.max'         => 'Customer name cannot exceed 100 characters.',
            'table_number.required'     => 'Table number is required (comes from QR).',
            'table_number.max'          => 'Table number cannot exceed 20 characters.',
            'order_reference.required'  => 'Order reference is required.',
            'order_reference.unique'    => 'This order reference is already used.',
            'order_reference.max'       => 'Order reference cannot exceed 50 characters.',
        ];
    }
}
