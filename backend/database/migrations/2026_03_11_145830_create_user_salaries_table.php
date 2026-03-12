<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_salaries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('user_id');
            $table->string('month', 7)->comment('YYYY-MM');        // e.g. 2026-03
            $table->decimal('base_salary', 15, 0)->default(0);    // lương cơ bản
            $table->unsignedTinyInteger('working_days')->default(26); // ngày công chuẩn/tháng
            $table->unsignedTinyInteger('paid_leave_days')->default(0); // ngày phép có lương
            $table->decimal('absent_days', 4, 1)->default(0);     // ngày nghỉ thực tế
            $table->decimal('bonus', 15, 0)->default(0);           // thưởng tháng
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'month']);
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_salaries');
    }
};
