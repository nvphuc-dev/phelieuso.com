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
        $tenantId = $this->user()->tenant_id;
        $userId   = $this->route('user')?->id ?? $this->route('user');

        return [
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => [
                'sometimes', 'email',
                Rule::unique('users')
                    ->where('tenant_id', $tenantId)
                    ->ignore($userId),
            ],
            'password' => ['sometimes', 'string', 'min:8'],
            'role'     => ['sometimes', 'in:manager,employee'],
            'status'   => ['sometimes', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.email'  => 'Email không hợp lệ.',
            'email.unique' => 'Email này đã được sử dụng trong hệ thống.',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự.',
        ];
    }
}
