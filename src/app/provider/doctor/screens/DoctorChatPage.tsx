import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Send, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useDoctorAuthStore } from '../store/doctorAuthStore';

const API_BASE = 'http://185.222.163.113:4070';
const WS_HOST = '185.222.163.113:4070';

type Message = {
    id: number;
    sender: 'user' | 'other';
    message: string;
    time: string;
    user_id?: number;
    username?: string;
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

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // بررسی احراز هویت
    useEffect(() => {
        if (!token || !doctor) {
            navigate('/doctor/login');
        }
    }, [token, doctor, navigate]);

    // دریافت تاریخچه پیام‌ها
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
            if (data.messages) {
                const msgs = data.messages.map((m: any) => ({
                    id: m.id,
                    sender: m.user_id === doctor?.id ? 'user' : 'other',
                    message: m.message,
                    time: new Date(m.created_at).toLocaleTimeString('fa-IR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    user_id: m.user_id,
                    username: undefined, // API این فیلد رو نداره
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


    // دریافت اطلاعات شرکت‌کنندگان
    // دریافت اطلاعات شرکت‌کنندگان
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
                    username: `کاربر ${p.user_id}`, // API این فیلد رو نداره، از ID استفاده می‌کنیم
                    avatar: undefined,
                })));
            }
        } catch (error) {
            console.error('خطا در دریافت شرکت‌کنندگان:', error);
        }
    };


    // اتصال به WebSocket
    const connect = (authToken: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setConnectionStatus('connecting');
        const ws = new WebSocket(`ws://${WS_HOST}/ws/chat/${roomId}?token=${authToken}`);

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

                if (data.type === 'message' && data.message) {
                    const newMsg: Message = {
                        id: Date.now(),
                        sender: data.user_id === doctor?.id ? 'user' : 'other',
                        message: data.message || data.content || '',
                        time: new Date().toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        user_id: data.user_id,
                        username: data.username,
                    };
                    setMessages((prev) => [...prev, newMsg]);
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
            // تلاش مجدد برای اتصال
            reconnectTimeoutRef.current = setTimeout(() => {
                if (token) connect(token);
            }, 3000);
        };

        wsRef.current = ws;
    };

    // ارسال پیام
    const sendMessage = () => {
        const trimmed = newMessage.trim();
        if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        wsRef.current.send(JSON.stringify({ type: 'message', message: trimmed }));
        setNewMessage('');
    };

    // اطلاع از در حال تایپ بودن
    const handleTyping = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: true }));
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: false }));
            }
        }, 1000);
    };

    // اسکرول به انتهای پیام‌ها
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // بارگذاری اولیه
    useEffect(() => {
        if (!token || !doctor || !roomId) return;

        fetchChatHistory();
        fetchParticipants();
        connect(token);

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [token, doctor, roomId]);

    if (!token || !doctor) return null;

    const opponent = participants.find((p) => p.user_id !== doctor.id);
    const opponentStatus = opponent ? userStatuses[opponent.user_id] : null;
    const isOpponentTyping = opponent ? typingUsers.has(opponent.user_id) : false;

    return (
        <div className="flex h-screen flex-col bg-gray-50" dir="rtl">
            {/* Header */}
            <div className="border-b bg-white px-4 py-3 shadow-sm">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/provider/doctor/consultations')}
                            className="rounded-lg p-2 hover:bg-gray-100"
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

                    {/* وضعیت اتصال */}
                    <div className="flex items-center gap-2">
                        {connectionStatus === 'connecting' && (
                            <span className="flex items-center gap-2 text-sm text-yellow-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال اتصال...
              </span>
                        )}
                        {connectionStatus === 'connected' && (
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        )}
                        {connectionStatus === 'error' && (
                            <span className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                خطا
              </span>
                        )}
                    </div>
                </div>
            </div>

            {/* خطا */}
            {errorMsg && (
                <div className="mx-auto w-full max-w-4xl px-4 pt-4">
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMsg}</div>
                </div>
            )}

            {/* لیست پیام‌ها */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto max-w-4xl space-y-4">
                    {isLoadingHistory ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">هنوز پیامی ارسال نشده</div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-900 shadow-sm'
                                    }`}
                                >
                                    {msg.sender === 'other' && msg.username && (
                                        <p className="mb-1 text-xs font-medium text-gray-500">{msg.username}</p>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                    <p
                                        className={`mt-1 text-xs ${
                                            msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                                        }`}
                                    >
                                        {msg.time}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    {/* نمایش در حال تایپ */}
                    {isOpponentTyping && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl bg-gray-200 px-4 py-2">
                                <span className="text-sm text-gray-600">در حال نوشتن...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* فرم ارسال پیام */}
            <div className="border-t bg-white px-4 py-3">
                <div className="mx-auto flex max-w-4xl items-center gap-2">
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
                        placeholder="پیام خود را بنویسید..."
                        disabled={connectionStatus !== 'connected'}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                        className="rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
