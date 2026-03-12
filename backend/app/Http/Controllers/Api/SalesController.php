<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSalesRequest;
use App\Http\Resources\Api\SalesOrderResource;
use App\Models\SalesOrder;
use App\Services\SalesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesController extends Controller
{
    public function __construct(private SalesService $salesService) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $sales = SalesOrder::where('tenant_id', $tenantId)
            ->with(['customer', 'createdBy'])
            ->when($request->from, fn ($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to, fn ($q) => $q->whereDate('date', '<=', $request->to))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'data' => SalesOrderResource::collection($sales->items()),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page'    => $sales->lastPage(),
                'total'        => $sales->total(),
            ],
        ]);
    }

    public function store(StoreSalesRequest $request): JsonResponse
    {
        try {
            $sales = $this->salesService->create(
                $request->user()->tenant_id,
                $request->user()->id,
                $request->validated()
            );

            return response()->json(new SalesOrderResource($sales), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, SalesOrder $sale): JsonResponse
    {
        $this->authorizeTenant($request, $sale);

        return response()->json(
            new SalesOrderResource($sale->load(['customer', 'items.material', 'createdBy']))
        );
    }

    public function destroy(Request $request, SalesOrder $sale): JsonResponse
    {
        $this->authorizeTenant($request, $sale);

        try {
            $this->salesService->cancel($sale);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Sales order cancelled.']);
    }

    private function authorizeTenant(Request $request, SalesOrder $sale): void
    {
        if ($sale->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Forbidden.');
        }
    }
}
