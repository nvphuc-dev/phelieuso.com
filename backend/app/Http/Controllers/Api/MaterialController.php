<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreMaterialRequest;
use App\Http\Resources\Api\MaterialResource;
use App\Models\Material;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $materials = Material::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('name')
            ->get();

        return response()->json(MaterialResource::collection($materials));
    }

    public function show(Request $request, Material $material): JsonResponse
    {
        $this->authorizeTenant($request, $material);

        return response()->json(new MaterialResource($material));
    }

    public function store(StoreMaterialRequest $request): JsonResponse
    {
        $material = Material::create([
            'tenant_id' => $request->user()->tenant_id,
            ...$request->validated(),
        ]);

        return response()->json(new MaterialResource($material), 201);
    }

    public function update(StoreMaterialRequest $request, Material $material): JsonResponse
    {
        $this->authorizeTenant($request, $material);
        $material->update($request->validated());

        return response()->json(new MaterialResource($material));
    }

    public function destroy(Request $request, Material $material): JsonResponse
    {
        $this->authorizeTenant($request, $material);
        $material->delete();

        return response()->json(['message' => 'Material deleted.']);
    }

    private function authorizeTenant(Request $request, Material $material): void
    {
        if ($material->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Forbidden.');
        }
    }
}
