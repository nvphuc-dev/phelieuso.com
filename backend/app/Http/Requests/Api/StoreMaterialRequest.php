<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                   => ['required', 'string', 'max:255'],
            'unit'                   => ['nullable', 'string', 'max:20'],
            'default_purchase_price' => ['nullable', 'numeric', 'min:0'],
            'default_sale_price'     => ['nullable', 'numeric', 'min:0'],
            'description'            => ['nullable', 'string'],
        ];
    }
}
