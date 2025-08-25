<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize()
    {
        return true; // later you can add role-based authorization
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'name'           => $this->name ? trim(strip_tags($this->name)) : null,
            'username'       => $this->username ? trim(strip_tags($this->username)) : null,
            'contact_number' => $this->contact_number ? trim(strip_tags($this->contact_number)) : null,
            'role'           => $this->role ? trim(strip_tags($this->role)) : null,
            // ⚠ password we don’t strip/trim because it might break user intent
        ]);
    }

    public function rules()
    {
        return [
            'name'           => 'required|string|max:100',
            'username'       => 'required|string|max:50|unique:users,username',
            'password'       => 'required|string|min:6',
            'role'           => 'required|in:Admin,Cashier',
            'contact_number' => 'nullable|string|max:20',
        ];
    }

    public function messages()
    {
        return [
            'name.required'           => 'Name is required.',
            'name.max'                => 'Name cannot exceed 100 characters.',
            'username.required'       => 'Username is required.',
            'username.unique'         => 'This username is already taken.',
            'username.max'            => 'Username cannot exceed 50 characters.',
            'password.required'       => 'Password is required.',
            'password.min'            => 'Password must be at least 6 characters.',
            'role.required'           => 'Role is required.',
            'role.in'                 => 'Role must be either Admin or Cashier.',
            'contact_number.max'      => 'Contact number cannot exceed 20 characters.',
        ];
    }
}
