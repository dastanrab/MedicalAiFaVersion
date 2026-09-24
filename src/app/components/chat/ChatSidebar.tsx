import { ArrowRight, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ChatRoom, Notification, ConnectionStatus } from './types';
import { getInitials, renderLastMessage } from './utils';

interface ChatSidebarProps {
    isSidebarOpen: boolean;
    activeTab: 'messages' | 'notifications';
    setActiveTab: (tab: 'messages' | 'notifications') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredRooms: ChatRoom[];
    activeRoomId: number | null;
    handleRoomSelect: (roomId: number) => void;
    notifications: Notification[];
    typingUsers: Set<number>;
    status: ConnectionStatus;
    handleBackToHome: () => void;
}

export function ChatSidebar({
                                isSidebarOpen, activeTab, setActiveTab, searchQuery, setSearchQuery,
                                filteredRooms, activeRoomId, handleRoomSelect, notifications,
                                typingUsers, status, handleBackToHome
                            }: ChatSidebarProps) {

    const dot = {
        connected: 'bg-green-400', connecting: 'bg-yellow-400',
        disconnected: 'bg-gray-300', error: 'bg-red-400',
    }[status];

    return (
        <div className={`${isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'} transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden flex flex-col border-l border-gray-100 bg-white relative z-20`}>
            <div className="w-72 h-full flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <button onClick={handleBackToHome} className="text-gray-400 hover:text-gray-600">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeTab === 'messages' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                پیام‌ها
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeTab === 'notifications' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                اعلان‌ها
                            </button>
                        </div>
                        {activeRoomId && <div className={`w-2 h-2 rounded-full ${dot}`} title={status} />}
                    </div>

                    {activeTab === 'messages' && (
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="جستجو در گفتگوها..."
                                className="pr-9 text-xs h-9 bg-gray-50 border-0 focus-visible:ring-0 text-right rounded-lg"
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pb-24">
                    {activeTab === 'messages' ? (
                        filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => (
                                <button
                                    key={room.room_id}
                                    onClick={() => handleRoomSelect(room.room_id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-50 transition-colors ${activeRoomId === room.room_id ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm font-medium overflow-hidden">
                                            {room.opponent.avatar ? <img src={room.opponent.avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitials(room.opponent.name)}
                                        </div>
                                        {room.opponent.is_online && <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-medium text-gray-800 truncate">{room.opponent.name}</span>
                                            {room.last_message_time && (
                                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {new Date(room.last_message_time).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                            <p className="text-xs text-gray-400 truncate">
                                                {typingUsers.has(room.opponent.id) ? 'در حال نوشتن...' : renderLastMessage(room.last_message)}
                                            </p>
                                            {(room.unreadCount ?? 0) > 0 && (
                                                <span className="min-w-[18px] h-[18px] rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center px-1">
                          {room.unreadCount}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : <p className="text-xs text-center mt-6 text-gray-400">گفتگویی یافت نشد.</p>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif.id} className={`p-4 border-b border-gray-50 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {!notif.isRead && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                                        <h4 className="text-sm font-medium text-gray-800">{notif.title}</h4>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{notif.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 text-right leading-relaxed mr-4">{notif.description}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}