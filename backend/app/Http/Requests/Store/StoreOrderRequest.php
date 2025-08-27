<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        return true; // add role-based logic later
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'order_type' => $this->order_type ? trim(strip_tags($this->order_type)) : null,
            'status' => $this->status ? trim(strip_tags($this->status)) : null,
            'order_source' => $this->order_source ? strtoupper(trim(strip_tags($this->order_source))) : null,
        ]);
    }

    public function rules()
    {
        return [
            'customer_id' => 'required|exists:customers,customer_id',
            'handled_by' => 'nullable|exists:users,user_id',
            'order_type' => 'required|in:dine-in,take-out',
            'status' => 'required|in:pending,preparing,ready,served',
            'total_amount' => 'required|numeric|min:0',
            'order_timestamp' => 'nullable|date_format:Y-m-d\TH:i:s', // ISO8601
            'expiry_timestamp' => 'nullable|date_format:Y-m-d\TH:i:s',
            'order_source' => 'required|in:QR,COUNTER',
        ];
    }

    public function messages()
    {
        return [
            'customer_id.required' => 'Customer is required for this order.',
            'customer_id.exists' => 'Selected customer does not exist.',
            'handled_by.exists' => 'Assigned user does not exist.',
            'order_type.required' => 'Order type is required.',
            'order_type.in' => 'Order type must be either dine-in or take-out.',
            'status.required' => 'Order status is required.',
            'status.in' => 'Invalid order status provided.',
            'total_amount.required' => 'Total amount is required.',
            'total_amount.numeric' => 'Total amount must be a valid number.',
            'total_amount.min' => 'Total amount must be at least 0.',
            'order_timestamp.date_format' => 'Order timestamp must be in ISO8601 format (YYYY-MM-DDTHH:MM:SS).',
            'expiry_timestamp.date_format' => 'Expiry timestamp must be in ISO8601 format (YYYY-MM-DDTHH:MM:SS).',
            'order_source.required' => 'Order source is required (QR or Counter).',
            'order_source.in' => 'Order source must be either QR or Counter.',
        ];
    }
}
