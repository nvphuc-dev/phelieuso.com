<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StorePurchaseRequest;
use App\Http\Resources\Api\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(private PurchaseService $purchaseService) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $purchases = PurchaseOrder::where('tenant_id', $tenantId)
            ->with(['customer', 'createdBy'])
            ->when($request->from, fn ($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to, fn ($q) => $q->whereDate('date', '<=', $request->to))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'data' => PurchaseOrderResource::collection($purchases->items()),
            'meta' => [
                'current_page' => $purchases->currentPage(),
                'last_page'    => $purchases->lastPage(),
                'total'        => $purchases->total(),
            ],
        ]);
    }

    public function store(StorePurchaseRequest $request): JsonResponse
    {
        $purchase = $this->purchaseService->create(
            $request->user()->tenant_id,
            $request->user()->id,
            $request->validated()
        );

        return response()->json(new PurchaseOrderResource($purchase), 201);
    }

    public function show(Request $request, PurchaseOrder $purchase): JsonResponse
    {
        $this->authorizeTenant($request, $purchase);

        return response()->json(
            new PurchaseOrderResource($purchase->load(['customer', 'items.material', 'createdBy']))
        );
    }

    public function destroy(Request $request, PurchaseOrder $purchase): JsonResponse
    {
        $this->authorizeTenant($request, $purchase);

        $this->purchaseService->cancel($purchase);

        return response()->json(['message' => 'Purchase order cancelled.']);
    }

    private function authorizeTenant(Request $request, PurchaseOrder $purchase): void
    {
        if ($purchase->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Forbidden.');
        }
    }
}
