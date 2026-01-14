<?php

namespace App\Events;

use App\Models\VoiceMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VoiceMessageStatusEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $voiceMessage;
    public $status;

    /**
     * Create a new event instance.
     */
    public function __construct(VoiceMessage $voiceMessage, $status)
    {
        $this->voiceMessage = $voiceMessage;
        $this->status = $status;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->voiceMessage->sender_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->voiceMessage->id,
            'status' => $this->status,
            'type' => 'voice',
            'conversation_id' => $this->voiceMessage->conversation_id,
            'receiver_id' => $this->voiceMessage->receiver_id
        ];
    }
}
