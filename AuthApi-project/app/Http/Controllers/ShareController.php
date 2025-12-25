<?php

namespace App\Http\Controllers;

use App\Http\Controllers\BaseController;
use App\Models\Share;
use Illuminate\Http\Request;

class ShareController extends BaseController
{
    public function sharePost(Request $request){
        $this->validateRequest($request, [
        'post_id' => 'required|exists:post,id',
        ]);
        try{
            $user = auth('api')->user();
            $share = Share::create([
                'user_id' => $user->id,
                'post_id' => $request->post_id,
            ]);
            return $this->Response(true, 'Post shared successfully', $share, 200);
        }catch(\Exception $e){
            return $this->Response(false, $e->getMessage(), null, 500);
        }

}
}
