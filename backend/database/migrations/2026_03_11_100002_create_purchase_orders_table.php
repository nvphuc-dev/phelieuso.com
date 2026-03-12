<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('created_by')->constrained('users');
            $table->date('date');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->enum('status', ['completed', 'cancelled'])->default('completed');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'date']);
            $table->index(['tenant_id', 'status']);
        });

        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materials');
            $table->decimal('weight', 10, 3);
            $table->decimal('price_per_unit', 15, 2);
            $table->decimal('total', 15, 2);
            $table->text('note')->nullable();

            $table->index(['purchase_id', 'material_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
        Schema::dropIfExists('purchase_orders');
    }
};
