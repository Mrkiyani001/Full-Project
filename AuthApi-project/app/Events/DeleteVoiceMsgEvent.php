<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeleteVoiceMsgEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
public $voiceMsg;
    /**
     * Create a new event instance.
     */
    public function __construct($voiceMsg)
    {
        $this->voiceMsg = $voiceMsg->load('sender','receiver');
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.'.$this->voiceMsg->receiver_id),
            new PrivateChannel('chat.'.$this->voiceMsg->sender_id),
        ];
    }
    public function broadcastWith()
    {
        return [
            'voiceMsg' => $this->voiceMsg,
            'message' => 'Voice message deleted successfully',
            'delete_at' => now(),
        ];
    }
}
