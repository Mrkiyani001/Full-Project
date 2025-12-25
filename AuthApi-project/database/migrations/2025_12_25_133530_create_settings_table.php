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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            // --- General Settings ---
            $table->string('site_name')->default('NexUs');
            $table->text('site_description')->nullable();
            $table->string('support_email')->nullable();

            // --- Branding (Images) ---
            $table->string('logo')->nullable(); // Logo path
            $table->string('favicon')->nullable();
            $table->string('theme_color')->default('#3b82f6'); // Default Blue color

            // --- Social Links ---
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('twitter_url')->nullable();

            // --- System Controls (Boolean/Switches) ---
            $table->boolean('maintenance_mode')->default(false); // 0 = Site On, 1 = Site Off
            $table->boolean('allow_registration')->default(true); // 0 = No Signup, 1 = Signup Allowed
            $table->boolean('email_verification')->default(false); // Signup verification

            // --- SEO & Localization ---
            $table->string('meta_keywords')->nullable();
            $table->string('default_language')->default('en');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
