import { useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { PageHeader, StatusBadge, EmptyState } from '../../components';
import { mockDoctorConsultations } from '../data/mockDoctorData';
import {
    doctorConsultationStatusLabels,
    doctorConsultationStatusStyles,
} from '../../config/statusOptions';

export function DoctorConsultationsPage() {
    const [consultations] = useState(mockDoctorConsultations);

    const active = consultations.filter((c) => c.status === 'active');
    const pending = consultations.filter((c) => c.status === 'pending');

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
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                    <MessageSquare className="h-5 w-5" />
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
                                {/* TODO: اتصال به سیستم چت واقعی */}
                                <button
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

            {consultations.filter((c) => c.status === 'closed').length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-500">گفتگوهای بسته‌شده</p>
                    {consultations
                        .filter((c) => c.status === 'closed')
                        .map((c) => (
                            <div
                                key={c.id}
                                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 opacity-75"
                            >
                                <p className="font-medium text-slate-600">{c.patientName}</p>
                                <p className="mt-1 text-sm text-slate-500">{c.lastMessage}</p>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
