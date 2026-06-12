import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Search, Ban, Eye, AlertTriangle } from 'lucide-react';
import { useAdminDataStore, type AiSessionStatus } from '../store/adminDataStore';

const statusLabels: Record<AiSessionStatus, string> = {
    completed: 'تکمیل‌شده',
    in_progress: 'در جریان',
    flagged: 'مشکوک',
    disabled: 'غیرفعال',
};

const statusStyles: Record<AiSessionStatus, string> = {
    completed: 'bg-emerald-50 text-emerald-700',
    in_progress: 'bg-sky-50 text-sky-700',
    flagged: 'bg-amber-50 text-amber-700',
    disabled: 'bg-slate-100 text-slate-500',
};

const urgencyStyles = { low: 'text-slate-500', medium: 'text-amber-600', high: 'text-red-600' };

export function AdminAiSessions() {
    const sessions = useAdminDataStore((s) => s.aiSessions);
    const updateAiSession = useAdminDataStore((s) => s.updateAiSession);
    const addActivity = useAdminDataStore((s) => s.addActivity);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered = useMemo(() => {
        return sessions.filter((s) => {
            const q = search.trim().toLowerCase();
            const matchSearch = !q || s.userName.toLowerCase().includes(q) || s.symptoms.toLowerCase().includes(q);
            const matchStatus = statusFilter === 'all' || s.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [sessions, search, statusFilter]);

    const disableSession = (id: number) => {
        updateAiSession(id, { disabled: true, status: 'disabled' });
        addActivity({ type: 'ai', message: `غیرفعال‌سازی session تشخیص #${id}` });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">تشخیص هوشمند</h2>
                    <p className="text-sm text-slate-500">نظارت بر جریان symptoms → questionnaire → results</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو نام یا علائم..." className="h-11 w-full rounded-xl border border-slate-200 pr-9 pl-3 text-sm" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="all">همه وضعیت‌ها</option>
                    {Object.entries(statusLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
                            <th className="px-5 py-3 text-right font-medium">کاربر</th>
                            <th className="px-5 py-3 text-right font-medium">علائم</th>
                            <th className="px-5 py-3 text-right font-medium">نتیجه</th>
                            <th className="px-5 py-3 text-right font-medium">فوریت</th>
                            <th className="px-5 py-3 text-right font-medium">وضعیت</th>
                            <th className="px-5 py-3 text-right font-medium">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr key={s.id} className="border-b border-slate-50 last:border-0">
                                <td className="px-5 py-3">
                                    <p className="font-medium">{s.userName}</p>
                                    <p className="text-xs text-slate-400" dir="ltr">{s.userPhone}</p>
                                </td>
                                <td className="px-5 py-3 text-slate-600">{s.symptoms}</td>
                                <td className="max-w-xs truncate px-5 py-3 text-slate-600">{s.resultSummary}</td>
                                <td className={`px-5 py-3 text-xs font-medium ${urgencyStyles[s.urgency]}`}>
                                    {s.urgency === 'high' && <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}
                                    {s.urgency === 'high' ? 'بالا' : s.urgency === 'medium' ? 'متوسط' : 'پایین'}
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs ${statusStyles[s.status]}`}>{statusLabels[s.status]}</span>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex gap-2">
                                        <Link to={`/admin/users/${s.userId}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50">
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                        {!s.disabled && (
                                            <button type="button" onClick={() => disableSession(s.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50" title="غیرفعال‌سازی">
                                                <Ban className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
