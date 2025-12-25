<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Settings;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Settings::count() == 0) {
            Settings::create([
                'site_name' => 'NexUs',
                'site_description' => 'A next-generation social platform.',
                'support_email' => 'admin@nexus.com',
                'theme_color' => '#215bed',
                'maintenance_mode' => false,
                'allow_registration' => true,
                'email_verification' => false,
                'default_language' => 'en',
            ]);
        }
    }
}
