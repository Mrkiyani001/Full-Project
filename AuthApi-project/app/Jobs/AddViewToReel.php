<?php

namespace App\Jobs;

use App\Models\Post;
use App\Models\Reel;
use App\Models\View;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AddViewToReel implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;
    public $user_id;
    public $reel_id;
    /**
     * Create a new job instance.
     */
    public function __construct($user_id, $reel_id)
    {
        $this->user_id = $user_id;
        $this->reel_id = $reel_id;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('AddView job started');
        try {
            $view = View::firstOrCreate([
                'reel_id' => $this->reel_id,
                'created_by' => $this->user_id,
            ], [
                'updated_by' => $this->user_id,
            ]);
            if($view->wasRecentlyCreated){
                Reel::where('id', $this->reel_id)->increment('views');
            }
        } catch (Exception $e) {
            Log::error('AddView job failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
