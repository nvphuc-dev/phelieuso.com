<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreUserRequest;
use App\Http\Requests\Api\UpdateUserRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('name')
            ->get();

        return response()->json(UserResource::collection($users));
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $this->authorizeTenant($request, $user);

        // Employee chỉ được xem profile của chính mình
        if ($request->user()->role === 'employee' && $request->user()->id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['data' => new UserResource($user)]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create([
            'tenant_id' => $request->user()->tenant_id,
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'status'    => $request->status ?? 'active',
        ]);

        return response()->json(new UserResource($user), 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorizeTenant($request, $user);

        $data = $request->only(['name', 'email', 'role', 'status']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(new UserResource($user));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorizeTenant($request, $user);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    /**
     * PATCH /api/users/{user}/toggle-status
     * Chỉ owner mới được bật/tắt trạng thái. Không thể tắt chính mình.
     */
    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        $this->authorizeTenant($request, $user);

        if ($request->user()->role !== 'owner') {
            return response()->json(['message' => 'Chỉ chủ vựa mới được thay đổi trạng thái.'], 403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể thay đổi trạng thái của chính mình.'], 422);
        }

        $user->update(['status' => $user->status === 'active' ? 'inactive' : 'active']);

        return response()->json(['data' => new UserResource($user)]);
    }

    /** POST /api/users/{user}/avatar — upload ảnh đại diện */
    public function updateAvatar(Request $request, User $user): JsonResponse
    {
        $this->authorizeProfileAccess($request, $user);

        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'], // max 2MB
        ]);

        // Xoá ảnh cũ
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json(['data' => new UserResource($user)]);
    }

    /** DELETE /api/users/{user}/avatar — xoá ảnh đại diện */
    public function removeAvatar(Request $request, User $user): JsonResponse
    {
        $this->authorizeProfileAccess($request, $user);

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return response()->json(['data' => new UserResource($user)]);
    }

    /** POST /api/users/{user}/change-password */
    public function changePassword(Request $request, User $user): JsonResponse
    {
        $this->authorizeProfileAccess($request, $user);

        // Owner có thể đổi pass bất kỳ ai; user đổi pass mình thì phải xác nhận mật khẩu cũ
        $isSelf = $user->id === $request->user()->id;

        $rules = ['new_password' => ['required', 'string', 'min:6', 'confirmed']];

        if ($isSelf) {
            $rules['current_password'] = ['required', 'string'];
        }

        $request->validate($rules);

        if ($isSelf && !Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Đã đổi mật khẩu thành công.']);
    }

    private function authorizeTenant(Request $request, User $user): void
    {
        if ($user->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Forbidden.');
        }
    }

    /** Nhân viên chỉ được thao tác trên chính mình */
    private function authorizeProfileAccess(Request $request, User $user): void
    {
        $this->authorizeTenant($request, $user);

        if ($request->user()->role === 'employee' && $request->user()->id !== $user->id) {
            abort(403, 'Forbidden.');
        }
    }
}
