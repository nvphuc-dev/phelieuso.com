<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id'              => ['required', 'integer', 'exists:customers,id'],
            'date'                     => ['required', 'date_format:Y-m-d'],
            'time'                     => ['required', 'date_format:H:i'],
            'note'                     => ['nullable', 'string'],
            'items'                    => ['required', 'array', 'min:1'],
            'items.*.material_id'      => ['required', 'integer', 'exists:materials,id'],
            'items.*.weight'           => ['required', 'numeric', 'min:0.001'],
            'items.*.price_per_unit'   => ['required', 'numeric', 'min:0'],
            'items.*.note'             => ['nullable', 'string'],
        ];
    }
}
