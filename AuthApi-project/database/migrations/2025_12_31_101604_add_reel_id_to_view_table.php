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
        Schema::table('view', function (Blueprint $table) {
            $table->unsignedBigInteger('reel_id')->nullable()->after('post_id');
            $table->unsignedBigInteger('post_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('view', function (Blueprint $table) {
            $table->dropColumn('reel_id');
            $table->unsignedBigInteger('post_id')->nullable()->change();
        });
    }
};
