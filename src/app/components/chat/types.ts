export type Notification = {
    id: number;
    title: string;
    description: string;
    time: string;
    isRead: boolean;
    type: 'system' | 'alert' | 'info';
};

export type Message = {
    id: number;
    sender: 'user' | 'other';
    message: string;
    time: string;
    user_id?: number;
    username?: string;
    status?: 'sending' | 'sent' | 'failed';
    tempId?: number;
    message_type?: 'text' | 'file';
};

export type Opponent = {
    id: number;
    name: string;
    role: string;
    avatar: string | null;
    is_online: boolean;
    last_seen: string | null;
};

export type ChatRoom = {
    room_id: number;
    room_name: string;
    last_message: string | null;
    last_message_time: string | null;
    room_created_at: string;
    opponent: Opponent;
    unreadCount?: number;
};

export type UserStatus = {
    user_id: number;
    username: string;
    is_online: boolean;
    last_seen?: string;
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';