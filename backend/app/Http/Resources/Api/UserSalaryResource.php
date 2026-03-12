<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSalaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'user_id'          => $this->user_id,
            'month'            => $this->month,
            'base_salary'      => (float) $this->base_salary,
            'working_days'     => $this->working_days,
            'paid_leave_days'  => $this->paid_leave_days,
            'absent_days'      => (float) $this->absent_days,
            'bonus'            => (float) $this->bonus,
            'note'             => $this->note,
            'daily_rate'       => $this->daily_rate,
            'net_salary'       => $this->net_salary,
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
