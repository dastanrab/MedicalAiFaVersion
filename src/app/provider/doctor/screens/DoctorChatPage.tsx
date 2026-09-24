import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, ArrowRight, Loader2, AlertCircle, Paperclip } from 'lucide-react';
import { ListRowsSkeleton } from '../../../components/PageSkeleton';
import { useDoctorAuthStore } from '../store/doctorAuthStore';

// آدرس‌های سرور بدون تغییر
const API_BASE = 'https://chat.mediraai.com';
const UPLOAD_BASE = 'https://api.mediraai.com';
const WS_HOST = 'chat.mediraai.com';

type Message = {
    id: number;
    sender: 'user' | 'other';
    message: string;
    time: string;
    user_id?: number;
    username?: string;
    message_type?: 'text' | 'file';
};

type UserStatus = {
    user_id: number;
    username: string;
    is_online: boolean;
    last_seen?: string;
};

type Participant = {
    user_id: number;
    username: string;
    avatar?: string;
};

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type WSMessage = {
    type: 'message' | 'user_status' | 'typing' | 'error';
    user_id?: number;
    username?: string;
    message?: string;
    content?: string;
    is_online?: boolean;
    is_typing?: boolean;
    message_type?: 'text' | 'file';
};

export function DoctorChatPage() {
    const { id: roomId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = useDoctorAuthStore((s) => s.token);
    const doctor = useDoctorAuthStore((s) => s.doctor);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [userStatuses, setUserStatuses] = useState<Record<number, UserStatus>>({});
    const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

    // استیت‌های آپلود
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!token || !doctor) {
            navigate('/doctor/login');
        }
    }, [token, doctor, navigate]);

    // اسکرول نرم به پایین‌ترین نقطه
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // هر بار که آرایه پیام‌ها آپدیت می‌شود، به پایین اسکرول کن
    useEffect(() => {
        scrollToBottom();
    }, [messages, isUploading, typingUsers]);

    // دریافت تاریخچه پیام‌ها
    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('خطا در دریافت تاریخچه');

            const data = await response.json();
            if (data.messages && Array.isArray(data.messages)) {
                // مهم: اضافه کردن reverse() برای درست شدن ترتیب (قدیم به جدید)
                const reversedMessages = [...data.messages].reverse();

                const msgs = reversedMessages.map((m: any) => ({
                    id: m.id,
                    sender: m.user_id === doctor?.id ? 'user' : 'other',
                    message: m.message,
                    message_type: m.message_type || 'text',
                    time: new Date(m.created_at).toLocaleTimeString('fa-IR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    user_id: m.user_id,
                    username: undefined,
                }));
                setMessages(msgs);
            }
        } catch (error) {
            console.error('خطا در دریافت تاریخچه:', error);
            setErrorMsg('خطا در بارگذاری پیام‌ها');
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const fetchParticipants = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/participants`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('خطا در دریافت شرکت‌کنندگان');

            const data = await response.json();
            if (Array.isArray(data)) {
                setParticipants(data.map((p: any) => ({
                    user_id: p.user_id,
                    username: `بیمار`, // یا p.username در صورت وجود
                    avatar: undefined,
                })));
            }
        } catch (error) {
            console.error('خطا در دریافت شرکت‌کنندگان:', error);
        }
    };

    const connect = (authToken: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setConnectionStatus('connecting');
        const ws = new WebSocket(`wss://${WS_HOST}/ws/chat/${roomId}?token=${authToken}`);

        ws.onopen = () => {
            setConnectionStatus('connected');
            setErrorMsg(null);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        ws.onmessage = (event) => {
            try {
                const data: WSMessage = JSON.parse(event.data);

                if (data.type === 'message' && (data.message || data.content)) {
                    if (data.user_id === doctor?.id) return;

                    const newMsg: Message = {
                        id: Date.now(),
                        sender: 'other',
                        message: data.message || data.content || '',
                        message_type: data.message_type || 'text',
                        time: new Date().toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        user_id: data.user_id,
                        username: data.username,
                    };
                    setMessages((prev) => [...prev, newMsg]);

                    if (data.user_id) {
                        setTypingUsers((prev) => {
                            const next = new Set(prev);
                            next.delete(data.user_id!);
                            return next;
                        });
                    }

                } else if (data.type === 'user_status' && data.user_id) {
                    setUserStatuses((prev) => ({
                        ...prev,
                        [data.user_id!]: {
                            user_id: data.user_id!,
                            username: data.username || '',
                            is_online: data.is_online ?? false,
                        },
                    }));
                } else if (data.type === 'typing' && data.user_id && data.user_id !== doctor?.id) {
                    if (data.is_typing) {
                        setTypingUsers((prev) => new Set(prev).add(data.user_id!));
                    } else {
                        setTypingUsers((prev) => {
                            const next = new Set(prev);
                            next.delete(data.user_id!);
                            return next;
                        });
                    }
                }
            } catch (err) {
                console.error('خطا در پردازش پیام WebSocket:', err);
            }
        };

        ws.onerror = () => {
            setConnectionStatus('error');
            setErrorMsg('خطا در اتصال به سرور');
        };

        ws.onclose = () => {
            setConnectionStatus('disconnected');
            reconnectTimeoutRef.current = setTimeout(() => {
                if (token) connect(token);
            }, 3000);
        };

        wsRef.current = ws;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('room_id', String(roomId));

        try {
            const res = await fetch(`${UPLOAD_BASE}/api/chat/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                const fileUrl = data.file_url;

                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        type: 'message',
                        message: fileUrl,
                        message_type: 'file'
                    }));

                    const newMsg: Message = {
                        id: Date.now(),
                        sender: 'user',
                        message: fileUrl,
                        message_type: 'file',
                        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                        user_id: doctor?.id,
                    };
                    setMessages((prev) => [...prev, newMsg]);
                }
            } else {
                setErrorMsg('آپلود ناموفق بود.');
            }
        } catch (error) {
            console.error('خطا در آپلود:', error);
            setErrorMsg('خطا در ارتباط برای آپلود فایل');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const sendMessage = () => {
        const trimmed = newMessage.trim();
        if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: false }));
        wsRef.current.send(JSON.stringify({
            type: 'message',
            message: trimmed,
            message_type: 'text'
        }));

        const newMsg: Message = {
            id: Date.now(),
            sender: 'user',
            message: trimmed,
            message_type: 'text',
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            user_id: doctor?.id,
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage('');
    };

    const handleTyping = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: true }));
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: false }));
            }
        }, 1500);
    };

    const renderMessageContent = (msg: Message) => {
        if (msg.message_type === 'file') {
            const isImage = msg.message.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
            if (isImage) {
                return (
                    <a href={msg.message} target="_blank" rel="noreferrer" className="block mt-1">
                        <img
                            src={msg.message}
                            alt="تصویر پیوست"
                            className="max-w-[200px] sm:max-w-[240px] max-h-[240px] w-auto h-auto object-cover rounded-lg border border-black/10 shadow-sm bg-white/20"
                            onLoad={scrollToBottom}
                        />
                    </a>
                );
            }
            return (
                <a
                    href={msg.message}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-1 flex items-center gap-2 underline transition-opacity hover:opacity-80 ${msg.sender === 'user' ? 'text-blue-100' : 'text-blue-600'}`}
                >
                    <Paperclip className="h-5 w-5" />
                    <span className="text-sm">دانلود فایل پیوست</span>
                </a>
            );
        }
        return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>;
    };

    useEffect(() => {
        if (!token || !doctor || !roomId) return;

        fetchChatHistory();
        fetchParticipants();
        connect(token);

        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [token, doctor, roomId]);

    if (!token || !doctor) return null;

    const opponent = participants.find((p) => p.user_id !== doctor.id);
    const opponentStatus = opponent ? userStatuses[opponent.user_id] : null;
    const isOpponentTyping = opponent ? typingUsers.has(opponent.user_id) : false;

    return (
        // نکته مهم ساختاری: h-[100dvh] + flex-col + overflow-hidden باعث فیکس شدن هدر و فوتر می‌شود
        <div className="flex h-[100dvh] flex-col bg-slate-50 overflow-hidden" dir="rtl">

            {/* Header - فیکس شده با flex-shrink-0 */}
            <header className="flex-shrink-0 border-b bg-white px-4 py-3 shadow-sm z-20">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/provider/doctor/consultations')}
                            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                {opponent?.username || 'در حال بارگذاری...'}
                            </h1>
                            {opponentStatus && (
                                <p className="text-sm text-gray-500">
                                    {opponentStatus.is_online ? (
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                            آنلاین
                                        </span>
                                    ) : (
                                        'آفلاین'
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {connectionStatus === 'connecting' && (
                            <span className="flex items-center gap-2 text-sm text-yellow-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                در حال اتصال...
                            </span>
                        )}
                        {connectionStatus === 'connected' && (
                            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                        )}
                        {connectionStatus === 'error' && (
                            <span className="flex items-center gap-1 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                خطا
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* ارور بارگذاری */}
            {errorMsg && (
                <div className="flex-shrink-0 bg-red-50 p-2 text-center text-sm text-red-800 z-10 border-b border-red-100">
                    {errorMsg}
                </div>
            )}

            {/* Chat Content - قابلیت اسکرول با flex-1 و overflow-y-auto */}
            <main className="flex-1 overflow-y-auto px-4 py-4 relative scroll-smooth">
                <div className="mx-auto max-w-4xl flex flex-col space-y-3 pb-2">

                    {isLoadingHistory ? (
                        <ListRowsSkeleton rows={6} />
                    ) : messages.length === 0 ? (
                        <div className="py-12 flex items-center justify-center h-full">
                            <span className="bg-white/50 px-4 py-2 rounded-full text-sm text-gray-500 shadow-sm border border-gray-100">
                                هنوز پیامی ارسال نشده است
                            </span>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* حباب پیام با استایل نرم‌افزارهای چت واقعی */}
                                <div
                                    className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-sm'
                                            : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm'
                                    }`}
                                >
                                    {msg.sender === 'other' && msg.username && (
                                        <p className="mb-1 text-xs font-semibold text-blue-600">{msg.username}</p>
                                    )}

                                    {renderMessageContent(msg)}

                                    <div className={`flex justify-end mt-1`}>
                                        <span className={`text-[10px] ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Indicator وضعیت تایپ طرف مقابل */}
                    {isOpponentTyping && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-tl-sm">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <span className="animate-pulse">بیمار در حال نوشتن...</span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* رفرنسی که همیشه اسکرول به سمت آن کشیده می‌شود */}
                    <div ref={messagesEndRef} className="h-2 w-full" />
                </div>
            </main>

            {/* Footer / Input Area - فیکس شده با flex-shrink-0 */}
            <footer className="flex-shrink-0 border-t bg-white px-4 py-3 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                <div className="mx-auto flex max-w-4xl items-center gap-2">

                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*,application/pdf,.doc,.docx"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={connectionStatus !== 'connected' || isUploading}
                        className="text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-full p-2.5 transition-colors disabled:opacity-50 flex-shrink-0"
                        title="ارسال فایل"
                    >
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-blue-500" /> : <Paperclip className="h-5 w-5" />}
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder={isUploading ? "درحال آپلود..." : "پیام خود را بنویسید..."}
                        disabled={connectionStatus !== 'connected' || isUploading}
                        className="flex-1 rounded-full bg-gray-100 border-transparent px-5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition-all"
                    />

                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || connectionStatus !== 'connected' || isUploading}
                        className="rounded-full bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex-shrink-0 shadow-sm"
                    >
                        <Send className="h-5 w-5 relative right-0.5" />
                    </button>
                </div>
            </footer>
        </div>
    );
}