<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\PurchaseOrder;
use App\Models\SalesOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $from = $request->from ?? now()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $purchases = PurchaseOrder::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereBetween('date', [$from, $to])
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total')
            ->first();

        $sales = SalesOrder::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereBetween('date', [$from, $to])
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total')
            ->first();

        $profit = (float) $sales->total - (float) $purchases->total;

        return response()->json([
            'period' => ['from' => $from, 'to' => $to],
            'purchases' => [
                'count' => (int) $purchases->count,
                'total' => (float) $purchases->total,
            ],
            'sales' => [
                'count' => (int) $sales->count,
                'total' => (float) $sales->total,
            ],
            'profit_estimation' => $profit,
        ]);
    }

    public function purchases(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $data = PurchaseOrder::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereBetween('date', [$from, $to])
            ->selectRaw('date, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'period' => ['from' => $from, 'to' => $to],
            'data'   => $data,
        ]);
    }

    public function sales(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $data = SalesOrder::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereBetween('date', [$from, $to])
            ->selectRaw('date, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'period' => ['from' => $from, 'to' => $to],
            'data'   => $data,
        ]);
    }

    public function inventory(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $data = Inventory::where('tenant_id', $tenantId)
            ->with('material')
            ->orderByDesc('total_weight')
            ->get()
            ->map(fn ($inv) => [
                'material_id'   => $inv->material_id,
                'material_name' => $inv->material?->name,
                'unit'          => $inv->material?->unit,
                'total_weight'  => (float) $inv->total_weight,
                'updated_at'    => $inv->updated_at,
            ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Doanh thu từng khách hàng theo từng tháng trong năm.
     * GET /api/reports/customer-revenue?year=2026&customer_id=1
     */
    public function customerRevenue(Request $request): JsonResponse
    {
        $tenantId  = $request->user()->tenant_id;
        $year      = (int) ($request->year ?? now()->year);
        $customerId = $request->customer_id;

        // Monthly revenue query
        $query = PurchaseOrder::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereYear('date', $year)
            ->selectRaw('customer_id, MONTH(date) as month, SUM(total_amount) as total, COUNT(*) as count')
            ->groupBy('customer_id', 'month')
            ->orderBy('customer_id')
            ->orderBy('month');

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        $rows = $query->with('customer:id,name,phone,bonus_rate')->get();

        // Group by customer
        $byCustomer = [];
        foreach ($rows as $row) {
            $cid = $row->customer_id;
            if (!isset($byCustomer[$cid])) {
                $byCustomer[$cid] = [
                    'customer_id'  => $cid,
                    'customer_name'=> $row->customer?->name,
                    'customer_phone'=> $row->customer?->phone,
                    'bonus_rate'   => (float) ($row->customer?->bonus_rate ?? 0),
                    'months'       => array_fill(1, 12, ['total' => 0, 'count' => 0]),
                    'annual_total' => 0,
                ];
            }
            $byCustomer[$cid]['months'][(int)$row->month] = [
                'total' => (float) $row->total,
                'count' => (int)   $row->count,
            ];
            $byCustomer[$cid]['annual_total'] += (float) $row->total;
        }

        // Add bonus calculation
        foreach ($byCustomer as &$c) {
            $c['bonus_amount'] = round($c['annual_total'] * $c['bonus_rate'] / 100, 0);
        }

        return response()->json([
            'year' => $year,
            'data' => array_values($byCustomer),
        ]);
    }

    /**
     * Tổng kết thưởng cuối năm theo từng khách hàng.
     * GET /api/reports/customer-bonus?year=2026
     */
    public function customerBonus(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $year     = (int) ($request->year ?? now()->year);

        $customers = Customer::where('tenant_id', $tenantId)
            ->where('type', 'seller')
            ->get();

        $revenues = PurchaseOrder::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereYear('date', $year)
            ->selectRaw('customer_id, SUM(total_amount) as annual_total, COUNT(*) as order_count')
            ->groupBy('customer_id')
            ->pluck('annual_total', 'customer_id')
            ->toArray();

        $counts = PurchaseOrder::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereYear('date', $year)
            ->selectRaw('customer_id, COUNT(*) as order_count')
            ->groupBy('customer_id')
            ->pluck('order_count', 'customer_id')
            ->toArray();

        $data = $customers->map(function ($c) use ($revenues, $counts) {
            $annual = (float) ($revenues[$c->id] ?? 0);
            $rate   = (float) $c->bonus_rate;
            return [
                'customer_id'    => $c->id,
                'customer_name'  => $c->name,
                'customer_phone' => $c->phone,
                'bonus_rate'     => $rate,
                'order_count'    => (int) ($counts[$c->id] ?? 0),
                'annual_total'   => $annual,
                'bonus_amount'   => round($annual * $rate / 100, 0),
            ];
        })->sortByDesc('annual_total')->values();

        return response()->json([
            'year' => $year,
            'data' => $data,
        ]);
    }
}
