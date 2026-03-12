<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\UserSalaryResource;
use App\Models\User;
use App\Models\UserSalary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    /**
     * GET /api/users/{user}/salaries?year=2026
     * Danh sách bảng lương 12 tháng của nhân viên.
     */
    public function index(Request $request, User $user): JsonResponse
    {
        $this->authorizeTenant($request, $user);

        $year    = $request->year ?? now()->year;
        $records = UserSalary::where('user_id', $user->id)
            ->where('month', 'like', "$year-%")
            ->orderBy('month')
            ->get();

        return response()->json(['data' => UserSalaryResource::collection($records)]);
    }

    /**
     * PUT /api/users/{user}/salaries/{month}
     * Tạo hoặc cập nhật bảng lương theo tháng (upsert).
     */
    public function upsert(Request $request, User $user, string $month): JsonResponse
    {
        $this->authorizeTenant($request, $user);

        // Validate month format YYYY-MM
        $request->validate([
            'base_salary'     => ['required', 'numeric', 'min:0'],
            'working_days'    => ['required', 'integer', 'min:1', 'max:31'],
            'paid_leave_days' => ['required', 'integer', 'min:0', 'max:31'],
            'absent_days'     => ['required', 'numeric', 'min:0', 'max:31'],
            'bonus'           => ['required', 'numeric', 'min:0'],
            'note'            => ['nullable', 'string'],
        ]);

        $salary = UserSalary::updateOrCreate(
            ['user_id' => $user->id, 'month' => $month],
            [
                'tenant_id'       => $request->user()->tenant_id,
                'base_salary'     => $request->base_salary,
                'working_days'    => $request->working_days,
                'paid_leave_days' => $request->paid_leave_days,
                'absent_days'     => $request->absent_days,
                'bonus'           => $request->bonus,
                'note'            => $request->note,
            ]
        );

        return response()->json(['data' => new UserSalaryResource($salary)]);
    }

    /**
     * GET /api/users/{user}/salaries/{month}
     * Lấy bảng lương 1 tháng cụ thể.
     */
    public function show(Request $request, User $user, string $month): JsonResponse
    {
        $this->authorizeTenant($request, $user);

        $salary = UserSalary::where('user_id', $user->id)
            ->where('month', $month)
            ->first();

        if (!$salary) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => new UserSalaryResource($salary)]);
    }

    private function authorizeTenant(Request $request, User $user): void
    {
        if ($user->tenant_id !== $request->user()->tenant_id) {
            abort(403, 'Forbidden.');
        }
    }
}
