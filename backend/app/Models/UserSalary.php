<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSalary extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'month',
        'base_salary',
        'working_days',
        'paid_leave_days',
        'absent_days',
        'bonus',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'base_salary'     => 'decimal:0',
            'absent_days'     => 'decimal:1',
            'bonus'           => 'decimal:0',
            'working_days'    => 'integer',
            'paid_leave_days' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /** Tính lương thực nhận */
    public function getNetSalaryAttribute(): float
    {
        $dailyRate   = $this->working_days > 0
            ? (float) $this->base_salary / $this->working_days
            : 0;
        $excess      = max(0, (float) $this->absent_days - $this->paid_leave_days);
        $deduction   = $excess * $dailyRate;

        return round((float) $this->base_salary - $deduction + (float) $this->bonus, 0);
    }

    public function getDailyRateAttribute(): float
    {
        return $this->working_days > 0
            ? round((float) $this->base_salary / $this->working_days, 0)
            : 0;
    }
}
