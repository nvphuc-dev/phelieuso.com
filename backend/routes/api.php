<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SalaryController;

// Public routes
Route::post('/auth/register-tenant', [AuthController::class, 'registerTenant']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Purchases — all roles
    Route::apiResource('purchases', PurchaseController::class);

    // Customers & Materials — GET (read) open to all roles (needed when creating purchases)
    Route::get('/customers',       [CustomerController::class, 'index']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::get('/materials',       [MaterialController::class, 'index']);
    Route::get('/materials/{material}', [MaterialController::class, 'show']);

    // Profile — any authenticated user can view/edit their own profile
    Route::get('/users/{user}',                [UserController::class, 'show']);
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::post('/users/{user}/avatar',    [UserController::class, 'updateAvatar']);
    Route::delete('/users/{user}/avatar',  [UserController::class, 'removeAvatar']);
    Route::post('/users/{user}/change-password', [UserController::class, 'changePassword']);

    // Owner + Manager only
    Route::middleware(['role:owner,manager'])->group(function () {
        // show được đăng ký ngoài nhóm (không có role middleware) để employee xem profile bản thân
        Route::apiResource('users', UserController::class)->except(['show']);

        // Salary management
        Route::get('/users/{user}/salaries', [SalaryController::class, 'index']);
        Route::get('/users/{user}/salaries/{month}', [SalaryController::class, 'show']);
        Route::put('/users/{user}/salaries/{month}', [SalaryController::class, 'upsert']);

        // Customers & Materials — write operations (POST, PUT, DELETE)
        Route::post('/customers',              [CustomerController::class, 'store']);
        Route::put('/customers/{customer}',    [CustomerController::class, 'update']);
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
        Route::post('/materials',              [MaterialController::class, 'store']);
        Route::put('/materials/{material}',    [MaterialController::class, 'update']);
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);
        Route::apiResource('sales', SalesController::class);
        Route::get('/inventory', [InventoryController::class, 'index']);

        Route::prefix('reports')->group(function () {
            Route::get('/dashboard', [ReportController::class, 'dashboard']);
            Route::get('/purchases', [ReportController::class, 'purchases']);
            Route::get('/sales', [ReportController::class, 'sales']);
            Route::get('/inventory', [ReportController::class, 'inventory']);
            Route::get('/customer-revenue', [ReportController::class, 'customerRevenue']);
            Route::get('/customer-bonus', [ReportController::class, 'customerBonus']);
        });
    });
});
