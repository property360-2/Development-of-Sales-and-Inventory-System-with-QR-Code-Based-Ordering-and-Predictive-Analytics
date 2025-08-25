<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }
    protected function prepareForValidation()
    {
        $this->merge([
            'payment_method' => $this->payment_method ? trim(strip_tags($this->payment_method)) : null,
            'payment_status' => $this->payment_status ? trim(strip_tags($this->payment_status)) : null,
        ]);
    }
    public function rules()
    {
        return [
            'order_id' => 'required|exists:orders,order_id',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,gcash,card',
            'payment_status' => 'required|in:pending,completed,failed',
        ];
    }

    public function messages()
    {
        return [
            'order_id.required' => 'Order ID is required for payment.',
            'order_id.exists' => 'The order does not exist.',
            'amount_paid.required' => 'Amount paid is required.',
            'amount_paid.numeric' => 'Amount paid must be a valid number.',
            'amount_paid.min' => 'Amount paid cannot be negative.',
            'payment_method.required' => 'Payment method is required.',
            'payment_method.in' => 'Payment method must be cash, gcash, or card.',
            'payment_status.required' => 'Payment status is required.',
            'payment_status.in' => 'Payment status must be pending, completed, or failed.',
        ];
    }
}
