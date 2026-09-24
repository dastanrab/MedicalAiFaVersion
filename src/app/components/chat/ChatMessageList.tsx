import { Send, Loader2, CheckCheck, Paperclip } from 'lucide-react';
import { Message, ChatRoom, UserStatus } from './types';
import { ListRowsSkeleton } from '../PageSkeleton';

interface ChatMessageListProps {
    isMobile: boolean;
    messages: Message[];
    isLoadingHistory: boolean;
    typingUsers: Set<number>;
    rooms: ChatRoom[];
    onlineUsers: Map<number, UserStatus>;
    retryFailedMessage: (tempId: number) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    scrollToBottom: () => void;
}

export function ChatMessageList({
                                    isMobile, messages, isLoadingHistory, typingUsers, rooms,
                                    onlineUsers, retryFailedMessage, messagesEndRef, scrollToBottom
                                }: ChatMessageListProps) {

    const renderMessageContent = (msg: Message) => {
        const safeMessage = msg.message || '';
        if (msg.message_type === 'file') {
            const isImage = safeMessage.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
            if (isImage) {
                return (
                    <a href={safeMessage} target="_blank" rel="noreferrer" className="block mt-1">
                        <img src={safeMessage} alt="پیوست" className="max-w-[200px] sm:max-w-[240px] max-h-[240px] w-auto h-auto object-contain rounded-lg border border-black/10 shadow-sm bg-white/20" onLoad={scrollToBottom} />
                    </a>
                );
            }
            return (
                <a href={safeMessage} target="_blank" rel="noreferrer" className={`flex items-center gap-2 underline mt-1 hover:opacity-80 transition-opacity min-w-0 ${msg.sender === 'user' ? 'text-white' : 'text-blue-600'}`}>
                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">دانلود فایل پیوست</span>
                </a>
            );
        }
        return <p className="text-right break-words whitespace-pre-wrap">{safeMessage}</p>;
    };

    const typingUsersList = Array.from(typingUsers);
    const typingUsernames = typingUsersList.map((uid) => {
        const room = rooms.find((r) => r.opponent.id === uid);
        return room?.opponent.name || onlineUsers.get(uid)?.username || 'مخاطب';
    }).join('، ');

    return (
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-3 py-3 space-y-3' : 'px-6 py-6 space-y-4'} bg-gray-50/40 scroll-smooth relative`}>
            {isLoadingHistory && <ListRowsSkeleton rows={5} />}
            {!isLoadingHistory && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                    <Send className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12 opacity-50'} -scale-x-100`} />
                    <p className="text-sm">هنوز پیامی نیست</p>
                </div>
            )}

            {messages.map((msg) => (
                <div key={msg.tempId || msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`${isMobile ? 'max-w-[85%] sm:max-w-[75%] px-3 py-2' : 'max-w-[70%] px-4 py-2.5'} rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                        {renderMessageContent(msg)}
                        <div className="flex items-center justify-start gap-1 mt-1">
              <span className={`text-[10px] ${msg.sender === 'user' ? (isMobile ? 'text-blue-200' : 'text-blue-100') : 'text-gray-400'}`}>
                {msg.time}
              </span>
                            {msg.sender === 'user' && (
                                <>
                                    {msg.status === 'sending' && <Loader2 className={`w-3 h-3 animate-spin ${isMobile ? 'text-blue-200' : 'text-blue-100'}`} />}
                                    {msg.status === 'sent' && <CheckCheck className={`w-3 h-3 ${isMobile ? 'text-blue-200' : 'text-blue-100'}`} />}
                                    {msg.status === 'failed' && (
                                        <button onClick={() => msg.tempId && retryFailedMessage(msg.tempId)} className={`text-[10px] ${isMobile ? 'text-red-300' : 'text-red-200'} underline`}>تلاش مجدد</button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {typingUsersList.length > 0 ? (
                <div className="h-6 px-3 py-1 text-xs text-gray-400 italic animate-pulse">{typingUsernames} در حال نوشتن...</div>
            ) : <div className="h-6" />}

            <div ref={messagesEndRef} className={`${isMobile ? 'h-2' : 'h-4'} w-full`} />
        </div>
    );
}