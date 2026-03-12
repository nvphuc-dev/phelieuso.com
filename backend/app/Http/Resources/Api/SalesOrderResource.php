<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'date'         => $this->date?->format('Y-m-d'),
            'time'         => $this->time,
            'total_amount' => $this->total_amount,
            'status'       => $this->status,
            'note'         => $this->note,
            'customer'     => new CustomerResource($this->whenLoaded('customer')),
            'created_by'   => new UserResource($this->whenLoaded('createdBy')),
            'items'        => SalesItemResource::collection($this->whenLoaded('items')),
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
