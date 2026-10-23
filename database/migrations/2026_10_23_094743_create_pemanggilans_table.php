<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pemanggilans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('khodam_id')->constrained('khodams')->cascadeOnDelete();
            $table->date('tgl_panggil');
            $table->date('tgl_jatuh_tempo');
            $table->date('tgl_pelepasan')->nullable();
            $table->decimal('mahar', 15, 2)->default(0);
            $table->enum('status', ['aktif', 'dilepas']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemanggilans');
    }
};
