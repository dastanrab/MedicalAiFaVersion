import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    AlertTriangle,
    CalendarCheck,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileUp,
    FlaskConical,
    Loader2,
    Package,
    Phone,
    Pill,
    UserCheck,
    Users,
} from 'lucide-react';
import { EmptyState, KpiCard, PageHeader, StatusBadge, formatFaNumber } from '../../components';
import type { ProviderRole } from '../../config/providerNav';
import { staffPath, staffRoleConfig } from '../config/staffPermissions';
import {
    staffAppointmentStatusLabels,
    staffAppointmentStatusStyles,
    staffLabStatusLabels,
    staffLabStatusStyles,
    staffNurseStatusLabels,
    staffNurseStatusStyles,
} from '../config/staffStatusOptions';
import { pharmacyStatusLabels, pharmacyStatusStyles } from '../../config/statusOptions';
import { todayKey } from '../data/mockStaffData';
import { useStaffDataStore } from '../store/staffDataStore';
import { useStaffSession, useStaffStore } from '../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';
const n = (v: number) => formatFaNumber(v);

interface QueueItem {
    id: number;
    time: string;
    title: string;
    sub: string;
    phone?: string;
    status: { label: string; className: string };
}

interface DoctorDashboardApiResponse {
    staff: {
        id: number;
        name: string;
        phone: string;
        doctor_name: string;
    };
    today_date: string;
    kpis: {
        today_total: number;
        checked_in: number;
        remaining: number;
        done: number;
    };
    queue: Array<{
        id: number;
        time: string;
        patient_name: string;
        patient_phone: string;
        type: string;
        status: keyof typeof staffAppointmentStatusLabels;
    }>;
}

export function StaffDashboardPage({ role }: { role: ProviderRole }) {
    const session = useStaffSession(role);
    const logout = useStaffStore((s) => s.logout);
    const today = todayKey();
    const data = useStaffDataStore();

    const [loading, setLoading] = useState(role === 'doctor');
    const [apiData, setApiData] = useState<DoctorDashboardApiResponse | null>(null);

    useEffect(() => {
        if (role !== 'doctor') return;

        let isMounted = true;
        const fetchDashboardData = async () => {
            if (!session?.token) {
                logout(role);
                return;
            }

            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/staff/doctor/dashboard`, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${session.token}`,
                    },
                });

                if (res.status === 401) {
                    logout(role);
                    return;
                }

                const result = await res.json();
                if (result.success && isMounted) {
                    setApiData(result.data);
                }
            } catch (error) {
                console.error('Error fetching doctor staff dashboard:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDashboardData();

        return () => {
            isMounted = false;
        };
    }, [role, session?.token, logout]);

    if (loading && role === 'doctor') {
        return (
            <div className="flex h-72 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    let kpis: React.ComponentProps<typeof KpiCard>[] = [];
    let queue: QueueItem[] = [];
    let queueTitle = '';
    let queueLink = '';
    let headerTitle = `سلام ${session?.name ?? ''}`;
    let headerDescription = `${staffRoleConfig[role].title} — ${session?.ownerName ?? ''} · امروز ${today}`;

    // ──────────────────────────── DOCTOR (API) ────────────────────────────
    if (role === 'doctor') {
        const d = apiData;
        headerTitle = `سلام ${d?.staff.name || session?.name || 'منشی مطب'}`;
        headerDescription = `${staffRoleConfig[role].title} — دکتر ${d?.staff.doctor_name || session?.ownerName || ''} · ${d?.today_date || today}`;

        kpis = [
            { label: 'نوبت‌های امروز', value: n(d?.kpis.today_total ?? 0), icon: CalendarCheck, tone: 'blue' },
            { label: 'حاضر در مطب', value: n(d?.kpis.checked_in ?? 0), icon: UserCheck, tone: 'amber' },
            { label: 'در انتظار نوبت', value: n(d?.kpis.remaining ?? 0), icon: CalendarClock, tone: 'indigo' },
            { label: 'ویزیت شده', value: n(d?.kpis.done ?? 0), icon: CheckCircle2, tone: 'emerald' },
        ];

        queueTitle = 'صف نوبت‌های امروز';
        queueLink = staffPath(role, 'appointments');

        queue = (d?.queue ?? []).map((a) => ({
            id: a.id,
            time: a.time,
            title: a.patient_name,
            phone: a.patient_phone || undefined,
            sub: a.type || 'ویزیت حضوری',
            status: {
                label: staffAppointmentStatusLabels[a.status] ?? a.status,
                className: staffAppointmentStatusStyles[a.status] ?? 'bg-slate-100 text-slate-700',
            },
        }));
    }
    // ──────────────────────────── LAB (Mock) ────────────────────────────
    else if (role === 'lab') {
        const r = data.labRequests;
        const todays = r.filter((x) => x.date === today && x.status !== 'canceled');
        kpis = [
            { label: 'درخواست‌های جدید', value: n(r.filter((x) => x.status === 'new').length), icon: ClipboardList, tone: 'blue' },
            { label: 'نمونه‌گیری امروز', value: n(todays.length), icon: FlaskConical, tone: 'amber' },
            { label: 'در انتظار جواب', value: n(r.filter((x) => x.status === 'testing').length), icon: FileUp, tone: 'indigo' },
            { label: 'تأیید مسئول فنی', value: n(r.filter((x) => x.status === 'result_uploaded').length), icon: CheckCircle2, tone: 'emerald' },
        ];
        queueTitle = 'نمونه‌گیری‌های امروز';
        queueLink = staffPath(role, 'requests');
        queue = todays
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((x) => ({
                id: x.id,
                time: x.time,
                title: x.patientName,
                phone: x.phone,
                sub: `${x.code} · ${x.type === 'home' ? 'در منزل' : 'حضوری'}`,
                status: { label: staffLabStatusLabels[x.status], className: staffLabStatusStyles[x.status] },
            }));
    }
    // ──────────────────────────── PHARMACY (Mock) ────────────────────────────
    else if (role === 'pharmacy') {
        const r = data.pharmacyRequests;
        const active = r.filter((x) => ['new', 'reviewing', 'preparing', 'ready'].includes(x.status));
        kpis = [
            { label: 'نسخه‌های جدید', value: n(r.filter((x) => x.status === 'new').length), icon: Pill, tone: 'blue' },
            { label: 'آماده‌سازی', value: n(r.filter((x) => x.status === 'reviewing' || x.status === 'preparing').length), icon: ClipboardList, tone: 'amber' },
            { label: 'آماده تحویل', value: n(r.filter((x) => x.status === 'ready').length), icon: Package, tone: 'emerald' },
            { label: 'کسری دارو', value: n(data.drugStock.filter((d) => d.stock < d.minStock).length), icon: AlertTriangle, tone: 'rose' },
        ];
        queueTitle = 'نسخه‌های در جریان';
        queueLink = staffPath(role, 'requests');
        queue = active.map((x) => ({
            id: x.id,
            time: x.createdAt.split(' ')[1] ?? '',
            title: x.patientName,
            sub: x.code,
            status: { label: pharmacyStatusLabels[x.status], className: pharmacyStatusStyles[x.status] },
        }));
    }
    // ──────────────────────────── NURSE (Mock) ────────────────────────────
    else {
        const r = data.nurseRequests;
        const todays = r.filter((x) => x.date === today && x.status !== 'canceled');
        kpis = [
            { label: 'تعیین پرستار', value: n(r.filter((x) => x.status === 'pending_nurse').length), icon: Users, tone: 'rose' },
            { label: 'ویزیت‌های امروز', value: n(todays.length), icon: CalendarCheck, tone: 'blue' },
            { label: 'در انتظار اعزام', value: n(r.filter((x) => x.status === 'pending_visit').length), icon: CalendarClock, tone: 'amber' },
            { label: 'تکمیل شده', value: n(r.filter((x) => x.status === 'completed').length), icon: CheckCircle2, tone: 'emerald' },
        ];
        queueTitle = 'درخواست‌های امروز';
        queueLink = staffPath(role, 'requests');
        queue = todays
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((x) => ({
                id: x.id,
                time: x.time,
                title: x.patientName,
                phone: x.phone,
                sub: `${x.code} · ${x.service}`,
                status: { label: staffNurseStatusLabels[x.status], className: staffNurseStatusStyles[x.status] },
            }));
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header صفحه با قابلیت تطبیق سایز متن در موبایل */}
            <div className="flex flex-col gap-1">
                <PageHeader title={headerTitle} description={headerDescription} />
            </div>

            {/* کارت‌های KPI: در موبایل 2 تایی و در دسکتاپ 4 تایی */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
                {kpis.map((k) => (
                    <KpiCard key={k.label} {...k} />
                ))}
            </div>

            {/* بخش‌های اصلی چیدمان */}
            <div className="grid gap-4 sm:gap-6 xl:grid-cols-3">
                {/* کارت صف اصلی نوبت‌ها/درخواست‌ها */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                    <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-indigo-600 sm:hidden" />
                            <h3 className="text-sm font-bold text-slate-800 sm:text-base">{queueTitle}</h3>
                        </div>
                        <Link
                            to={queueLink}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 active:scale-95 transition"
                        >
                            مشاهده همه
                        </Link>
                    </header>

                    {queue.length === 0 ? (
                        <div className="p-4 sm:p-5">
                            <EmptyState message="موردی برای نمایش امروز ثبت نشده است." />
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {queue.map((q) => (
                                <li
                                    key={q.id}
                                    className="flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5 transition hover:bg-slate-50/70"
                                >
                                    {/* سطر اصلی موبایل: ساعت، نام و نشان وضعیت */}
                                    <div className="flex items-start justify-between sm:justify-start sm:items-center gap-3">
                                        <span
                                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 min-w-[52px]"
                                            dir="ltr"
                                        >
                                            {q.time || '—'}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-800">{q.title}</p>
                                            <p className="truncate text-xs text-slate-400 mt-0.5">{q.sub}</p>
                                        </div>
                                        {/* نشان وضعیت در موبایل داخل همین سطر بالا می‌آید */}
                                        <div className="sm:hidden shrink-0">
                                            <StatusBadge label={q.status.label} className={q.status.className} />
                                        </div>
                                    </div>

                                    {/* اکشن‌ها و جزئیات تماسی در موبایل و دسکتاپ */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t border-slate-100/60 sm:border-0">
                                        {q.phone ? (
                                            <a
                                                href={`tel:${q.phone}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition"
                                                dir="ltr"
                                            >
                                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                <span>{q.phone}</span>
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-slate-400 sm:hidden">بدون شماره تماس</span>
                                        )}

                                        {/* نشان وضعیت در دسکتاپ */}
                                        <div className="hidden sm:block">
                                            <StatusBadge label={q.status.label} className={q.status.className} />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* بخش فعالیت‌های من */}
                <MyRecentActivity role={role} />
            </div>
        </div>
    );
}

function MyRecentActivity({ role }: { role: ProviderRole }) {
    const logs = useStaffStore((s) => s.logs);
    const staffId = useStaffSession(role)?.staffId;
    const recent = logs.filter((l) => l.role === role && (!staffId || l.staffId === staffId)).slice(0, 5);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-100 px-4 py-3 sm:px-5">
                <h3 className="text-sm font-bold text-slate-800 sm:text-base">آخرین فعالیت‌های من</h3>
            </header>
            {recent.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs sm:text-sm text-slate-400">هنوز فعالیتی ثبت نشده است.</p>
            ) : (
                <ul className="divide-y divide-slate-50 px-4 py-2 sm:px-5">
                    {recent.map((l) => (
                        <li key={l.id} className="py-2.5 first:pt-1 last:pb-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">{l.action}</p>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                                {l.target ? <span className="truncate max-w-[150px]">{l.target}</span> : <span />}
                                <span dir="ltr">
                                    {new Date(l.at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
