<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'sales_id',
        'material_id',
        'weight',
        'price_per_unit',
        'total',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'weight'         => 'decimal:3',
            'price_per_unit' => 'decimal:2',
            'total'          => 'decimal:2',
        ];
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'sales_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
