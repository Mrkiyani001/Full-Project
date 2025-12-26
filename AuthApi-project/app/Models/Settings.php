<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    protected $table = 'settings';

    protected $fillable = [
        'site_name',
        'site_description',
        'support_email',
        'logo',
        'favicon',
        'theme_color',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'maintenance_mode',
        'allow_registration',
        'email_verification',
        'meta_keywords',
        'default_language'
    ];

    /**
     * Get the current settings or create default.
     */
    public static function retrieve()
    {
        return self::firstOrCreate([], [
            'site_name' => 'Social Platform',
            'logo' => 'logo.png',
            'theme_color' => '#3b82f6',
            'allow_registration' => true,
        ]);
    }
}
