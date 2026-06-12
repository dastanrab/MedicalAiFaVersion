import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, Check, X, Eye, Loader2, RefreshCw } from 'lucide-react';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useAdminDataStore } from '../store/adminDataStore';
import { fetchAdminUsers, verifyAdminUser, type UsersListResponse } from '../services/adminApi';
import { userTypeLabels, userTypeStyles, type AdminUserRow } from '../config/userOptions';

const PROVIDER_TYPES = ['doctor', 'pharmacy', 'lab', 'nurse'];

export function AdminVerifications() {
    const token = useAdminAuthStore((s) => s.token);
    const addActivity = useAdminDataStore((s) => s.addActivity);
    const [rows, setRows] = useState<AdminUserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<number | null>(null);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const all: AdminUserRow[] = [];
            let page = 1;
            let totalPages = 1;
            while (page <= totalPages) {
                const res: UsersListResponse = await fetchAdminUsers({
                    page: String(page),
                    per_page: '100',
                });
                all.push(...res.data.filter((u) => !u.isVerified && PROVIDER_TYPES.includes(u.type)));
                totalPages = Math.max(1, Math.ceil(res.total / 100));
                page++;
            }
            setRows(all);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleVerify = async (id: number, approved: boolean, reason?: string) => {
        setActionId(id);
        try {
            await verifyAdminUser(id, approved, reason);
            setRows((prev) => prev.filter((r) => r.id !== id));
            addActivity({
                type: 'verification',
                message: approved ? `تأیید احراز کاربر #${id}` : `رد احراز کاربر #${id}`,
                link: `/admin/users/${id}`,
            });
        } catch {
            setRows((prev) => prev.filter((r) => r.id !== id));
        } finally {
            setActionId(null);
            setRejectId(null);
            setRejectReason('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <BadgeCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">تأیید ارائه‌دهندگان</h2>
                        <p className="text-sm text-slate-500">صف درخواست‌های در انتظار احراز هویت</p>
                    </div>
                </div>
                <button type="button" onClick={load} disabled={loading} className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    بروزرسانی
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {loading ? (
                    <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
                ) : rows.length === 0 ? (
                    <p className="py-16 text-center text-slate-400">درخواست معلقی وجود ندارد</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
                                <th className="px-5 py-3 text-right font-medium">نام</th>
                                <th className="px-5 py-3 text-right font-medium">نوع</th>
                                <th className="px-5 py-3 text-right font-medium">موبایل</th>
                                <th className="px-5 py-3 text-right font-medium">موقعیت</th>
                                <th className="px-5 py-3 text-right font-medium">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((u) => (
                                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                                    <td className="px-5 py-3 font-medium">{u.firstName} {u.lastName}</td>
                                    <td className="px-5 py-3">
                                        <span className={`rounded-lg px-2 py-1 text-xs ${userTypeStyles[u.type]}`}>{userTypeLabels[u.type]}</span>
                                    </td>
                                    <td className="px-5 py-3" dir="ltr">{u.phone}</td>
                                    <td className="px-5 py-3 text-slate-500">{u.province} — {u.city}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/admin/users/${u.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button type="button" disabled={actionId === u.id} onClick={() => handleVerify(u.id, true)} className="flex h-9 items-center gap-1 rounded-lg bg-emerald-50 px-3 text-xs text-emerald-700 hover:bg-emerald-100">
                                                <Check className="h-4 w-4" /> تأیید
                                            </button>
                                            <button type="button" onClick={() => setRejectId(u.id)} className="flex h-9 items-center gap-1 rounded-lg bg-red-50 px-3 text-xs text-red-700 hover:bg-red-100">
                                                <X className="h-4 w-4" /> رد
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="font-semibold text-slate-800">رد درخواست احراز</h3>
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="دلیل رد..." className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm" />
                        <div className="mt-4 flex gap-2">
                            <button type="button" onClick={() => handleVerify(rejectId, false, rejectReason)} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm text-white">ثبت رد</button>
                            <button type="button" onClick={() => setRejectId(null)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm">انصراف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
