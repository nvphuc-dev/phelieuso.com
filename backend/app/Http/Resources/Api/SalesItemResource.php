<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'material'       => new MaterialResource($this->whenLoaded('material')),
            'weight'         => $this->weight,
            'price_per_unit' => $this->price_per_unit,
            'total'          => $this->total,
            'note'           => $this->note,
        ];
    }
}
