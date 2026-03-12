<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryLog;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Increase inventory when a purchase is created.
     */
    public function increaseStock(int $tenantId, int $materialId, float $weight, string $referenceType, int $referenceId, ?string $note = null): void
    {
        $inventory = Inventory::firstOrCreate(
            ['tenant_id' => $tenantId, 'material_id' => $materialId],
            ['total_weight' => 0]
        );

        $inventory->increment('total_weight', $weight);
        $inventory->updated_at = now();
        $inventory->save();

        $this->writeLog($tenantId, $materialId, $referenceType, $referenceId, $weight, $note);
    }

    /**
     * Decrease inventory when a sale is created.
     * Throws exception if insufficient stock.
     */
    public function decreaseStock(int $tenantId, int $materialId, float $weight, string $referenceType, int $referenceId, ?string $note = null): void
    {
        $inventory = Inventory::where('tenant_id', $tenantId)
            ->where('material_id', $materialId)
            ->lockForUpdate()
            ->first();

        $currentStock = $inventory ? (float) $inventory->total_weight : 0;

        if ($currentStock < $weight) {
            throw new \Exception("Insufficient stock for material ID {$materialId}. Available: {$currentStock}, Requested: {$weight}");
        }

        $inventory->decrement('total_weight', $weight);
        $inventory->updated_at = now();
        $inventory->save();

        $this->writeLog($tenantId, $materialId, $referenceType, $referenceId, -$weight, $note);
    }

    /**
     * Reverse a previous stock change (for cancellations).
     */
    public function reverseStockChange(int $tenantId, int $materialId, float $changeWeight): void
    {
        $inventory = Inventory::firstOrCreate(
            ['tenant_id' => $tenantId, 'material_id' => $materialId],
            ['total_weight' => 0]
        );

        // changeWeight is negative for sales, positive for purchases
        // Reversing means doing the opposite
        $inventory->total_weight = max(0, (float) $inventory->total_weight - $changeWeight);
        $inventory->updated_at = now();
        $inventory->save();
    }

    private function writeLog(int $tenantId, int $materialId, string $referenceType, int $referenceId, float $changeWeight, ?string $note): void
    {
        InventoryLog::create([
            'tenant_id'      => $tenantId,
            'material_id'    => $materialId,
            'reference_type' => $referenceType,
            'reference_id'   => $referenceId,
            'change_weight'  => $changeWeight,
            'note'           => $note,
            'created_at'     => now(),
        ]);
    }
}
