import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { EmptyState, PageHeader, SearchInput, formatFaNumber } from '../../../components';
import { showProviderError } from '../../../utils/toast';
import { useStaffSession, useStaffStore } from '../../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

interface PatientContact {
    name: string;
    phone: string;
    visits: number;
    lastVisit?: string | null;
    nextVisit?: string | null;
}

/** فقط اطلاعات تماس و سابقه نوبت — پرونده پزشکی برای منشی قابل مشاهده نیست */
export function StaffPatientsPage() {
    const session = useStaffSession('doctor');
    const logout = useStaffStore((s) => s.logout);

    const [patients, setPatients] = useState<PatientContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchPatients = useCallback(async () => {
        if (!session?.token) {
            logout('doctor');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (search.trim()) {
                params.append('search', search.trim());
            }

            const res = await fetch(`${API_BASE}/staff/doctor/patients?${params.toString()}`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${session.token}`,
                },
            });

            if (res.status === 401) {
                logout('doctor');
                return;
            }

            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                setPatients(result.data);
            } else {
                const msg = result.message || 'خطا در بارگذاری فهرست بیماران';
                setError(msg);
                showProviderError(msg);
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
            const msg = 'ارتباط با سرور برقرار نشد.';
            setError(msg);
            showProviderError(msg);
        } finally {
            setLoading(false);
        }
    }, [session?.token, logout, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchPatients]);

    return (
        <div className="space-y-6">
            <PageHeader title="بیماران" description="اطلاعات تماس و سابقه نوبت بیماران" />

            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>پرونده پزشکی، نسخه‌ها و نتایج هوش مصنوعی بیماران فقط برای پزشک قابل مشاهده است.</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="نام یا موبایل بیمار..." />
            </div>

            {loading ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-6 text-center text-rose-700">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={fetchPatients}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        تلاش مجدد
                    </button>
                </div>
            ) : patients.length === 0 ? (
                <EmptyState message="بیماری یافت نشد." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">نام بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">موبایل</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">تعداد ویزیت</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">آخرین ویزیت</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">نوبت بعدی</th>
                        </tr>
                        </thead>
                        <tbody>
                        {patients.map((p) => (
                            <tr key={p.phone} className="border-t border-slate-100">
                                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                                <td className="px-4 py-3 text-slate-600" dir="ltr">
                                    {p.phone}
                                </td>
                                <td className="px-4 py-3 font-medium">{formatFaNumber(p.visits)}</td>
                                <td className="px-4 py-3 text-slate-600">{p.lastVisit ?? '—'}</td>
                                <td className="px-4 py-3 text-slate-600">{p.nextVisit ?? '—'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
