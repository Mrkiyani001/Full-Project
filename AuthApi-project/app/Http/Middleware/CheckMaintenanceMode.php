<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Settings;
use Illuminate\Support\Facades\Cache;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for login/register/public routes intended to be available?
        // Actually user said maintenance mode should block site access.
        // But we must allow login API otherwise admin can't log in to disable it.
        
        $path = $request->path();
        $allowedRoutes = [
            'api/login',
            'api/register', // Optional: disable registration during maintenance? User asked for maintenance mode. usually blocks register too.
            'api/admin/settings', // Allow admin to change settings
        ];

        // Check Settings
        // Use Cache to avoid hitting DB on every request if high traffic, but for now direct DB is safer for immediate effect.
        $settings = Settings::first();
        
        if ($settings && $settings->maintenance_mode) {
             // Always allow Login/Admin auth routes so they can get tokens
             if ($request->is('api/login') || $request->is('api/admin/*')) {
                 return $next($request);
             }

             // Check if user is authenticated and is super admin
             // We need to guard 'api' to get the user
             if (auth('api')->check()) {
                 $user = auth('api')->user();
                 if ($user->hasRole('super admin') || $user->hasRole('admin')) {
                     return $next($request);
                 }
             }

             return response()->json([
                 'success' => false,
                 'message' => 'Service Unavailable. The site is currently in maintenance mode.',
                 'maintenance_mode' => true
             ], 503);
        }

        return $next($request);
    }
}
