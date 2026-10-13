import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    AlertTriangle,
    CalendarCheck,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    FileUp,
    FlaskConical,
    Loader2,
    Package,
    Pill,
    UserCheck,
    Users,
    XCircle,
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
            <div className="flex h-80 w-full items-center justify-center">
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

    // ──────────────────────────── DOCTOR (API - appointment_slots) ────────────────────────────
    if (role === 'doctor') {
        const d = apiData;
        headerTitle = `سلام ${d?.staff.name || session?.name || 'منشی مطب'}`;
        headerDescription = `${staffRoleConfig[role].title} — دکتر ${d?.staff.doctor_name || session?.ownerName || ''} · امروز ${d?.today_date || today}`;

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
            sub: a.patient_phone ? `تماس: ${a.patient_phone}` : 'ویزیت حضوری',
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
            { label: 'در انتظار آپلود جواب', value: n(r.filter((x) => x.status === 'testing').length), icon: FileUp, tone: 'indigo' },
            { label: 'در انتظار تأیید مسئول فنی', value: n(r.filter((x) => x.status === 'result_uploaded').length), icon: CheckCircle2, tone: 'emerald' },
        ];
        queueTitle = 'نمونه‌گیری‌های امروز';
        queueLink = staffPath(role, 'requests');
        queue = todays
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((x) => ({
                id: x.id,
                time: x.time,
                title: x.patientName,
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
            { label: 'در حال آماده‌سازی', value: n(r.filter((x) => x.status === 'reviewing' || x.status === 'preparing').length), icon: ClipboardList, tone: 'amber' },
            { label: 'آماده تحویل', value: n(r.filter((x) => x.status === 'ready').length), icon: Package, tone: 'emerald' },
            { label: 'داروهای رو به اتمام', value: n(data.drugStock.filter((d) => d.stock < d.minStock).length), icon: AlertTriangle, tone: 'rose' },
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
            { label: 'در انتظار تعیین پرستار', value: n(r.filter((x) => x.status === 'pending_nurse').length), icon: Users, tone: 'rose' },
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
                sub: `${x.code} · ${x.service}`,
                status: { label: staffNurseStatusLabels[x.status], className: staffNurseStatusStyles[x.status] },
            }));
    }

    return (
        <div className="space-y-6">
            <PageHeader title={headerTitle} description={headerDescription} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((k) => (
                    <KpiCard key={k.label} {...k} />
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white xl:col-span-2">
                    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                        <h3 className="font-semibold text-slate-800">{queueTitle}</h3>
                        <Link to={queueLink} className="text-xs font-medium text-indigo-600 hover:underline">
                            مشاهده همه
                        </Link>
                    </header>
                    {queue.length === 0 ? (
                        <div className="p-5">
                            <EmptyState message="نوبتی برای امروز ثبت نشده است." />
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {queue.map((q) => (
                                <li key={q.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="w-14 rounded-lg bg-slate-100 py-1 text-center text-xs font-medium text-slate-600" dir="ltr">
                                            {q.time || '—'}
                                        </span>
                                        <div>
                                            <p className="font-medium text-slate-800">{q.title}</p>
                                            <p className="text-xs text-slate-400">{q.sub}</p>
                                        </div>
                                    </div>
                                    <StatusBadge label={q.status.label} className={q.status.className} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <MyRecentActivity role={role} />
            </div>
        </div>
    );
}

function MyRecentActivity({ role }: { role: ProviderRole }) {
    const logs = useStaffStore((s) => s.logs);
    const staffId = useStaffSession(role)?.staffId;
    const recent = logs.filter((l) => l.role === role && (!staffId || l.staffId === staffId)).slice(0, 6);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white">
            <header className="border-b border-slate-100 px-5 py-3">
                <h3 className="font-semibold text-slate-800">آخرین فعالیت‌های من</h3>
            </header>
            {recent.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-slate-400">هنوز فعالیتی ثبت نشده است.</p>
            ) : (
                <ul className="space-y-3 px-5 py-4">
                    {recent.map((l) => (
                        <li key={l.id} className="text-sm">
                            <p className="font-medium text-slate-700">{l.action}</p>
                            {l.target && <p className="text-xs text-slate-500">{l.target}</p>}
                            <p className="text-xs text-slate-400">
                                {new Date(l.at).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
