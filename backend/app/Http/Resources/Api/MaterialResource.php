<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'name'                   => $this->name,
            'unit'                   => $this->unit,
            'default_purchase_price' => $this->default_purchase_price,
            'default_sale_price'     => $this->default_sale_price,
            'description'            => $this->description,
            'created_at'             => $this->created_at,
        ];
    }
}
