<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'phone'      => $this->phone,
            'address'    => $this->address,
            'type'       => $this->type,
            'note'       => $this->note,
            'bonus_rate' => (float) $this->bonus_rate,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
