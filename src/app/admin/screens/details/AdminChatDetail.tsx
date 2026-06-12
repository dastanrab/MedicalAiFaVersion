import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowRight, Ban, Headphones, Loader2, Lock } from 'lucide-react';
import { fetchChatDetails, updateChatStatus, markChatViolation, referToSupport, setTokenGetter } from '../../../services/api';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAdminDataStore } from '../../store/adminDataStore';
import { maskPhone, maskSensitiveText, type AdminChatMessage } from '../../config/chatOptions';

export function AdminChatDetail() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const token = useAdminAuthStore((s) => s.token);
    const addActivity = useAdminDataStore((s) => s.addActivity);
    const [messages, setMessages] = useState<AdminChatMessage[]>([]);
    const [meta, setMeta] = useState({ patientPhone: '', province: '', city: '', status: 1 });
    const [loading, setLoading] = useState(true);
    const [showSensitive, setShowSensitive] = useState(false);

    useEffect(() => { setTokenGetter(() => token); }, [token]);

    const load = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        try {
            const details = await fetchChatDetails(Number(roomId));
            setMessages(details.messages.map((m) => ({
                id: m.id,
                sender: m.sender,
                senderName: m.sender_name,
                message: m.message,
                sentAt: m.sent_at,
                isSensitive: m.is_sensitive,
            })));
            setMeta({
                patientPhone: details.patient_phone ?? '',
                province: details.province ?? '',
                city: details.city ?? '',
                status: 1,
            });
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => { load(); }, [load]);

    const closeChat = async () => {
        await updateChatStatus(Number(roomId), 0);
        setMeta({ ...meta, status: 0 });
        addActivity({ type: 'chat', message: `بستن گفتگو #${roomId}`, link: `/admin/chats/${roomId}` });
    };

    const flagViolation = async () => {
        await markChatViolation(Number(roomId));
        addActivity({ type: 'chat', message: `علامت تخلف گفتگو #${roomId}` });
    };

    const referSupport = async () => {
        await referToSupport(Number(roomId));
        addActivity({ type: 'chat', message: `ارجاع گفتگو #${roomId} به پشتیبانی` });
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => navigate('/admin/chats')} className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white">
                        <ArrowRight className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold">گفتگو #{roomId}</h2>
                        <p className="text-sm text-slate-500">
                            {showSensitive ? meta.patientPhone : maskPhone(meta.patientPhone)} — {meta.province} {meta.city}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setShowSensitive(!showSensitive)} className="flex h-9 items-center gap-1 rounded-lg border px-3 text-xs">
                        <Lock className="h-3.5 w-3.5" /> {showSensitive ? 'مخفی‌سازی' : 'نمایش کامل'}
                    </button>
                    <button type="button" onClick={closeChat} className="rounded-lg border px-3 py-1.5 text-xs">بستن گفتگو</button>
                    <button type="button" onClick={flagViolation} className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                        <Ban className="h-3.5 w-3.5" /> تخلف
                    </button>
                    <button type="button" onClick={referSupport} className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700">
                        <Headphones className="h-3.5 w-3.5" /> ارجاع پشتیبانی
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
                <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                    {messages.length === 0 ? (
                        <p className="py-8 text-center text-slate-400">پیامی یافت نشد</p>
                    ) : messages.map((m) => (
                        <div key={m.id} className={`rounded-xl px-4 py-3 text-sm ${m.sender === 'user' ? 'bg-slate-50' : m.sender === 'system' ? 'bg-amber-50 text-amber-800' : 'bg-indigo-50'}`}>
                            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                <span>{m.senderName}</span>
                                <span>{new Date(m.sentAt.replace(' ', 'T')).toLocaleString('fa-IR')}</span>
                            </div>
                            <p>{m.isSensitive && !showSensitive ? maskSensitiveText(m.message, false) : m.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
