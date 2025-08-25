<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    public function authorize()
    {
        return true; // change if you want RBAC later
    }
    
    protected function prepareForValidation()
    {
        $this->merge([
            'name' => $this->name ? trim(strip_tags($this->name)) : null,
            'description' => $this->description ? trim(strip_tags($this->description)) : null,
            'category' => $this->category ? trim(strip_tags($this->category)) : null,
        ]);
    }
    public function rules()
    {
        return [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:50',
            'availability_status' => 'required|boolean',
            'product_details' => 'nullable|string',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Menu item name is required.',
            'name.max' => 'Menu name cannot exceed 100 characters.',
            'description.string' => 'Description must be text only.',
            'price.required' => 'Price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price must be zero or greater.',
            'category.required' => 'Category is required.',
            'category.max' => 'Category cannot exceed 50 characters.',
            'availability_status.required' => 'Availability status is required.',
            'availability_status.boolean' => 'Availability status must be true or false.',
            'product_details.string' => 'Product details must be text only.',
        ];
    }
}
