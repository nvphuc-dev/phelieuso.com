<?php

namespace App\Services;

use App\Models\SalesOrder;
use App\Models\SalesItem;
use App\Models\InventoryLog;
use Illuminate\Support\Facades\DB;

class SalesService
{
    public function __construct(
        private InventoryService $inventoryService
    ) {}

    public function create(int $tenantId, int $userId, array $data): SalesOrder
    {
        return DB::transaction(function () use ($tenantId, $userId, $data) {
            $totalAmount = collect($data['items'])->sum(
                fn ($item) => $item['weight'] * $item['price_per_unit']
            );

            $sales = SalesOrder::create([
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
                // Validate + decrement stock (throws if insufficient, rolling back the whole transaction)
                $this->inventoryService->decreaseStock(
                    $tenantId,
                    $item['material_id'],
                    $item['weight'],
                    'sale',
                    $sales->id,
                    "Sale #{$sales->id}"
                );

                SalesItem::create([
                    'sales_id'       => $sales->id,
                    'material_id'    => $item['material_id'],
                    'weight'         => $item['weight'],
                    'price_per_unit' => $item['price_per_unit'],
                    'total'          => $item['weight'] * $item['price_per_unit'],
                    'note'           => $item['note'] ?? null,
                ]);
            }

            return $sales->load(['customer', 'items.material', 'createdBy']);
        });
    }

    public function cancel(SalesOrder $sales): SalesOrder
    {
        return DB::transaction(function () use ($sales) {
            if ($sales->status === 'cancelled') {
                throw new \Exception('Sales order is already cancelled.');
            }

            $logs = InventoryLog::where('reference_type', 'sale')
                ->where('reference_id', $sales->id)
                ->get();

            foreach ($logs as $log) {
                // change_weight is negative for sales, reversing adds stock back
                $this->inventoryService->reverseStockChange(
                    $sales->tenant_id,
                    $log->material_id,
                    (float) $log->change_weight
                );
            }

            $sales->update(['status' => 'cancelled']);

            return $sales->fresh();
        });
    }
}
