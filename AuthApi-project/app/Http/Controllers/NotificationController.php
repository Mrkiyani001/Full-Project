<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Notifications\Notifiable;

class NotificationController extends BaseController
{
    public function getUsersNotification(Request $request)
    {
        try {
            $limit = (int) $request->input('limit', 10);
            $user = auth('api')->user();
            if (!$user) {
                return $this->unauthorized();
            }
            $notifications = Notification::where('user_id', $user->id)
                ->with('notifiable')
                ->latest()
                ->paginate($limit);
            
            $data = $this->paginateData($notifications, $notifications->items());
            return $this->Response(true, 'Notifications Fetched Successfully', $data, 200);
        } catch (Exception $e) {
            return $this->Response(false, $e->getMessage(), null, 500);
        }
    }
    public function getAdminNotification(Request $request)
    {
        try {
            $limit = (int) $request->input('limit', 10);
            $user = auth('api')->user();
            if (!$user) {
                return $this->unauthorized();
            }
            $notifications = Notification::where('for_admin', 'Y')->with('notifiable')->latest()->paginate($limit);
            
            $data = $this->paginateData($notifications, $notifications->items());
            return $this->Response(true, 'Admin Notifications Fetched Successfully', $data, 200);
        } catch (Exception $e) {
            return $this->Response(false, $e->getMessage(), null, 500);
        }
    }

    public function markAsRead(Request $request)
    {
        try {
            $user = auth('api')->user();
            if (!$user) {
                return $this->unauthorized();
            }

            $id = $request->input('id');

            if ($id === 'all') {
                Notification::where('user_id', $user->id)
                    ->where('read_status', 'N')
                    ->update(['read_status' => 'Y']);
            } else {
                Notification::where('user_id', $user->id)
                    ->where('id', $id)
                    ->update(['read_status' => 'Y']);
            }

            return $this->Response(true, 'Notification(s) marked as read', null, 200);
        } catch (Exception $e) {
            return $this->Response(false, $e->getMessage(), null, 500);
        }
    }

    public function getUnreadCount(Request $request)
    {
        try {
            $user = auth('api')->user();
            if (!$user) {
                return $this->unauthorized();
            }

            $count = Notification::where('user_id', $user->id)
                ->where('read_status', 'N')
                ->count();

            return $this->Response(true, 'Unread count fetched', ['count' => $count], 200);
        } catch (Exception $e) {
            return $this->Response(false, $e->getMessage(), null, 500);
        }
    }
}
