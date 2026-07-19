import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { PageHeader } from '../../components';
import { mockSupportTickets } from '../../data/mockData';
import type { ProviderRole } from '../../config/providerNav';

interface ProviderSupportPageProps {
    role?: ProviderRole;
}

export function ProviderSupportPage({ role = 'nurse' }: ProviderSupportPageProps) {
    const [tickets] = useState(mockSupportTickets);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const accent =
        role === 'lab'
            ? {
                  focus: 'focus:border-amber-400',
                  button: 'from-amber-700 via-amber-600 to-amber-500 shadow-amber-600/25 hover:shadow-amber-600/35',
              }
            : role === 'pharmacy'
                ? {
                      focus: 'focus:border-teal-400',
                      button: 'from-teal-700 via-teal-600 to-teal-500 shadow-teal-600/25 hover:shadow-teal-600/35',
                  }
                : {
                      focus: 'focus:border-rose-400',
                      button: 'from-rose-700 via-rose-600 to-rose-500 shadow-rose-600/25 hover:shadow-rose-600/35',
                  };

    return (
        <div className="space-y-6">
            <PageHeader title="پشتیبانی" description="ارسال تیکت و مشاهده تاریخچه پیام‌ها" />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="mb-4 text-sm font-semibold text-slate-700">تیکت‌های قبلی</p>
                    <div className="space-y-3">
                        {tickets.map((t) => (
                            <div key={t.id} className="rounded-xl border border-slate-100 p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium text-slate-800">{t.subject}</p>
                                    <StatusPill status={t.status} />
                                </div>
                                <p className="mt-1 text-sm text-slate-500">{t.lastMessage}</p>
                                <p className="mt-2 text-xs text-slate-400">{t.updatedAt}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <MessageSquare className="h-4 w-4" />
                        تیکت جدید
                    </p>
                    <div className="space-y-3">
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="موضوع"
                            className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ${accent.focus}`}
                        />
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="متن پیام..."
                            rows={5}
                            className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ${accent.focus}`}
                        />
                        <button
                            type="button"
                            className={`group inline-flex items-center gap-2.5 rounded-[300px] bg-gradient-to-l px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${accent.button}`}
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 transition-colors group-hover:bg-white/30">
                                <Send className="h-3.5 w-3.5" />
                            </span>
                            ارسال تیکت
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const map: Record<string, string> = {
        open: 'bg-amber-50 text-amber-700',
        answered: 'bg-blue-50 text-blue-700',
        closed: 'bg-slate-100 text-slate-600',
    };
    const labels: Record<string, string> = {
        open: 'باز',
        answered: 'پاسخ داده شده',
        closed: 'بسته',
    };
    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? map.open}`}>
            {labels[status] ?? status}
        </span>
    );
}
