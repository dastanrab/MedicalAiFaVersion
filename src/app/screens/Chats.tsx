import { useState, useEffect, useRef, useCallback, useMemo, JSX } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Paperclip,
  Loader2,
  RefreshCw,
  Search,
  CheckCheck,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { PageLoader } from '../components/PageLoader';
import { goBack } from '../navigation/appHistory';
import { ListRowsSkeleton } from '../components/PageSkeleton';
import { useAuthStore } from '../store/authStore';

const WS_HOST = 'chat.mediraai.com';
const API_BASE = 'https://api.mediraai.com';
const MAX_RECONNECT_ATTEMPTS = 10;
const TYPING_THROTTLE_MS = 500;

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: 'system' | 'alert' | 'info';
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'پذیرش بیمار جدید', description: 'بیمار علی حسینی پذیرش شد.', time: '10:00', isRead: false, type: 'info' },
  { id: 2, title: 'جواب آزمایش', description: 'جواب آزمایش بیمار مریم احمدی آماده است.', time: '12:30', isRead: false, type: 'alert' },
  { id: 3, title: 'به‌روزرسانی سیستم', description: 'سیستم امشب ساعت 24 به‌روزرسانی می‌شود.', time: 'دیروز', isRead: true, type: 'system' },
];

type Message = {
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

type Opponent = {
  id: number;
  name: string;
  role: string;
  avatar: string | null;
  is_online: boolean;
  last_seen: string | null;
};

type ChatRoom = {
  room_id: number;
  room_name: string;
  last_message: string | null;
  last_message_time: string | null;
  room_created_at: string;
  opponent: Opponent;
  unreadCount?: number;
};

type UserStatus = {
  user_id: number;
  username: string;
  is_online: boolean;
  last_seen?: string;
};

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const getInitials = (name: string) => {
  if (!name) return 'کاربر';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
  return name.substring(0, 2);
};

const renderLastMessage = (msg: string | null) => {
  if (!msg) return 'هنوز پیامی ارسال نشده';
  if (msg.startsWith('http://') || msg.startsWith('https://')) return '📎 فایل ارسال شده';
  return msg;
};

export function Chats() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [userId, setUserId] = useState<number | null>(null);
  const userIdRef = useRef<number | null>(null);

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const activeRoomIdRef = useRef<number | null>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRefMobile = useRef<HTMLInputElement>(null);
  const fileInputRefDesktop = useRef<HTMLInputElement>(null);

  const [onlineUsers, setOnlineUsers] = useState<Map<number, UserStatus>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(1);
  const tempIdRef = useRef(-1);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);
  const messageIdsRef = useRef<Set<number>>(new Set());
  const lastTypingSentRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUploading, typingUsers]);

  const fetchRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const res = await fetch(`${API_BASE}/api/user/chat/rooms`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('خطا در دریافت لیست چت‌ها');
      const json = await res.json();
      if (json.success && json.data?.rooms) {
        setRooms(json.data.rooms.map((r: ChatRoom) => ({ ...r, unreadCount: 0 })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchChatHistory = async (roomId: number) => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch(`https://${WS_HOST}/api/chat/rooms/${roomId}/messages?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.messages ?? [];

      messageIdsRef.current.clear();

      setMessages(
          [...list].reverse().map((msg: any) => {
            messageIdsRef.current.add(msg.id);
            const date = msg.created_at ? new Date(msg.created_at) : new Date();
            return {
              id: msg.id,
              sender: msg.user_id === userIdRef.current ? 'user' : 'other',
              message: msg.message || '',
              message_type: msg.message_type || 'text',
              time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
              user_id: msg.user_id,
              username: msg.username,
              status: 'sent',
            };
          })
      );
    } catch {
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchParticipants = async (roomId: number) => {
    try {
      const res = await fetch(`https://${WS_HOST}/api/chat/rooms/${roomId}/participants`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      const participants = Array.isArray(data) ? data : data.participants ?? [];
      const statusMap = new Map<number, UserStatus>();
      participants.forEach((p: any) => {
        statusMap.set(p.user_id, {
          user_id: p.user_id,
          username: p.username,
          is_online: p.is_online ?? false,
          last_seen: p.last_seen,
        });
      });
      setOnlineUsers(statusMap);

      setRooms((prev) =>
          prev.map((r) => {
            const status = statusMap.get(r.opponent.id);
            if (status) {
              return { ...r, opponent: { ...r.opponent, is_online: status.is_online } };
            }
            return r;
          })
      );
    } catch {
      /* silent */
    }
  };

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    if (isTyping && now - lastTypingSentRef.current < TYPING_THROTTLE_MS) {
      return;
    }

    lastTypingSentRef.current = now;
    wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (typingThrottleRef.current) clearTimeout(typingThrottleRef.current);

    typingThrottleRef.current = setTimeout(() => {
      sendTypingIndicator(true);
    }, 100);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  const connect = useCallback((token: string, roomId: number) => {
    if (isUnmountedRef.current) return;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      wsRef.current.close();
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setStatus('connecting');
    setErrorMsg('');

    const protocol = 'wss'
    const ws = new WebSocket(`${protocol}://${WS_HOST}/ws/chat/${roomId}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isUnmountedRef.current) {
        ws.close();
        return;
      }
      setStatus('connected');
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      if (isUnmountedRef.current) return;

      try {
        const data = JSON.parse(event.data);

        if (data.type === 'message_ack') {
          setMessages((prev) =>
              prev.map((msg) =>
                  msg.tempId === data.temp_id
                      ? { ...msg, id: data.message_id, status: 'sent' as const, tempId: undefined }
                      : msg
              )
          );
          if (data.message_id) {
            messageIdsRef.current.add(data.message_id);
          }
          return;
        }

        if (data.type === 'user_status') {
          const statusUpdate: UserStatus = {
            user_id: data.user_id,
            username: data.username,
            is_online: data.is_online ?? false,
            last_seen: data.last_seen,
          };

          setOnlineUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(data.user_id, statusUpdate);
            return newMap;
          });

          setRooms((prev) =>
              prev.map((r) =>
                  r.opponent.id === data.user_id
                      ? { ...r, opponent: { ...r.opponent, is_online: data.is_online ?? false } }
                      : r
              )
          );
          return;
        }

        if (data.type === 'typing') {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.is_typing) {
              newSet.add(data.user_id);
              const existingTimer = typingTimersRef.current.get(data.user_id);
              if (existingTimer) clearTimeout(existingTimer);

              const timer = setTimeout(() => {
                setTypingUsers((p) => {
                  const s = new Set(p);
                  s.delete(data.user_id);
                  return s;
                });
                typingTimersRef.current.delete(data.user_id);
              }, 3000);

              typingTimersRef.current.set(data.user_id, timer);
            } else {
              newSet.delete(data.user_id);
              const existingTimer = typingTimersRef.current.get(data.user_id);
              if (existingTimer) {
                clearTimeout(existingTimer);
                typingTimersRef.current.delete(data.user_id);
              }
            }
            return newSet;
          });
          return;
        }

        if (data.type === 'message') {
          if (data.user_id && userIdRef.current && data.user_id === userIdRef.current) return;
          if (data.id && messageIdsRef.current.has(data.id)) return;

          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.user_id);
            return newSet;
          });

          const existingTimer = typingTimersRef.current.get(data.user_id);
          if (existingTimer) {
            clearTimeout(existingTimer);
            typingTimersRef.current.delete(data.user_id);
          }

          const newMessage: Message = {
            id: data.id || msgIdRef.current++,
            sender: 'other',
            message: data.message || data.content || '',
            message_type: data.message_type || 'text',
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            user_id: data.user_id,
            username: data.username,
            status: 'sent',
          };

          if (data.id) messageIdsRef.current.add(data.id);

          setMessages((prev) => [...prev, newMessage]);

          setRooms((prev) =>
              prev.map(r =>
                  r.room_id === roomId
                      ? { ...r, last_message: newMessage.message, last_message_time: newMessage.time }
                      : r
              )
          );
        }
      } catch {
        /* silent */
      }
    };

    ws.onerror = () => {
      if (isUnmountedRef.current) return;
      setStatus('error');
      setErrorMsg('خطا در اتصال');
    };

    ws.onclose = (e) => {
      if (isUnmountedRef.current) return;

      setStatus('disconnected');

      if (e.code === 1008 || e.code === 4001) {
        setErrorMsg('توکن نامعتبر');
        navigate('/');
      } else if (e.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        setErrorMsg('اتصال قطع شد');

        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);

        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current && accessToken && activeRoomIdRef.current) {
            connect(accessToken, activeRoomIdRef.current);
          }
        }, delay);
      } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setErrorMsg('تلاش‌های اتصال مجدد به پایان رسید');
      }
    };
  }, [accessToken, navigate]);

  const fetchProfile = async () => {
    if (!accessToken) {
      navigate('/');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.success) throw new Error();

      userIdRef.current = data.data.user.id;
      setUserId(data.data.user.id);

      await fetchRooms();

    } catch {
      navigate('/');
    }
  };

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
      return;
    }

    isUnmountedRef.current = false;
    fetchProfile();

    return () => {
      isUnmountedRef.current = true;

      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingThrottleRef.current) clearTimeout(typingThrottleRef.current);

      typingTimersRef.current.forEach((timer) => clearTimeout(timer));
      typingTimersRef.current.clear();

      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.onopen = null;
        wsRef.current.close();
      }
    };
  }, [accessToken, navigate]);

  const sendMessage = useCallback(() => {
    if (!message.trim() || wsRef.current?.readyState !== WebSocket.OPEN) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingThrottleRef.current) {
      clearTimeout(typingThrottleRef.current);
      typingThrottleRef.current = null;
    }

    sendTypingIndicator(false);

    const tempId = tempIdRef.current--;
    const newMessage: Message = {
      id: tempId,
      tempId,
      sender: 'user',
      message: message.trim(),
      message_type: 'text',
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      user_id: userIdRef.current ?? undefined,
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      wsRef.current.send(JSON.stringify({
        message: message.trim(),
        message_type: 'text',
        temp_id: tempId
      }));
    } catch {
      setMessages((prev) =>
          prev.map((msg) => (msg.tempId === tempId ? { ...msg, status: 'failed' as const } : msg))
      );
    }

    setMessage('');
  }, [message, sendTypingIndicator]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoomIdRef.current) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('room_id', String(activeRoomIdRef.current));

    try {
      const res = await fetch(`${API_BASE}/api/chat/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        const fileUrl = data.file_url;
        const tempId = tempIdRef.current--;

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            message: fileUrl,
            message_type: 'file',
            temp_id: tempId
          }));

          const newMsg: Message = {
            id: tempId,
            tempId,
            sender: 'user',
            message: fileUrl,
            message_type: 'file',
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            user_id: userIdRef.current ?? undefined,
            status: 'sent',
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      } else {
        setErrorMsg('سرور در ذخیره فایل با خطا مواجه شد');
      }
    } catch (error) {
      console.error('آپلود ناموفق:', error);
      setErrorMsg('خطا در ارتباط برای آپلود فایل');
    } finally {
      setIsUploading(false);
      if (fileInputRefMobile.current) fileInputRefMobile.current.value = '';
      if (fileInputRefDesktop.current) fileInputRefDesktop.current.value = '';
    }
  };

  const retryFailedMessage = useCallback((tempId: number) => {
    const failedMsg = messages.find((m) => m.tempId === tempId && m.status === 'failed');
    if (!failedMsg || wsRef.current?.readyState !== WebSocket.OPEN) return;

    setMessages((prev) =>
        prev.map((msg) => (msg.tempId === tempId ? { ...msg, status: 'sent' as const } : msg))
    );

    try {
      wsRef.current.send(JSON.stringify({
        message: failedMsg.message,
        message_type: failedMsg.message_type || 'text',
        temp_id: tempId
      }));
    } catch {
      setMessages((prev) =>
          prev.map((msg) => (msg.tempId === tempId ? { ...msg, status: 'failed' as const } : msg))
      );
    }
  }, [messages]);

  const handleBackToChatList = () => {
    setIsSidebarOpen(true);
    setActiveRoomId(null);
    activeRoomIdRef.current = null;
    if (wsRef.current) wsRef.current.close();
  };

  const handleRoomSelect = async (roomId: number) => {
    if (activeRoomId === roomId) return;

    if (wsRef.current) wsRef.current.close();
    setMessages([]);
    setTypingUsers(new Set());
    setErrorMsg('');
    setStatus('disconnected');

    setActiveRoomId(roomId);
    activeRoomIdRef.current = roomId;

    if (!isMobile) {
      setIsSidebarOpen(false);
    }

    setRooms((prev) => prev.map((r) => (r.room_id === roomId ? { ...r, unreadCount: 0 } : r)));

    await fetchChatHistory(roomId);
    await fetchParticipants(roomId);

    if (accessToken) {
      connect(accessToken, roomId);
    }
  };

  const handleManualReconnect = () => {
    reconnectAttemptsRef.current = 0;
    if (accessToken && activeRoomIdRef.current) {
      fetchChatHistory(activeRoomIdRef.current).then(() => {
        fetchParticipants(activeRoomIdRef.current!).then(() => connect(accessToken, activeRoomIdRef.current!));
      });
    }
  };

  const renderMessageContent = (msg: Message) => {
    const safeMessage = msg.message || '';
    if (msg.message_type === 'file') {
      const isImage = safeMessage.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
      if (isImage) {
        return (
            <a href={safeMessage} target="_blank" rel="noreferrer" className="block mt-1">
              <img
                  src={safeMessage}
                  alt="پیوست"
                  className="max-w-[200px] sm:max-w-[240px] max-h-[240px] w-auto h-auto object-contain rounded-lg border border-black/10 shadow-sm bg-white/20"
                  onLoad={scrollToBottom}
              />
            </a>
        );
      }
      return (
          <a
              href={safeMessage}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2 underline mt-1 hover:opacity-80 transition-opacity min-w-0 ${msg.sender === 'user' ? 'text-white' : 'text-blue-600'}`}
          >
            <Paperclip className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">دانلود فایل پیوست</span>
          </a>
      );
    }
    return <p className="text-right break-words whitespace-pre-wrap">{safeMessage}</p>;
  };

  const selectedRoomData = rooms.find((r) => r.room_id === activeRoomId);

  const filteredRooms = useMemo(
      () => rooms.filter((r) => r.opponent.name.toLowerCase().includes(searchQuery.toLowerCase())),
      [rooms, searchQuery]
  );

  const dot = {
    connected: 'bg-green-400',
    connecting: 'bg-yellow-400',
    disconnected: 'bg-gray-300',
    error: 'bg-red-400',
  }[status];

  const TypingIndicator = useMemo(() => {
    return () => {
      const typingUsersList = Array.from(typingUsers);
      if (typingUsersList.length === 0) return <div className="h-6" />;

      const typingUsernames = typingUsersList
          .map((uid) => {
            const room = rooms.find((r) => r.opponent.id === uid);
            return room?.opponent.name || onlineUsers.get(uid)?.username || 'مخاطب';
          })
          .join('، ');

      return (
          <div className="h-6 px-3 py-1 text-xs text-gray-400 italic animate-pulse">
            {typingUsernames} در حال نوشتن...
          </div>
      );
    };
  }, [typingUsers, rooms, onlineUsers]);

  if (isLoadingRooms)
    return (
        <div className="min-h-screen bg-white">
          <PageLoader variant="chat" showAppBar backTo="/home" />
        </div>
    );

  // ===================== حالت موبایل =====================
  if (isMobile && activeRoomId) {
    return (
        <div className="flex flex-col h-[100dvh] bg-white overflow-hidden" dir="rtl">
          <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0 shadow-sm z-10 bg-white">
            <button
                onClick={handleBackToChatList}
                aria-label="بازگشت"
                className="text-gray-400 hover:text-gray-600 p-2"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{selectedRoomData?.opponent.name}</p>
                <p className="text-xs text-gray-400">{selectedRoomData?.opponent.is_online ? 'آنلاین' : 'آفلاین'}</p>
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm font-medium overflow-hidden">
                  {selectedRoomData?.opponent.avatar ? (
                      <img src={selectedRoomData.opponent.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                      getInitials(selectedRoomData?.opponent.name || '')
                  )}
                </div>
                {selectedRoomData?.opponent.is_online && (
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
                )}
              </div>
            </div>
          </div>

          {errorMsg && (
              <div className="bg-red-50 px-3 py-2 text-xs text-red-500 text-center flex items-center justify-center gap-2 flex-shrink-0 z-10">
                <AlertCircle className="w-3 h-3" />
                {errorMsg}
                {status !== 'connected' && status !== 'connecting' && (
                    <button onClick={handleManualReconnect} className="underline inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> تلاش مجدد
                    </button>
                )}
              </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50/40 scroll-smooth relative">
            {isLoadingHistory && <ListRowsSkeleton rows={5} />}
            {!isLoadingHistory && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                  <Send className="w-8 h-8 -scale-x-100" />
                  <p className="text-sm">هنوز پیامی نیست</p>
                </div>
            )}
            {messages.map((msg) => (
                <div key={msg.tempId || msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div
                      className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                          msg.sender === 'user'
                              ? 'bg-blue-500 text-white rounded-tr-sm'
                              : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                      }`}
                  >

                    {renderMessageContent(msg)}

                    <div className="flex items-center justify-start gap-1 mt-1">
                      <span className={`text-[10px] ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {msg.time}
                      </span>
                      {msg.sender === 'user' && (
                          <>
                            {msg.status === 'sending' && <Loader2 className="w-3 h-3 animate-spin text-blue-200" />}
                            {msg.status === 'sent' && <CheckCheck className="w-3 h-3 text-blue-200" />}
                            {msg.status === 'failed' && (
                                <button
                                    onClick={() => msg.tempId && retryFailedMessage(msg.tempId)}
                                    className="text-xs text-red-300 underline"
                                >
                                  تلاش مجدد
                                </button>
                            )}
                          </>
                      )}
                    </div>
                  </div>
                </div>
            ))}
            <TypingIndicator />
            <div ref={messagesEndRef} className="h-2 w-full" />
          </div>

          <div className="flex-shrink-0 px-3 pt-3 pb-[100px] border-t border-gray-100 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10 flex items-center gap-2">
            <input
                type="file"
                className="hidden"
                ref={fileInputRefMobile}
                onChange={handleFileUpload}
                accept="image/*,application/pdf,.doc,.docx"
            />

            <button
                onClick={sendMessage}
                disabled={status !== 'connected' || !message.trim() || isUploading}
                aria-label="ارسال پیام"
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white p-2.5 rounded-full flex-shrink-0 transition-colors"
            >
              <Send className="w-4 h-4 relative right-0.5 -scale-x-100" />
            </button>
            <Input
                value={message}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={isUploading ? 'درحال آپلود...' : status === 'connected' ? 'پیام خود را بنویسید...' : 'در انتظار اتصال...'}
                disabled={status !== 'connected' || isUploading}
                className="flex-1 text-sm h-10 rounded-full bg-gray-50 border-transparent focus:bg-white px-4 text-right"
            />
            <button
                aria-label="پیوست فایل"
                onClick={() => fileInputRefMobile.current?.click()}
                disabled={status !== 'connected' || isUploading}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-2 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Paperclip className="w-5 h-5" />}
            </button>
          </div>
        </div>
    );
  }

  // ===================== حالت دسکتاپ =====================
  return (
      <div className="flex h-[100dvh] bg-white overflow-hidden" dir="rtl">
        <div className={`${isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'} transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden flex flex-col border-l border-gray-100 bg-white relative z-20`}>
          <div className="w-72 h-full flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <button
                    onClick={() => goBack(navigate, '/home')}
                    aria-label="بازگشت به خانه"
                    className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                  <button
                      onClick={() => setActiveTab('messages')}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                          activeTab === 'messages' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    پیام‌ها
                  </button>
                  <button
                      onClick={() => setActiveTab('notifications')}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                          activeTab === 'notifications' ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                      }`}
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
                              className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-50 transition-colors ${
                                  activeRoomId === room.room_id ? 'bg-blue-50/50' : ''
                              }`}
                          >
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm font-medium overflow-hidden">
                                {room.opponent.avatar ? (
                                    <img src={room.opponent.avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(room.opponent.name)
                                )}
                              </div>
                              {room.opponent.is_online && (
                                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-gray-800 truncate">
                                  {room.opponent.name}
                                </span>
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
                  ) : (
                      <p className="text-xs text-center mt-6 text-gray-400">گفتگویی یافت نشد.</p>
                  )
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
                        <p className="text-xs text-gray-500 text-right leading-relaxed mr-4">
                          {notif.description}
                        </p>
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {!isMobile && (
            <div className="flex-1 flex flex-col bg-gray-50/40 relative min-w-0">
              {activeRoomId ? (
                  <>
                    <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between z-10 shadow-sm">
                      <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <button
                                onClick={handleBackToChatList}
                                className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                                title="نمایش لیست گفتگوها"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm font-medium overflow-hidden">
                            {selectedRoomData?.opponent.avatar ? (
                                <img src={selectedRoomData.opponent.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                getInitials(selectedRoomData?.opponent.name || '')
                            )}
                          </div>

                          {selectedRoomData?.opponent.is_online && (
                              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {selectedRoomData?.opponent.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {selectedRoomData?.opponent.is_online ? 'آنلاین' : 'آفلاین'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Users className="w-4 h-4" />
                        {onlineUsers.size}
                      </div>
                    </div>

                    {errorMsg && (
                        <div className="flex-shrink-0 bg-red-50 px-3 py-2 text-xs text-red-500 text-center flex items-center justify-center gap-2 z-10">
                          <AlertCircle className="w-3 h-3" />
                          {errorMsg}

                          {status !== 'connected' && status !== 'connecting' && (
                              <button
                                  onClick={handleManualReconnect}
                                  className="underline inline-flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                تلاش مجدد
                              </button>
                          )}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 relative scroll-smooth">
                      {isLoadingHistory && <ListRowsSkeleton rows={6} />}

                      {!isLoadingHistory && messages.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
                            <Send className="w-12 h-12 opacity-50 -scale-x-100" />
                            <p className="text-sm">هنوز پیامی وجود ندارد</p>
                          </div>
                      )}

                      {messages.map((msg) => (
                          <div
                              key={msg.tempId || msg.id}
                              className={`flex ${
                                  msg.sender === 'user' ? 'justify-start' : 'justify-end'
                              }`}
                          >
                            <div
                                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                    msg.sender === 'user'
                                        ? 'bg-blue-500 text-white rounded-tr-sm'
                                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                                }`}
                            >

                              {renderMessageContent(msg)}

                              <div className="flex items-center gap-1 mt-1 justify-start">
                                  <span className={`text-[10px] ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {msg.time}
                                  </span>

                                {msg.sender === 'user' && (
                                    <>
                                      {msg.status === 'sending' && (
                                          <Loader2 className="w-3 h-3 animate-spin text-blue-100" />
                                      )}
                                      {msg.status === 'sent' && (
                                          <CheckCheck className="w-3 h-3 text-blue-100" />
                                      )}
                                      {msg.status === 'failed' && (
                                          <button
                                              onClick={() => msg.tempId && retryFailedMessage(msg.tempId)}
                                              className="text-[10px] text-red-200 underline"
                                          >
                                            ارسال مجدد
                                          </button>
                                      )}
                                    </>
                                )}
                              </div>
                            </div>
                          </div>
                      ))}

                      <TypingIndicator />

                      <div ref={messagesEndRef} className="h-4 w-full" />
                    </div>

                    <div className="flex-shrink-0 border-t border-gray-100 bg-white mb-20 px-6 py-4 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
                      <input
                          type="file"
                          className="hidden"
                          ref={fileInputRefDesktop}
                          onChange={handleFileUpload}
                          accept="image/*,application/pdf,.doc,.docx"
                      />

                      <button
                          aria-label="پیوست فایل"
                          onClick={() => fileInputRefDesktop.current?.click()}
                          disabled={status !== 'connected' || isUploading}
                          className="text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-full p-2.5 transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Paperclip className="w-5 h-5" />}
                      </button>

                      <Input
                          value={message}
                          onChange={handleInputChange}
                          onKeyDown={(e) =>
                              e.key === 'Enter' && !e.shiftKey && sendMessage()
                          }
                          placeholder={isUploading ? 'درحال آپلود...' : status === 'connected' ? 'پیام خود را بنویسید...' : 'در انتظار اتصال...'}
                          disabled={status !== 'connected' || isUploading}
                          className="flex-1 text-right h-11 rounded-full bg-gray-50 border-transparent focus:bg-white px-5"
                      />

                      <button
                          onClick={sendMessage}
                          disabled={status !== 'connected' || !message.trim() || isUploading}
                          aria-label="ارسال پیام"
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors flex-shrink-0 shadow-sm"
                      >
                        <Send className="w-5 h-5 relative right-0.5 -scale-x-100" />
                      </button>
                    </div>
                  </>
              ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-300">
                    <div className="flex flex-col items-center gap-4 bg-white/50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                      <Users className="w-12 h-12 text-gray-200" />
                      <p className="text-sm text-gray-400">یک گفتگو را برای شروع انتخاب کنید</p>
                    </div>
                  </div>
              )}
            </div>
        )}
      </div>
  );
}