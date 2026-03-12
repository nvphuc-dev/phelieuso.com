<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'material'     => new MaterialResource($this->whenLoaded('material')),
            'total_weight' => $this->total_weight,
            'updated_at'   => $this->updated_at,
        ];
    }
}
