<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'tenant_id'  => $this->tenant_id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role,
            'status'     => $this->status,
            'avatar'     => $this->avatar,
            'avatar_url' => $this->avatar_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
