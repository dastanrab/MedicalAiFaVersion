import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
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
import { useAuthStore } from '../store/authStore';

const ROOM_ID = 1;
const WS_HOST = '185.222.163.113:4070';
const API_BASE = 'http://185.222.163.113:7000';
const MAX_RECONNECT_ATTEMPTS = 10;
const TYPING_THROTTLE_MS = 500;

type Message = {
  id: number;
  sender: 'user' | 'other';
  message: string;
  time: string;
  user_id?: number;
  username?: string;
  status?: 'sending' | 'sent' | 'failed';
  tempId?: number;
};

type User = {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
};

type UserStatus = {
  user_id: number;
  username: string;
  is_online: boolean;
  last_seen?: string;
};

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const MOCK_USERS: User[] = [
  { id: 1, name: 'دکتر علی محمدی', avatar: 'AM', isOnline: true, unreadCount: 3, lastMessage: 'سلام، چطور می‌تونم کمک کنم؟', lastMessageTime: '10:45' },
  { id: 2, name: 'مهندس مریم کریمی', avatar: 'MK', isOnline: true, unreadCount: 0, lastMessage: 'فایل پروژه رو براتون فرستادم', lastMessageTime: 'دیروز' },
  { id: 3, name: 'پشتیبانی فنی', avatar: 'PS', isOnline: false, unreadCount: 12, lastMessage: 'مشکل شما بررسی شد', lastMessageTime: 'سه‌شنبه' },
  { id: 4, name: 'مدیریت سیستم', avatar: 'MS', isOnline: true, unreadCount: 0, lastMessage: 'گزارش ماهانه آماده است', lastMessageTime: '10:30' },
  { id: 5, name: 'تیم توسعه', avatar: 'TD', isOnline: true, unreadCount: 7, lastMessage: 'جلسه فردا ساعت ۱۰', lastMessageTime: 'دیروز' },
];

export function Chats() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [userId, setUserId] = useState<number | null>(null);
  const userIdRef = useRef<number | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch(`http://${WS_HOST}/api/chat/rooms/${ROOM_ID}/messages?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.messages ?? [];

      messageIdsRef.current.clear();

      setMessages(
          list.map((msg: any) => {
            messageIdsRef.current.add(msg.id);
            const date = msg.created_at ? new Date(msg.created_at) : new Date();
            return {
              id: msg.id,
              sender: msg.user_id === userIdRef.current ? 'user' : 'other',
              message: msg.message,
              time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
              user_id: msg.user_id,
              username: msg.username,
              status: 'sent',
            };
          })
      );
    } catch {
      /* silent */
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`http://${WS_HOST}/api/chat/rooms/${ROOM_ID}/participants`, {
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

      setUsers((prev) =>
          prev.map((u) => {
            const status = statusMap.get(u.id);
            return status ? { ...u, isOnline: status.is_online } : u;
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

    if (typingThrottleRef.current) {
      clearTimeout(typingThrottleRef.current);
    }

    typingThrottleRef.current = setTimeout(() => {
      sendTypingIndicator(true);
    }, 100);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  const connect = useCallback((token: string) => {
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

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${WS_HOST}/ws/chat/${ROOM_ID}?token=${encodeURIComponent(token)}`);
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

          setUsers((prev) =>
              prev.map((u) => (u.id === data.user_id ? { ...u, isOnline: data.is_online ?? false } : u))
          );
          return;
        }

        if (data.type === 'typing') {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.is_typing) {
              newSet.add(data.user_id);

              const existingTimer = typingTimersRef.current.get(data.user_id);
              if (existingTimer) {
                clearTimeout(existingTimer);
              }

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

          if (data.id && messageIdsRef.current.has(data.id)) {
            return;
          }

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
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            user_id: data.user_id,
            username: data.username,
            status: 'sent',
          };

          if (data.id) {
            messageIdsRef.current.add(data.id);
          }

          setMessages((prev) => [...prev, newMessage]);
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
          if (!isUnmountedRef.current && accessToken) {
            connect(accessToken);
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
      await fetchChatHistory();
      await fetchParticipants();
      connect(accessToken);
    } catch {
      navigate('/');
    } finally {
      setIsLoadingProfile(false);
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

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingThrottleRef.current) {
        clearTimeout(typingThrottleRef.current);
      }
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
  }, [accessToken, navigate, connect]);

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
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      user_id: userIdRef.current ?? undefined,
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      wsRef.current.send(JSON.stringify({
        message: message.trim(),
        temp_id: tempId
      }));
    } catch {
      setMessages((prev) =>
          prev.map((msg) => (msg.tempId === tempId ? { ...msg, status: 'failed' as const } : msg))
      );
    }

    setMessage('');
  }, [message, sendTypingIndicator]);

  const retryFailedMessage = useCallback((tempId: number) => {
    const failedMsg = messages.find((m) => m.tempId === tempId && m.status === 'failed');
    if (!failedMsg || wsRef.current?.readyState !== WebSocket.OPEN) return;

    setMessages((prev) =>
        prev.map((msg) => (msg.tempId === tempId ? { ...msg, status: 'sending' as const } : msg))
    );

    try {
      wsRef.current.send(JSON.stringify({
        message: failedMsg.message,
        temp_id: tempId
      }));
    } catch {
      setMessages((prev) =>
          prev.map((msg) => (msg.tempId === tempId ? { ...msg, status: 'failed' as const } : msg))
      );
    }
  }, [messages]);

  const handleUserSelect = (id: number) => {
    setSelectedUser(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, unreadCount: 0 } : u)));
  };

  const handleManualReconnect = () => {
    reconnectAttemptsRef.current = 0;
    if (accessToken) {
      fetchChatHistory().then(() => {
        fetchParticipants().then(() => connect(accessToken));
      });
    }
  };

  const selectedUserData = users.find((u) => u.id === selectedUser);
  const filteredUsers = useMemo(
      () => users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase())),
      [users, searchQuery]
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
      if (typingUsersList.length === 0) return null;

      const typingUsernames = typingUsersList
          .map((uid) => {
            const user = users.find((u) => u.id === uid);
            return user?.name || onlineUsers.get(uid)?.username || 'کاربر';
          })
          .join('، ');

      return (
          <div className="px-3 py-1 text-xs text-gray-400 italic">
            {typingUsernames} در حال نوشتن...
          </div>
      );
    };
  }, [typingUsers, users, onlineUsers]);

  if (isLoadingProfile)
    return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
    );

  if (isMobile && selectedUser) {
    return (
        <div className="flex flex-col h-screen bg-white" dir="rtl">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <button
                onClick={() => setSelectedUser(null)}
                aria-label="بازگشت"
                className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{selectedUserData?.name}</p>
                <p className="text-xs text-gray-400">{selectedUserData?.isOnline ? 'آنلاین' : 'آفلاین'}</p>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs font-medium">
                  {selectedUserData?.avatar}
                </div>
                {selectedUserData?.isOnline && (
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-green-400 rounded-full border border-white" />
                )}
              </div>
            </div>
          </div>

          {errorMsg && (
              <div className="bg-red-50 px-3 py-2 text-xs text-red-500 text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-3 h-3" />
                {errorMsg}
                {status !== 'connected' && status !== 'connecting' && (
                    <button onClick={handleManualReconnect} className="underline inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> تلاش مجدد
                    </button>
                )}
              </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50/40">
            {isLoadingHistory && (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                </div>
            )}
            {!isLoadingHistory && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                  <Send className="w-8 h-8" />
                  <p className="text-sm">هنوز پیامی نیست</p>
                </div>
            )}
            {messages.map((msg) => (
                <div key={msg.tempId || msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          msg.sender === 'user'
                              ? 'bg-blue-500 text-white rounded-tl-sm'
                              : 'bg-white text-gray-800 rounded-tr-sm border border-gray-100'
                      }`}
                  >
                    <p className="text-right break-words">{msg.message}</p>
                    <div className="flex items-center justify-start gap-1 mt-1">
                  <span className={`text-xs ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                      {msg.sender === 'user' && (
                          <>
                            {/*{msg.status === 'sending' && <Loader2 className="w-3 h-3 text-blue-200 animate-spin" />}*/}
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
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 border-t border-gray-100 bg-white flex items-center gap-2">
            <button
                onClick={sendMessage}
                disabled={status !== 'connected' || !message.trim()}
                aria-label="ارسال پیام"
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white p-2 rounded-full flex-shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
            <Input
                value={message}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={status === 'connected' ? 'پیام...' : 'در انتظار اتصال...'}
                disabled={status !== 'connected'}
                className="flex-1 text-sm h-9 text-right"
            />
            <button aria-label="پیوست فایل" className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="flex h-screen bg-white" dir="rtl">
        <div className={`${isMobile ? 'w-full' : 'w-72'} flex-shrink-0 flex flex-col border-l border-gray-100`}>
          <div className="px-4 py-3 border-b border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <button
                  onClick={() => navigate('/home')}
                  aria-label="بازگشت"
                  className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-800">پیام‌ها</span>
              <div className={`w-2 h-2 rounded-full ${dot}`} title={status} />
            </div>
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو..."
                  className="pr-8 text-xs h-8 bg-gray-50 border-0 focus-visible:ring-0 text-right"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => (
                <button
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-50 transition-colors ${
                        selectedUser === user.id ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs font-medium">
                      {user.avatar}
                    </div>
                    {user.isOnline && (
                        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {user.name}
                  </span>

                      {user.lastMessageTime && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {user.lastMessageTime}
                    </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-gray-400 truncate">
                        {typingUsers.has(user.id)
                            ? 'در حال نوشتن...'
                            : user.lastMessage}
                      </p>

                      {user.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center px-1">
                      {user.unreadCount}
                    </span>
                      )}
                    </div>
                  </div>
                </button>
            ))}
          </div>
        </div>

        {!isMobile && (
            <div className="flex-1 flex flex-col bg-gray-50/40">
              {selectedUser ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm font-medium">
                            {selectedUserData?.avatar}
                          </div>

                          {selectedUserData?.isOnline && (
                              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {selectedUserData?.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {selectedUserData?.isOnline ? 'آنلاین' : 'آفلاین'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Users className="w-4 h-4" />
                        {onlineUsers.size}
                      </div>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-50 px-3 py-2 text-xs text-red-500 text-center flex items-center justify-center gap-2">
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

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                      {isLoadingHistory && (
                          <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                          </div>
                      )}

                      {!isLoadingHistory && messages.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                            <Send className="w-10 h-10" />
                            <p className="text-sm">هنوز پیامی وجود ندارد</p>
                          </div>
                      )}

                      {messages.map((msg) => (
                          <div
                              key={msg.tempId || msg.id}
                              className={`flex ${
                                  msg.sender === 'user'
                                      ? 'justify-start'
                                      : 'justify-end'
                              }`}
                          >
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                                    msg.sender === 'user'
                                        ? 'bg-blue-500 text-white rounded-tl-sm'
                                        : 'bg-white text-gray-800 rounded-tr-sm border border-gray-100'
                                }`}
                            >
                              <p className="break-words leading-6 text-right">
                                {msg.message}
                              </p>

                              <div className="flex items-center gap-1 mt-1">
                        <span
                            className={`text-[10px] ${
                                msg.sender === 'user'
                                    ? 'text-blue-100'
                                    : 'text-gray-400'
                            }`}
                        >
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
                                              onClick={() =>
                                                  msg.tempId &&
                                                  retryFailedMessage(msg.tempId)
                                              }
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

                      <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-3">
                      <button
                          aria-label="پیوست فایل"
                          className="text-gray-400 hover:text-gray-600"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      <Input
                          value={message}
                          onChange={handleInputChange}
                          onKeyDown={(e) =>
                              e.key === 'Enter' &&
                              !e.shiftKey &&
                              sendMessage()
                          }
                          placeholder={
                            status === 'connected'
                                ? 'پیام خود را بنویسید...'
                                : 'در انتظار اتصال...'
                          }
                          disabled={status !== 'connected'}
                          className="flex-1 text-right"
                      />

                      <button
                          onClick={sendMessage}
                          disabled={
                              status !== 'connected' || !message.trim()
                          }
                          aria-label="ارسال پیام"
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </>
              ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-300">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-10 h-10" />
                      <p className="text-sm">یک گفتگو انتخاب کنید</p>
                    </div>
                  </div>
              )}
            </div>
        )}
      </div>
  );
}
