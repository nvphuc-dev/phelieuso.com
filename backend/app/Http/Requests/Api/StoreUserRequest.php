<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => [
                'required', 'email',
                // Email duy nhất trong cùng tenant
                Rule::unique('users')->where('tenant_id', $tenantId),
            ],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'in:manager,employee'],
            'status'   => ['nullable', 'in:active,inactive'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Vui lòng nhập họ tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email'    => 'Email không hợp lệ.',
            'email.unique'   => 'Email này đã được sử dụng trong hệ thống.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min'   => 'Mật khẩu phải có ít nhất 8 ký tự.',
        ];
    }
}
