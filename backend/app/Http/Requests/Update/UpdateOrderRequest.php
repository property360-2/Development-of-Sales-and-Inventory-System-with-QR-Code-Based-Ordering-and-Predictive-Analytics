<?php

namespace App\Http\Requests\Update;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $data = [];

        if ($this->has('order_type')) {
            $data['order_type'] = trim(strip_tags($this->order_type));
        }

        if ($this->has('status')) {
            $data['status'] = trim(strip_tags($this->status));
        }

        if ($this->has('order_source')) {
            $data['order_source'] = trim(strip_tags($this->order_source));
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'sometimes|exists:customers,customer_id',
            'handled_by' => 'sometimes|exists:users,user_id',
            'order_type' => 'sometimes|in:dine-in,take-out',
            'status' => 'sometimes|in:pending,preparing,ready,served',
            'total_amount' => 'sometimes|numeric|min:0',
            'expiry_timestamp' => 'sometimes|nullable|date',
            'order_source' => 'sometimes|in:QR,Counter',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.exists' => 'Customer must exist in database.',
            'handled_by.exists' => 'Handler must exist in users table.',
            'order_type.in' => 'Order type must be dine-in or take-out.',
            'status.in' => 'Status must be pending, preparing, ready, or served.',
            'total_amount.numeric' => 'Total amount must be a valid number.',
        ];
    }
}
