<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->decimal('total_weight', 12, 3)->default(0);
            $table->timestamp('updated_at')->nullable();

            $table->unique(['tenant_id', 'material_id']);
            $table->index('tenant_id');
        });

        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->enum('reference_type', ['purchase', 'sale']);
            $table->unsignedBigInteger('reference_id');
            $table->decimal('change_weight', 12, 3);
            $table->text('note')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['tenant_id', 'material_id']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
        Schema::dropIfExists('inventory');
    }
};
