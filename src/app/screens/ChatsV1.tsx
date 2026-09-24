import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Users } from 'lucide-react';
import { PageLoader } from '../components/PageLoader';
import { goBack } from '../navigation/appHistory';
import { useAuthStore } from '../store/authStore';

// Components
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatMessageList } from '../components/chat/ChatMessageList';
import { ChatInput } from '../components/chat/ChatInput';

// Types
import { Notification, Message, ChatRoom, UserStatus, ConnectionStatus } from '../components/chat/types';

const WS_HOST = 'chat.mediraai.com';
const API_BASE = 'https://api.mediraai.com';
const MAX_RECONNECT_ATTEMPTS = 10;
const TYPING_THROTTLE_MS = 500;

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'پذیرش بیمار جدید', description: 'بیمار علی حسینی پذیرش شد.', time: '10:00', isRead: false, type: 'info' },
  { id: 2, title: 'جواب آزمایش', description: 'جواب آزمایش بیمار مریم احمدی آماده است.', time: '12:30', isRead: false, type: 'alert' },
  { id: 3, title: 'به‌روزرسانی سیستم', description: 'سیستم امشب ساعت 24 به‌روزرسانی می‌شود.', time: 'دیروز', isRead: true, type: 'system' },
];

export function ChatsV1() {
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

    const protocol = 'wss';
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

  const selectedRoomData = rooms.find((r) => r.room_id === activeRoomId);

  const filteredRooms = useMemo(
      () => rooms.filter((r) => r.opponent.name.toLowerCase().includes(searchQuery.toLowerCase())),
      [rooms, searchQuery]
  );

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
          <ChatHeader
              isMobile={true}
              isSidebarOpen={isSidebarOpen}
              handleBackToChatList={handleBackToChatList}
              selectedRoomData={selectedRoomData}
              onlineUsersCount={onlineUsers.size}
              errorMsg={errorMsg}
              status={status}
              handleManualReconnect={handleManualReconnect}
          />
          <ChatMessageList
              isMobile={true}
              messages={messages}
              isLoadingHistory={isLoadingHistory}
              typingUsers={typingUsers}
              rooms={rooms}
              onlineUsers={onlineUsers}
              retryFailedMessage={retryFailedMessage}
              messagesEndRef={messagesEndRef}
              scrollToBottom={scrollToBottom}
          />
          <ChatInput
              isMobile={true}
              message={message}
              handleInputChange={handleInputChange}
              sendMessage={sendMessage}
              handleFileUpload={handleFileUpload}
              isUploading={isUploading}
              status={status}
              fileInputRef={fileInputRefMobile}
          />
        </div>
    );
  }

  // ===================== حالت دسکتاپ =====================
  return (
      <div className="flex h-[100dvh] bg-white overflow-hidden" dir="rtl">
        <ChatSidebar
            isSidebarOpen={isSidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredRooms={filteredRooms}
            activeRoomId={activeRoomId}
            handleRoomSelect={handleRoomSelect}
            notifications={notifications}
            typingUsers={typingUsers}
            status={status}
            handleBackToHome={() => goBack(navigate, '/home')}
        />

        {!isMobile && (
            <div className="flex-1 flex flex-col bg-gray-50/40 relative min-w-0">
              {activeRoomId ? (
                  <>
                    <ChatHeader
                        isMobile={false}
                        isSidebarOpen={isSidebarOpen}
                        handleBackToChatList={handleBackToChatList}
                        selectedRoomData={selectedRoomData}
                        onlineUsersCount={onlineUsers.size}
                        errorMsg={errorMsg}
                        status={status}
                        handleManualReconnect={handleManualReconnect}
                    />
                    <ChatMessageList
                        isMobile={false}
                        messages={messages}
                        isLoadingHistory={isLoadingHistory}
                        typingUsers={typingUsers}
                        rooms={rooms}
                        onlineUsers={onlineUsers}
                        retryFailedMessage={retryFailedMessage}
                        messagesEndRef={messagesEndRef}
                        scrollToBottom={scrollToBottom}
                    />
                    <ChatInput
                        isMobile={false}
                        message={message}
                        handleInputChange={handleInputChange}
                        sendMessage={sendMessage}
                        handleFileUpload={handleFileUpload}
                        isUploading={isUploading}
                        status={status}
                        fileInputRef={fileInputRefDesktop}
                    />
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