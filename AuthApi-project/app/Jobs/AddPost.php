<?php

namespace App\Jobs;

use App\Models\Post;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

use App\Services\ModerationService;

class AddPost implements ShouldQueue
{
    use Queueable, Dispatchable, SerializesModels, InteractsWithQueue;
    public $user_id;
    public $title;
    public $body;
    public $attachments;
    public $is_approved;
    /**
     * Create a new job instance.
     */
    public function __construct($user_id, $title, $body, $attachments = [], $is_approved = false)
    {
        $this->user_id = $user_id;
        $this->title = $title;
        $this->body = $body;
        $this->attachments = $attachments;
        $this->is_approved = $is_approved;
    }

    /**
     * Execute the job.
     */
    public function handle(ModerationService $moderationService): void
    {
        $postData = [
            'user_id' => $this->user_id,
            'title' => $this->title,
            'body' => $this->body,
            'created_by' => $this->user_id,
            'updated_by' => $this->user_id,
        ];

        if ($this->is_approved) {
            $postData['status'] = 1; // Approved
            // $postData['is_published'] = 1; // Uncomment if column exists
        }

        $post = Post::create($postData);

        // Run Moderation Logic only if NOT approved
        if (!$this->is_approved) {
            try {
                $moderationService->moderate($post, $this->body);
            } catch (\Exception $e) {
                Log::error("Moderation Failed for Post ID {$post->id}: " . $e->getMessage());
            }
        }

        if (empty($this->attachments)) return;
        try {
            foreach ($this->attachments as $filename) {
                $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                $type = match (true) {
                    in_array($extension, ['jpg', 'jpeg', 'png', 'gif']) => 'image',
                    in_array($extension, ['mp4', 'avi', 'mov']) => 'video',
                    $extension === 'pdf' => 'pdf',
                    in_array($extension, ['doc', 'docx']) => 'word',
                    in_array($extension, ['zip', 'rar', '7z']) => 'zip',
                    default => 'other',
                };
                $post->attachments()->create([
                    'file_name' => $filename,
                    'file_type' => $type,
                    'file_path' => 'posts/' . $filename,
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Failed to upload attachments for post ID " . $post->id . ": " . $e->getMessage());
        }
    }
}
