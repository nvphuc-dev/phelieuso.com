<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'unit',
        'default_purchase_price',
        'default_sale_price',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'default_purchase_price' => 'decimal:2',
            'default_sale_price'     => 'decimal:2',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function inventory(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }
}
