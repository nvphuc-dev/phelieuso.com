<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $ignoreId = $this->route('material')?->id;
        $tenantId = $this->user()->tenant_id;

        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('materials')
                    ->where('tenant_id', $tenantId)
                    ->ignore($ignoreId),
            ],
            'unit'                   => ['nullable', 'string', 'max:20'],
            'default_purchase_price' => ['nullable', 'numeric', 'min:0'],
            'default_sale_price'     => ['nullable', 'numeric', 'min:0'],
            'description'            => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên vật liệu.',
            'name.unique'   => 'Tên vật liệu này đã tồn tại trong hệ thống.',
        ];
    }
}
