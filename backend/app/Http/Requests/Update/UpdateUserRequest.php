<?php

namespace App\Http\Requests\Update;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id'); // or 'user_id' depende sa route mo

        return [
            'name' => 'sometimes|string|max:100',
            'username' => 'sometimes|string|max:50|unique:users,username,' . $id . ',user_id',
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:Admin,Cashier',
            'contact_number' => 'nullable|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'username.unique' => 'This username is already taken.',
            'password.min' => 'Password must be at least 6 characters.',
            'role.in' => 'Role must be either Admin or Cashier.',
        ];
    }
}
