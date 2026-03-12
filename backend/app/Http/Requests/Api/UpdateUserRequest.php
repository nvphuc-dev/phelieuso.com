<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', Rule::unique('users')->ignore($this->route('user'))],
            'password' => ['sometimes', 'string', 'min:8'],
            'role'     => ['sometimes', 'in:manager,employee'],
            'status'   => ['sometimes', 'in:active,inactive'],
        ];
    }
}
