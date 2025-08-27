<?php

namespace App\Http\Requests\Update;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $data = [];

        if ($this->has('name')) {
            $data['name'] = trim(strip_tags($this->name));
        }

        if ($this->has('description')) {
            $data['description'] = trim(strip_tags($this->description));
        }

        if ($this->has('category')) {
            $data['category'] = trim(strip_tags($this->category));
        }

        if ($this->has('price')) {
            $data['price'] = $this->price;
        }

        if ($this->has('product_details')) {
            $data['product_details'] = trim(strip_tags($this->product_details));
        }

        if ($this->has('availability_status')) {
            // Cast to tinyint (0 or 1) instead of boolean
            $data['availability_status'] = (int) $this->availability_status;
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:100',
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string|max:50',
            'availability_status' => 'sometimes|integer|in:0,1',
            'product_details' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Menu name must be text.',
            'price.numeric' => 'Price must be a valid number.',
            'availability_status.integer' => 'Availability status must be 0 or 1.',
            'availability_status.in' => 'Availability status must be 0 (unavailable) or 1 (available).',
        ];
    }
}
