<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCustomerRequest;
use App\Http\Resources\Api\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $customers = Customer::where('tenant_id', $tenantId)
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('name')
            ->get();

        return response()->json(CustomerResource::collection($customers));
    }

    public function show(Request $request, Customer $customer): JsonResponse
    {
        $this->authorizeTenant($request, $customer);

        return response()->json(new CustomerResource($customer));
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = Customer::create([
            'tenant_id' => $request->user()->tenant_id,
            ...$request->validated(),
        ]);

        return response()->json(new CustomerResource($customer), 201);
    }

    public function update(StoreCustomerRequest $request, Customer $customer): JsonResponse
    {
        $this->authorizeTenant($request, $customer);
        $customer->update($request->validated());

        return response()->json(new CustomerResource($customer));
    }

    public function destroy(Request $request, Customer $customer): JsonResponse
    {
        $this->authorizeTenant($request, $customer);
        $customer->delete();

        return response()->json(['message' => 'Customer deleted.']);
    }

    private function authorizeTenant(Request $request, Customer $customer): void
    {
        if ($customer->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Forbidden.');
        }
    }
}
