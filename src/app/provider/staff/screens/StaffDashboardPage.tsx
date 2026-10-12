import { Link } from 'react-router';
import {
    AlertTriangle,
    CalendarCheck,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    FileUp,
    FlaskConical,
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

const n = (v: number) => formatFaNumber(v);

interface QueueItem {
    id: number;
    time: string;
    title: string;
    sub: string;
    status: { label: string; className: string };
}

export function StaffDashboardPage({ role }: { role: ProviderRole }) {
    const session = useStaffSession(role);
    const today = todayKey();
    const data = useStaffDataStore();

    let kpis: React.ComponentProps<typeof KpiCard>[] = [];
    let queue: QueueItem[] = [];
    let queueTitle = '';
    let queueLink = '';

    if (role === 'doctor') {
        const todays = data.appointments.filter((a) => a.date === today);
        kpis = [
            { label: 'نوبت‌های امروز', value: n(todays.length), icon: CalendarCheck, tone: 'blue' },
            { label: 'حاضر در مطب', value: n(todays.filter((a) => a.status === 'checked_in').length), icon: UserCheck, tone: 'amber' },
            { label: 'باقی‌مانده', value: n(todays.filter((a) => a.status === 'booked').length), icon: CalendarClock, tone: 'indigo' },
            { label: 'لغو شده', value: n(todays.filter((a) => a.status === 'canceled').length), icon: XCircle, tone: 'rose' },
        ];
        queueTitle = 'صف نوبت‌های امروز';
        queueLink = staffPath(role, 'appointments');
        queue = todays
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((a) => ({
                id: a.id,
                time: a.time,
                title: a.patientName,
                sub: a.type === 'online' ? 'ویزیت آنلاین' : 'ویزیت حضوری',
                status: { label: staffAppointmentStatusLabels[a.status], className: staffAppointmentStatusStyles[a.status] },
            }));
    } else if (role === 'lab') {
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
    } else if (role === 'pharmacy') {
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
    } else {
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
            <PageHeader
                title={`سلام ${session?.name ?? ''}`}
                description={`${staffRoleConfig[role].title} — ${session?.ownerName ?? ''} · امروز ${today}`}
            />

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
                            <EmptyState message="موردی برای امروز وجود ندارد." />
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {queue.map((q) => (
                                <li key={q.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="w-12 rounded-lg bg-slate-100 py-1 text-center text-xs font-medium text-slate-600" dir="ltr">
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
    const recent = logs.filter((l) => l.role === role && l.staffId === staffId).slice(0, 6);

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
