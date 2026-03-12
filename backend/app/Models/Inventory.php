<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    public $timestamps = false;

    const UPDATED_AT = 'updated_at';

    protected $table = 'inventory';

    protected $fillable = [
        'tenant_id',
        'material_id',
        'total_weight',
    ];

    protected function casts(): array
    {
        return [
            'total_weight' => 'decimal:3',
            'updated_at'   => 'datetime',
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
