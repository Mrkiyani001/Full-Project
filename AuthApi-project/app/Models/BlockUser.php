<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockUser extends Model
{
    protected $table = 'blocked_users';
    protected $fillable = [
        'blocker_id',
        'blocked_id',
    ];
    public function blocker()
    {
        return $this->belongsTo(User::class, 'blocker_id');
    }
    public function blocked()
    {
        return $this->belongsTo(User::class, 'blocked_id');
    }
}
