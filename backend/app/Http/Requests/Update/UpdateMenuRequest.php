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
        $this->merge([
            'name' => $this->name ? trim(strip_tags($this->name)) : null,
            'description' => $this->description ? trim(strip_tags($this->description)) : null,
            'category' => $this->category ? trim(strip_tags($this->category)) : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:100',
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string|max:50',
            'availability_status' => 'sometimes|boolean',
            'product_details' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Menu name must be text.',
            'price.numeric' => 'Price must be a valid number.',
            'availability_status.boolean' => 'Availability status must be true or false.',
        ];
    }
}
