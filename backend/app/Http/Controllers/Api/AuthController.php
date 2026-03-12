<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterTenantRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function registerTenant(RegisterTenantRequest $request): JsonResponse
    {
        $result = DB::transaction(function () use ($request) {
            $slug = Str::slug($request->business_name) . '-' . Str::random(6);

            $tenant = Tenant::create([
                'name'   => $request->business_name,
                'email'  => $request->email,
                'phone'  => $request->business_phone,
                'slug'   => $slug,
                'status' => 'active',
            ]);

            $user = User::create([
                'tenant_id' => $tenant->id,
                'name'      => $request->name,
                'email'     => $request->email,
                'password'  => Hash::make($request->password),
                'role'      => 'owner',
                'status'    => 'active',
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return compact('user', 'token');
        });

        return response()->json([
            'message' => 'Tenant registered successfully.',
            'user'    => new UserResource($result['user']),
            'token'   => $result['token'],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $user = Auth::user();

        if ($user->status !== 'active') {
            Auth::logout();
            return response()->json(['message' => 'Tài khoản đã bị tạm dừng. Vui lòng liên hệ quản trị viên.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }
}
