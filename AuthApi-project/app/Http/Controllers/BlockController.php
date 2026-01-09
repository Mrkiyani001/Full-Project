<?php

namespace App\Http\Controllers;

use App\Models\BlockUser;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;

class BlockController extends BaseController
{
    public function blockuser(Request $request)
    {
       $this->validateRequest($request, [
           'user_id' => 'required|integer|exists:users,id',
       ]);
       try{
        $user = auth('api')->user();
        if(!$user){
            return $this->unauthorized();
        }
        $enemy = User::find($request->user_id);
        if(!$enemy){
            return $this->Response(false, 'User not found', null, 404);
        }
        $blockuser = BlockUser::FirstOrCreate([
            'blocker_id' => $user->id,
            'blocked_id' => $enemy->id,
        ]);
        
        // Unfriend Logic: Detach from both followers and following
        $user->following()->detach($enemy->id);
        $user->followers()->detach($enemy->id);

        return $this->Response(true, 'User blocked successfully', $blockuser, 200);
       }catch(Exception $e){
        return $this->Response(false, $e->getMessage(), null, 500);
       }
    }
    public function unblockuser(Request $request)
    {
       $this->validateRequest($request, [
           'user_id' => 'required|integer|exists:users,id',
       ]);
       try{
        $user = auth('api')->user();
        if(!$user){
            return $this->unauthorized();
        }
        $enemy = User::find($request->user_id);
        if(!$enemy){
            return $this->Response(false, 'User not found', null, 404);
        }
        $blockuser = BlockUser::where([
            'blocker_id' => $user->id,
            'blocked_id' => $enemy->id,
        ])->first();
        if(!$blockuser){
            return $this->Response(false, 'User not blocked', null, 404);
        }
        $blockuser->delete();
        return $this->Response(true, 'User unblocked successfully', null, 200);
       }catch(Exception $e){
        return $this->Response(false, $e->getMessage(), null, 500);
       }
    }
    public function getBlockedUsers(Request $request)
    {
       try{
        $user = auth('api')->user();
        if(!$user){
            return $this->unauthorized();
           }
           $blockedusers = BlockUser::where(
            'blocker_id', $user->id)
            ->with('blocked.profile')
            ->get();
           return $this->Response(true, 'Blocked users retrieved successfully', $blockedusers, 200);
          }catch(Exception $e){
           return $this->Response(false, $e->getMessage(), null, 500);
          }
    }
}
