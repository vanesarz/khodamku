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
        Schema::table('pemanggilans', function (Blueprint $table) {
            $table->string('status', 32)->default('menunggu_persetujuan')->change();
            $table->text('catatan_admin')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemanggilans', function (Blueprint $table) {
            $table->dropColumn('catatan_admin');
            $table->enum('status', ['aktif', 'dilepas'])->default('aktif')->change();
        });
    }
};
