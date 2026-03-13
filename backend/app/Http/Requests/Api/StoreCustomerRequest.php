<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Khi update, $this->route('customer') là model Customer hiện tại
        $ignoreId = $this->route('customer')?->id;
        $tenantId = $this->user()->tenant_id;

        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('customers')
                    ->where('tenant_id', $tenantId)
                    ->ignore($ignoreId),
            ],
            'phone' => [
                'nullable', 'string', 'max:20',
                // Chỉ kiểm tra duy nhất khi phone không null
                Rule::unique('customers')
                    ->where('tenant_id', $tenantId)
                    ->ignore($ignoreId),
            ],
            'address'    => ['nullable', 'string', 'max:500'],
            'type'       => ['required', 'in:seller,buyer'],
            'note'       => ['nullable', 'string'],
            'bonus_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên khách hàng.',
            'name.unique'   => 'Tên khách hàng này đã tồn tại trong hệ thống.',
            'phone.unique'  => 'Số điện thoại này đã được sử dụng cho khách hàng khác.',
            'type.required' => 'Vui lòng chọn loại khách hàng.',
        ];
    }
}
