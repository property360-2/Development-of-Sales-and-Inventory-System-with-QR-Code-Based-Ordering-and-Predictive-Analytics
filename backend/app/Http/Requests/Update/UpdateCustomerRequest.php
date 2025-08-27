<?php
namespace App\Http\Requests\Update;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'customer_name'   => 'sometimes|string|max:100',
            'table_number'    => 'sometimes|string|max:20',
            'order_reference' => 'sometimes|string|max:50|unique:customers,order_reference,'.$this->id.',customer_id',
        ];
    }

    public function messages()
    {
        return [
            'order_reference.unique' => 'This order reference already exists!',
        ];
    }
}
