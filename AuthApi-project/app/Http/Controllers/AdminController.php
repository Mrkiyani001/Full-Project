<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AdminController extends BaseController
{
    public function stats()
    {
        try {
            $totalUsers = User::count();
            $newUsersToday = User::whereDate('created_at', Carbon::today())->count();
            $bannedUsers = User::where('is_banned', 1)->count();
            
            // Calculate trends (simple mock or actual implementation)
            // For now, let's keep it simple or implement yesterday comparison
            $newUsersYesterday = User::whereDate('created_at', Carbon::yesterday())->count();
            
            // Avoid division by zero
            $growth = 0;
            if($newUsersYesterday > 0) {
                $growth = (($newUsersToday - $newUsersYesterday) / $newUsersYesterday) * 100;
            } else if ($newUsersToday > 0) {
                $growth = 100;
            }

            return $this->response(true, 'Stats retrieved', [
                'total_users' => $totalUsers,
                'new_users_today' => $newUsersToday,
                'banned_users' => $bannedUsers,
                'growth_percentage' => round($growth, 1)
            ], 200);

        } catch (\Exception $e) {
            return $this->Response(false, $e->getMessage(), null, 500);
        }
    }

    public function banUser(Request $request)
    {
        $this->validateRequest($request, [
            'user_id' => 'required|exists:users,id',
            'action' => 'required|in:ban,unban'
        ]);

        try {
            // Prevent banning self
            if ($request->user_id == auth('api')->id()) {
                return $this->response(false, 'You cannot ban yourself', null, 403);
            }

            $user = User::findOrFail($request->user_id);
            
            // Optional: check if target is super-admin
            if ($user->hasRole('super-admin')) {
                return $this->response(false, 'Cannot ban a Super Admin', null, 403);
            }

            $user->is_banned = ($request->action === 'ban' ? 1 : 0);
            $user->save();

            return $this->response(true, 'User ' . $request->action . 'ned successfully', $user, 200);

        } catch (\Exception $e) {
            return $this->Response(false, $e->getMessage(), null, 500);
        }
    }
}
