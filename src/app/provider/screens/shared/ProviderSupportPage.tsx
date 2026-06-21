import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { PageHeader } from '../../components';
import { mockSupportTickets } from '../../data/mockData';

export function ProviderSupportPage() {
    const [tickets] = useState(mockSupportTickets);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

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
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                        />
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="متن پیام..."
                            rows={5}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                        />
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            <Send className="h-4 w-4" />
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
