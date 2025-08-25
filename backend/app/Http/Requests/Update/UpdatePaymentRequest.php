<?php

namespace App\Http\Requests\Update;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
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
    public function rules(): array
    {
        return [
            'order_id' => 'sometimes|exists:orders,order_id',
            'amount_paid' => 'sometimes|numeric|min:0',
            'payment_method' => 'sometimes|in:cash,gcash,card',
            'payment_status' => 'sometimes|in:pending,completed,failed',
            'payment_timestamp' => 'sometimes|date',
        ];
    }
}
