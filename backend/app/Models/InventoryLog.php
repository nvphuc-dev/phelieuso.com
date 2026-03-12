<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLog extends Model
{
    public $timestamps = false;

    const CREATED_AT = 'created_at';

    protected $fillable = [
        'tenant_id',
        'material_id',
        'reference_type',
        'reference_id',
        'change_weight',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'change_weight' => 'decimal:3',
            'created_at'    => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
