<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\InventoryResource;
use App\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $inventory = Inventory::where('tenant_id', $request->user()->tenant_id)
            ->with('material')
            ->orderByDesc('total_weight')
            ->get();

        return response()->json(InventoryResource::collection($inventory));
    }
}
