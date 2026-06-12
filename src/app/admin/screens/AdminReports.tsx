import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useAdminDataStore } from '../store/adminDataStore';
import { fetchAllAdminUsers, buildSignupTrend, buildAppointmentTrend } from '../services/adminApi';
import { fetchAppointments, setTokenGetter } from '../../services/api';
import { computeUserStats, computePaymentStats, formatFaNumber } from '../utils/dashboardStats';
import type { AdminAppointmentRow } from '../config/appointmentOptions';
import { appointmentStatusLabels, type AppointmentStatus } from '../config/appointmentOptions';

type ReportTab = 'users' | 'appointments' | 'ai' | 'services';

const mapStatus = (text: string): AppointmentStatus => {
    const m: Record<string, AppointmentStatus> = {
        'رزرو شده': 'booked', 'انجام شده': 'done', 'لغو شده': 'canceled', 'عدم حضور': 'no-show',
    };
    return m[text] ?? 'booked';
};

export function AdminReports() {
    const token = useAdminAuthStore((s) => s.token);
    const payments = useAdminDataStore((s) => s.payments);
    const aiSessions = useAdminDataStore((s) => s.aiSessions);
    const serviceCatalog = useAdminDataStore((s) => s.serviceCatalog);
    const [tab, setTab] = useState<ReportTab>('users');
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Awaited<ReturnType<typeof fetchAllAdminUsers>>>([]);
    const [appointments, setAppointments] = useState<AdminAppointmentRow[]>([]);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setTokenGetter(() => token);
        try {
            const [u, apptRes] = await Promise.all([
                fetchAllAdminUsers(),
                fetchAppointments(1, 500, {}),
            ]);
            setUsers(u);
            setAppointments(apptRes.data.map((a) => ({
                id: a.id,
                patientName: a.patient.name,
                patientPhone: a.mobile ?? '',
                doctorId: 0,
                doctorName: a.doctor.name,
                doctorSpecialty: a.doctor.specialty,
                province: a.patient.location.split(' — ')[0] ?? '',
                city: a.patient.location.split(' — ')[1] ?? '',
                scheduledAt: `${a.datetime.date}T${a.datetime.time}:00`,
                status: mapStatus(a.status.text),
                roomId: null,
            })));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const userStats = useMemo(() => computeUserStats(users), [users]);
    const paymentStats = useMemo(() => computePaymentStats(payments), [payments]);
    const signupTrend = useMemo(() => buildSignupTrend(users), [users]);
    const appointmentTrend = useMemo(() => buildAppointmentTrend(appointments), [appointments]);

    const doctorRevenue = useMemo(() => {
        const map = new Map<string, number>();
        payments.filter((p) => p.status === 'success' && p.doctorName).forEach((p) => {
            map.set(p.doctorName!, (map.get(p.doctorName!) ?? 0) + p.amount);
        });
        return Array.from(map.entries()).map(([name, amount]) => ({ name, amount })).slice(0, 8);
    }, [payments]);

    const exportCsv = (filename: string, rows: string[][]) => {
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const tabs: { id: ReportTab; label: string }[] = [
        { id: 'users', label: 'کاربران' },
        { id: 'appointments', label: 'نوبت و درآمد' },
        { id: 'ai', label: 'تشخیص AI' },
        { id: 'services', label: 'خدمات درمانی' },
    ];

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">گزارش‌ها</h2>
                    <p className="mt-1 text-sm text-slate-500">تحلیل و خروجی داده</p>
                </div>
                <button
                    type="button"
                    onClick={() => exportCsv(`report-${tab}.csv`, [['گزارش', tab], ['تاریخ', new Date().toISOString()]])}
                    className="flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm text-emerald-700"
                >
                    <FileSpreadsheet className="h-4 w-4" /> دانلود Excel/CSV
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto rounded-2xl border bg-white p-2">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium ${tab === t.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'users' && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border bg-white p-5">
                        <h3 className="mb-4 font-semibold">روند ثبت‌نام</h3>
                        <ChartContainer config={{ count: { label: 'تعداد', color: '#6366f1' } }} className="h-[260px] w-full">
                            <BarChart data={signupTrend}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                <YAxis width={32} tick={{ fontSize: 11 }} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                    <div className="rounded-2xl border bg-white p-5">
                        <h3 className="mb-4 font-semibold">خلاصه کاربران</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between"><span>کل کاربران</span><span className="font-medium">{formatFaNumber(userStats.total)}</span></li>
                            <li className="flex justify-between"><span>تأیید‌شده</span><span className="font-medium">{formatFaNumber(userStats.verified)}</span></li>
                            <li className="flex justify-between"><span>در انتظار احراز</span><span className="font-medium">{formatFaNumber(userStats.unverified)}</span></li>
                            {userStats.byRole.map((r) => (
                                <li key={r.role} className="flex justify-between text-slate-600">
                                    <span>{r.label}</span><span>{formatFaNumber(r.count)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {tab === 'appointments' && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border bg-white p-5">
                        <h3 className="mb-4 font-semibold">روند نوبت‌ها</h3>
                        <ChartContainer config={{ count: { label: 'تعداد', color: '#0ea5e9' } }} className="h-[260px] w-full">
                            <BarChart data={appointmentTrend}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                <YAxis width={32} tick={{ fontSize: 11 }} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                    <div className="rounded-2xl border bg-white p-5">
                        <h3 className="mb-4 font-semibold">درآمد پزشکان</h3>
                        <ul className="space-y-2 text-sm">
                            {doctorRevenue.map((d) => (
                                <li key={d.name} className="flex justify-between">
                                    <span className="text-slate-600">{d.name}</span>
                                    <span className="font-medium">{formatFaNumber(d.amount)} تومان</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-xs text-slate-400">درآمد کل موفق: {formatFaNumber(paymentStats.successAmount)} تومان</p>
                    </div>
                </div>
            )}

            {tab === 'ai' && (
                <div className="rounded-2xl border bg-white p-5">
                    <h3 className="mb-4 font-semibold">استفاده از تشخیص هوشمند</h3>
                    <div className="grid gap-4 sm:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-4 text-center">
                            <p className="text-2xl font-bold">{aiSessions.length}</p>
                            <p className="text-xs text-slate-500">کل session</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-4 text-center">
                            <p className="text-2xl font-bold">{aiSessions.filter((s) => s.status === 'completed').length}</p>
                            <p className="text-xs text-slate-500">تکمیل‌شده</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-4 text-center">
                            <p className="text-2xl font-bold">{aiSessions.filter((s) => s.status === 'flagged').length}</p>
                            <p className="text-xs text-slate-500">مشکوک</p>
                        </div>
                        <div className="rounded-xl bg-red-50 p-4 text-center">
                            <p className="text-2xl font-bold">{aiSessions.filter((s) => s.urgency === 'high').length}</p>
                            <p className="text-xs text-slate-500">فوریت بالا</p>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'services' && (
                <div className="rounded-2xl border bg-white p-5">
                    <h3 className="mb-4 font-semibold">گزارش خدمات درمانی</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-xs text-slate-500">
                                <th className="py-2 text-right">عنوان</th>
                                <th className="py-2 text-right">نوع</th>
                                <th className="py-2 text-right">منطقه</th>
                                <th className="py-2 text-right">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceCatalog.map((s) => (
                                <tr key={s.id} className="border-b border-slate-50">
                                    <td className="py-2">{s.title}</td>
                                    <td className="py-2">{s.type}</td>
                                    <td className="py-2">{s.province} — {s.city}</td>
                                    <td className="py-2">{s.active ? 'فعال' : 'غیرفعال'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <BarChart3 className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-500">خروجی PDF از منوی دانلود (پس از اتصال کامل API گزارش‌ها)</p>
                <button type="button" onClick={() => window.print()} className="mt-3 inline-flex items-center gap-1 text-xs text-indigo-600">
                    <Download className="h-3.5 w-3.5" /> چاپ / PDF
                </button>
            </div>
        </div>
    );
}
