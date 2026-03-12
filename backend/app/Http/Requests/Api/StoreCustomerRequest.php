<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'address'    => ['nullable', 'string', 'max:500'],
            'type'       => ['required', 'in:seller,buyer'],
            'note'       => ['nullable', 'string'],
            'bonus_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
