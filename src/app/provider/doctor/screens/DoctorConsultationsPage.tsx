import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Loader2 } from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState } from '../../components';
import {
    doctorConsultationStatusLabels,
    doctorConsultationStatusStyles,
} from '../../config/statusOptions';
import { useDoctorAuthStore } from '../store/doctorAuthStore';
import { useNavigate } from 'react-router';  // ← اضافه کن

const API_BASE_URL = 'http://185.222.163.113:7000/api';

interface ApiRoom {
    room_id: number;
    room_name: string;
    last_message: string | null;
    last_message_time: string | null;
    room_created_at: string;
    opponent: {
        id: number;
        name: string;
        role: string;
        avatar: string | null;
        is_online: boolean;
        last_seen: string | null;
    } | null;
}

interface ApiResponse {
    success: boolean;
    data: {
        rooms: ApiRoom[];
        pagination: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
        };
    };
}

interface Consultation {
    id: number;
    patientId: number;
    patientName: string;
    lastMessage: string;
    lastMessageAt: string;
    status: 'active' | 'pending' | 'closed';
    unreadCount: number;
    isOnline: boolean;
}

function mapApiRoom(room: ApiRoom): Consultation {
    return {
        id: room.room_id,
        patientId: room.opponent?.id ?? 0,
        patientName: room.opponent?.name ?? '—',
        lastMessage: room.last_message ?? '—',
        lastMessageAt: room.last_message_time
            ? new Date(room.last_message_time).toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit',
            })
            : '—',
        status: 'active',
        unreadCount: 0,
        isOnline: room.opponent?.is_online ?? false,
    };
}

export function DoctorConsultationsPage() {
    const token = useDoctorAuthStore((s) => s.token);
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();  // ← اضافه کن
    useEffect(() => {
        if (!token) return;

        const fetchRooms = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/doctor/my-rooms`, {
                    headers: {
                        Authorization: `Bearer ${token}`,Accept: 'application/json',
                    },
                });

                if (!res.ok) {
                    setError('خطا در دریافت لیست مشاوره‌ها');
                    return;
                }

                const data: ApiResponse = await res.json();

                if (!data.success) {
                    setError('خطا در دریافت لیست مشاوره‌ها');
                    return;
                }

                setConsultations((data.data?.rooms ?? []).map(mapApiRoom));
            } catch {
                setError('اتصال به سرور برقرار نشد');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [token]);

    const active = consultations.filter((c) => c.status === 'active');
    const pending = consultations.filter((c) => c.status === 'pending');
    const closed = consultations.filter((c) => c.status === 'closed');

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="mr-2 text-sm">در حال بارگذاری...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="مشاوره‌ها"
                description={`${active.length.toLocaleString('fa-IR')} گفتگوی فعال — ${pending.length.toLocaleString('fa-IR')} درخواست جدید`}
            />

            {pending.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">درخواست‌های مشاوره</p>
                    {pending.map((c) => (
                        <div
                            key={c.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4"
                        >
                            <div>
                                <p className="font-medium text-slate-800">{c.patientName}</p>
                                <p className="mt-1 text-sm text-slate-600">{c.lastMessage}</p>
                            </div>
                            <button
                                type="button"
                                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                پذیرش مشاوره
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">چت‌های فعال</p>
                {active.length === 0 ? (
                    <EmptyState message="گفتگوی فعالی وجود ندارد." />
                ) : (
                    active.map((c) => (
                        <div
                            key={c.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200"
                        >
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    {c.isOnline && (
                                        <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-slate-800">{c.patientName}</p>
                                        {c.unreadCount > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                                {c.unreadCount.toLocaleString('fa-IR')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600">{c.lastMessage}</p>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                        <Clock className="h-3 w-3" />
                                        {c.lastMessageAt}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge
                                    label={doctorConsultationStatusLabels[c.status]}
                                    className={doctorConsultationStatusStyles[c.status]}
                                />
                                <button
                                    onClick={() => navigate(`/provider/doctor/consultations/${c.id}`)}
                                    type="button"
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    ورود به گفتگو
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {closed.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-500">گفتگوهای بسته‌شده</p>
                    {closed.map((c) => (
                        <div
                            key={c.id}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-4 opacity-75"
                        >
                            <p className="font-medium text-slate-600">{c.patientName}</p>
                            <p className="mt-1 text-sm text-slate-600">{c.lastMessage}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
