<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // % thưởng cuối năm, VD: 2.50 = 2.5%
            $table->decimal('bonus_rate', 5, 2)->default(0)->after('note')
                  ->comment('% thưởng cuối năm tính trên tổng doanh thu');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('bonus_rate');
        });
    }
};
