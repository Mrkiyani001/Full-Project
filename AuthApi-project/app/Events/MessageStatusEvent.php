<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageStatusEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $status;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message, $status)
    {
        $this->message = $message;
        $this->status = $status;
    }

    /**
     * Get the channels the event should broadcast on.
     * broadcast to the sender (so they see the update)
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->sender_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'status' => $this->status,
            'conversation_id' => $this->message->conversation_id,
            'receiver_id' => $this->message->receiver_id
        ];
    }
}
