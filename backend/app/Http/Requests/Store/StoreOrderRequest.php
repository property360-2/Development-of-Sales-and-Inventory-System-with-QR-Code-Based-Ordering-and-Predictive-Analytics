<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // You can add role-based logic here later
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'order_type' => $this->sanitize($this->order_type),
            'status' => $this->sanitize($this->status),
            'order_source' => strtoupper($this->sanitize($this->order_source)),
        ]);
    }

    private function sanitize(?string $value): ?string
    {
        return $value ? trim(strip_tags($value)) : null;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,customer_id',
            'handled_by' => 'nullable|exists:users,user_id',
            'order_type' => 'required|in:dine-in,take-out',
            'status' => 'required|in:pending,preparing,ready,served',
            'total_amount' => 'required|numeric|min:0',
            'order_timestamp' => 'nullable|date_format:Y-m-d\TH:i:s',
            'expiry_timestamp' => 'nullable|date_format:Y-m-d\TH:i:s',
            'order_source' => 'required|in:QR,COUNTER',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,menu_id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ];
    }


    public function messages(): array
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
