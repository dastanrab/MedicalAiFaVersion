import {useState, useEffect, useRef, JSX} from 'react';
import { useNavigate , useParams } from 'react-router';
import {
  ArrowLeft,
  Video,
  Phone,
  Send,
  Paperclip,
  MoreVertical,
  Mic,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuthStore } from '../store/authStore';


const WS_HOST = '185.222.163.113:4070';
const API_BASE = 'http://185.222.163.113:7000';

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

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'disable';

type WSMessage = {
  type: 'message' | 'user_status' | 'typing' | 'error';
  user_id?: number;
  username?: string;
  message?: string;
  content?: string;
  is_online?: boolean;
  is_typing?: boolean;
};

export function Consultationv1() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chat');
  const { id } = useParams();
  const ROOM_ID = id;
  const [userId, setUserId] = useState<number | null>(null);
  const userIdRef = useRef<number | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<Map<number, UserStatus>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(1);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const roomTitleRef = useRef<string>('در حال بارگذاری...');
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // فقط state عنوان اتاق
  const [roomTitle, setRoomTitle] = useState<string>('در حال بارگذاری...');

// فقط fetchChatHistory کافیه
  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(
          `http://${WS_HOST}/api/chat/rooms/${ROOM_ID}/messages?limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
      );

      if (!response.ok) throw new Error('خطا در دریافت تاریخچه');

      const data = await response.json();

      // دریافت عنوان اتاق از همین پاسخ
      if (data.room_title) {
        setRoomTitle(data.room_title);
        roomTitleRef.current = data.room_title;
      }

      const list = Array.isArray(data) ? data : (data.messages ?? []);

      const historyMessages: Message[] = [...list].reverse().map((msg: any) => ({
        id: msg.id,
        sender: msg.user_id === userIdRef.current ? 'user' : 'other',
        message: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        user_id: msg.user_id,
        username: msg.username,
      }));

      setMessages(historyMessages);
    } catch (error) {
      console.error('❌ خطا در دریافت تاریخچه:', error);
      setRoomTitle('اتاق گفتگو');
    } finally {
      setIsLoadingHistory(false);
    }
  };


  const fetchParticipants = async () => {
    try {
      const response = await fetch(
          `http://${WS_HOST}/api/chat/rooms/${ROOM_ID}/participants`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
      );

      if (!response.ok) return;

      const data = await response.json();
      const participants = data.participants || [];

      const usersMap = new Map<number, UserStatus>();
      participants.forEach((p: any) => {
        usersMap.set(p.user_id, {
          user_id: p.user_id,
          username: p.username,
          is_online: p.is_online,
          last_seen: p.last_seen,
        });
      });

      setOnlineUsers(usersMap);
    } catch (error) {
      console.error('❌ خطا در دریافت شرکت‌کنندگان:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      if (!accessToken) {
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');

      const data = await response.json();

      if (data.success) {
        const user = data.data.user;
        setUserId(user.id);
        userIdRef.current = user.id;
        setIsLoadingProfile(false);

        await fetchChatHistory();
        await fetchParticipants();
        connect(accessToken);
      } else {
        throw new Error('پاسخ نامعتبر از سرور');
      }
    } catch (error) {
      console.error('خطا در دریافت پروفایل:', error);
      setErrorMsg('خطا در دریافت اطلاعات کاربر');
      setIsLoadingProfile(false);
      navigate('/');
    }
  };

  const connect = (token: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setStatus('connecting');
    setErrorMsg('');

    const url = `ws://${WS_HOST}/ws/chat/${ROOM_ID}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      addSystemMessage(`به چت  ${roomTitleRef.current} متصل شدید`);
    };

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);

        // پیام معمولی
        if (data.type === 'message') {
          if (data.user_id && userIdRef.current && data.user_id === userIdRef.current) {
            return;
          }

          const incoming: Message = {
            id: msgIdRef.current++,
            sender: 'other',
            message: data.message || data.content || '',
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            user_id: data.user_id,
            username: data.username,
          };
          setMessages((prev) => [...prev, incoming]);

          // حذف نشانگر تایپ کاربر
          if (data.user_id) {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              next.delete(data.user_id!);
              return next;
            });
          }
        }

        // تغییر وضعیت آنلاین/آفلاین
        else if (data.type === 'user_status') {
          if (data.user_id && data.user_id !== userIdRef.current) {
            setOnlineUsers((prev) => {
              const next = new Map(prev);
              const existing = next.get(data.user_id!) || {
                user_id: data.user_id!,
                username: data.username || `کاربر ${data.user_id}`,
                is_online: false,
              };
              next.set(data.user_id!, {
                ...existing,
                is_online: data.is_online ?? false,
              });
              return next;
            });

            const statusText = data.is_online ? 'وارد شد' : 'خارج شد';
            addSystemMessage(`${data.username || `کاربر ${data.user_id}`} ${statusText}`);
          }
        }
        else if (data.type === 'error') {
          console.log(data.message,'on error')
          setErrorMsg(data.message || 'خطا در اتصال');
          //setTimeout(() => navigate('/'), 3000);
        }

        // نشانگر تایپ
        else if (data.type === 'typing') {
          if (data.user_id && data.user_id !== userIdRef.current) {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              if (data.is_typing) {
                next.add(data.user_id!);
              } else {
                next.delete(data.user_id!);
              }
              return next;
            });
          }
        }
      } catch (err) {
        console.error('خطا در پردازش پیام:', err);
      }
    };

    ws.onerror = () => {
      setStatus('error');
      setErrorMsg('خطا در اتصال به سرور');
    };

    ws.onclose = (event) => {
      console.log('close code:', event.code, 'reason:', event.reason);
      setStatus('disconnected');

      if (event.code === 1008 ) {
        setStatus('disable');
        setErrorMsg('دسترسی به این چت مجاز نیست');
      }else if(event.code === 4001){
        setErrorMsg('دسترسی به این چت مجاز نیست');
         setTimeout(() => navigate('/'), 3000);
      }
      else if (event.code !== 1000) {
        setErrorMsg(`اتصال قطع شد (${event.code})`);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (accessToken) {
            fetchChatHistory().then(() => {
              fetchParticipants().then(() => connect(accessToken));
            });
          }
        }, 3000);
      }
    };

  };

  const addSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: msgIdRef.current++,
        sender: 'other',
        message: `🔔 ${text}`,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleDisconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close(1000);
    navigate(-1);
  };

  const handleManualReconnect = async () => {
    if (accessToken) {
      await fetchChatHistory();
      await fetchParticipants();
      connect(accessToken);
    }
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const payload = JSON.stringify({
      type: 'typing',
      is_typing: isTyping,
    });
    wsRef.current.send(payload);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // ارسال نشانگر تایپ
    if (e.target.value.trim()) {
      sendTypingIndicator(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 2000);
    } else {
      sendTypingIndicator(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setErrorMsg('اتصال برقرار نیست');
      return;
    }

    // توقف نشانگر تایپ
    sendTypingIndicator(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const payload = JSON.stringify({
      type: 'message',
      message: message.trim(),
    });
    wsRef.current.send(payload);

    const outgoing: Message = {
      id: msgIdRef.current++,
      sender: 'user',
      message: message.trim(),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      user_id: userIdRef.current || undefined,
    };
    setMessages((prev) => [...prev, outgoing]);
    setMessage('');
  };

  useEffect(() => {
    if (!accessToken) {
      navigate('/');
      return;
    }
    fetchProfile();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  const StatusBadge = () => {
    const onlineCount = Array.from(onlineUsers.values()).filter(u => u.is_online).length;

    const map: Record<ConnectionStatus, { color: string; label: string; icon: JSX.Element }> = {
      connected: {
        color: 'text-green-600',
        label: onlineCount > 0 ? `${onlineCount} نفر آنلاین` : 'متصل',
        icon: <Wifi className="w-4 h-4" />
      },
      connecting: { color: 'text-yellow-500', label: 'در حال اتصال...', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
      disconnected: { color: 'text-gray-400', label: 'قطع شده', icon: <WifiOff className="w-4 h-4" /> },
      disable: { color: 'text-purple-500', label: 'دسترسی شما محدود شده', icon: <WifiOff className="w-4 h-4" /> },
      error: { color: 'text-red-500', label: 'خطا', icon: <WifiOff className="w-4 h-4" /> },
    };
    const s = map[status];
    return (
        <span className={`flex items-center gap-1 text-xs ${s.color}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  const TypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUsernames = Array.from(typingUsers)
        .map(uid => onlineUsers.get(uid)?.username || `کاربر ${uid}`)
        .join('، ');

    return (
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          {typingUsernames} در حال نوشتن...
        </div>
    );
  };

  if (isLoadingProfile) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">

        {/* هدر */}
        <div className="flex-shrink-0 bg-white border-b px-4 py-4 shadow-sm w-full">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-900 flex-shrink-0"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {roomTitle.charAt(0)}
                  </div>
                  {status === 'connected' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg text-gray-900 truncate">{roomTitle}</h2>
                  <StatusBadge />
                </div>
              </div>

              <button
                  onClick={handleDisconnect}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="قطع اتصال"
              >
                <MoreVertical className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* تب‌ها */}
        <div className="flex-shrink-0 bg-white border-b px-4 w-full">
          <div className="max-w-md mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">گفتگو</TabsTrigger>
                <TabsTrigger value="call" className="flex-1">تماس صوتی</TabsTrigger>
                <TabsTrigger value="video" className="flex-1">تماس تصویری</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* محتوا */}
        <div className="flex-1 overflow-hidden min-w-0">
          <div className="max-w-md mx-auto h-full flex flex-col min-w-0">

            {/* تب گفتگو */}
            {activeTab === 'chat' && (
                <>
                  {/* بنر خطا */}
                  {errorMsg && (
                      <div className="flex-shrink-0 bg-red-50 border-b border-red-100 px-4 py-2 text-sm text-red-600 text-center">
                        ⚠️ {errorMsg}
                        {status !== 'connected' && status !== 'connecting' && accessToken && (
                            <button
                                onClick={handleManualReconnect}
                                className="mr-2 underline font-medium inline-flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              تلاش مجدد
                            </button>
                        )}
                      </div>
                  )}

                  {/* پیام‌ها */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                    {isLoadingHistory && (
                        <div className="flex items-center justify-center py-4 text-gray-400 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">در حال بارگذاری تاریخچه...</span>
                        </div>
                    )}

                    {messages.length === 0 && !isLoadingHistory && status === 'connecting' && (
                        <div className="flex items-center justify-center text-gray-400 gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>در حال اتصال...</span>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                              className={`max-w-[75%] min-w-0 ${
                                  msg.sender === 'user'
                                      ? 'bg-blue-500 text-white rounded-2xl rounded-tr-md'
                                      : 'bg-white text-gray-900 rounded-2xl rounded-tl-md shadow-md'
                              } px-4 py-3`}
                          >
                            {msg.sender === 'other' && msg.username && (
                                <p className="text-xs font-semibold mb-1 text-blue-600">
                                  {msg.username}
                                </p>
                            )}
                            <p className="text-sm break-words">{msg.message}</p>
                            <p
                                className={`text-xs mt-1 ${
                                    msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}
                            >
                              {msg.time}
                            </p>
                          </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* نشانگر تایپ */}
                  <TypingIndicator />

                  {/* ورودی پیام */}
                  <div className="flex-shrink-0 bg-white border-t px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        <Paperclip className="w-6 h-6" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <Input
                            value={message}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder={
                              status === 'connected' ? 'پیام خود را بنویسید...' : 'در انتظار اتصال...'
                            }
                            disabled={status !== 'connected'}
                            className="w-full"
                        />
                      </div>

                      <button
                          onClick={sendMessage}
                          disabled={status !== 'connected' || !message.trim()}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-full transition-colors flex-shrink-0"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
            )}

            {/* تب تماس صوتی */}
            {activeTab === 'call' && (
                <div className="flex-1 flex items-center justify-center p-6">
                  <Card className="p-8 text-center shadow-xl border-0 max-w-sm w-full">
                    <div className="w-32 h-32 mx-auto mb-6 relative">
                      <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl">
                        {roomTitle.charAt(0)}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse" />
                    </div>
                    <h2 className="text-2xl text-gray-900 mb-2">{roomTitle}</h2>
                    <p className="text-gray-600 mb-6">تماس صوتی</p>
                    <div className="space-y-3">
                      <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-white">
                        <Phone className="w-5 h-5 ml-2" />
                        شروع تماس صوتی
                      </Button>
                      <Button variant="outline" className="w-full h-12">
                        <Mic className="w-5 h-5 ml-2" />
                        بی‌صدا
                      </Button>
                    </div>
                  </Card>
                </div>
            )}

            {/* تب تماس تصویری */}
            {activeTab === 'video' && (
                <div className="flex-1 flex items-center justify-center p-6">
                  <Card className="p-8 text-center shadow-xl border-0 max-w-sm w-full">
                    <div className="w-32 h-32 mx-auto mb-6 relative">
                      <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl">
                        {roomTitle.charAt(0)}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse" />
                    </div>
                    <h2 className="text-2xl text-gray-900 mb-2">{roomTitle}</h2>
                    <p className="text-gray-600 mb-6">تماس تصویری</p>
                    <div className="space-y-3">
                      <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white">
                        <Video className="w-5 h-5 ml-2" />
                        شروع تماس تصویری
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-12">
                          <Video className="w-5 h-5 ml-2" />
                          دوربین
                        </Button>
                        <Button variant="outline" className="h-12">
                          <Mic className="w-5 h-5 ml-2" />
                          میکروفون
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
            )}

          </div>
        </div>
      </div>
  );
}
