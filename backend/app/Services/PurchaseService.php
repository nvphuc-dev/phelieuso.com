<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseItem;
use App\Models\InventoryLog;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function __construct(
        private InventoryService $inventoryService
    ) {}

    public function create(int $tenantId, int $userId, array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($tenantId, $userId, $data) {
            $totalAmount = collect($data['items'])->sum(fn ($item) => $item['weight'] * $item['price_per_unit']);

            $purchase = PurchaseOrder::create([
                'tenant_id'    => $tenantId,
                'customer_id'  => $data['customer_id'],
                'created_by'   => $userId,
                'date'         => $data['date'],
                'time'         => $data['time'],
                'total_amount' => $totalAmount,
                'status'       => 'completed',
                'note'         => $data['note'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $total = $item['weight'] * $item['price_per_unit'];
                PurchaseItem::create([
                    'purchase_id'    => $purchase->id,
                    'material_id'    => $item['material_id'],
                    'weight'         => $item['weight'],
                    'price_per_unit' => $item['price_per_unit'],
                    'total'          => $total,
                    'note'           => $item['note'] ?? null,
                ]);

                $this->inventoryService->increaseStock(
                    $tenantId,
                    $item['material_id'],
                    $item['weight'],
                    'purchase',
                    $purchase->id,
                    "Purchase #{$purchase->id}"
                );
            }

            return $purchase->load(['customer', 'items.material', 'createdBy']);
        });
    }

    public function cancel(PurchaseOrder $purchase): PurchaseOrder
    {
        return DB::transaction(function () use ($purchase) {
            if ($purchase->status === 'cancelled') {
                throw new \Exception('Purchase order is already cancelled.');
            }

            // Reverse inventory for each item
            $logs = InventoryLog::where('reference_type', 'purchase')
                ->where('reference_id', $purchase->id)
                ->get();

            foreach ($logs as $log) {
                $this->inventoryService->reverseStockChange(
                    $purchase->tenant_id,
                    $log->material_id,
                    (float) $log->change_weight
                );
            }

            $purchase->update(['status' => 'cancelled']);

            return $purchase->fresh();
        });
    }
}
