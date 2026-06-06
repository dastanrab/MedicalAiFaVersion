import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    CreditCard,
    BadgeCheck,
    ShieldBan,
    TrendingUp,
    AlertTriangle,
    RefreshCw,
    ArrowLeft,
    Clock,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../components/ui/chart';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { sampleAppointments } from '../data/sampleAppointments';
import { samplePayments } from '../data/samplePayments';
import {
    appointmentStatusLabels,
    appointmentStatusStyles,
    type AdminAppointmentRow,
} from '../config/appointmentOptions';
import {
    paymentServiceLabels,
    paymentServiceStyles,
    paymentStatusLabels,
    paymentStatusStyles,
    type AdminPaymentRow,
} from '../config/paymentOptions';
import { userTypeLabels, userTypeStyles, type AdminUserRow, type UserType, type UserStatus } from '../config/userOptions';
import { AdminDashboardSkeleton } from '../components/AdminDashboardSkeleton';
import {
    computeAppointmentStats,
    computePaymentStats,
    computeUserStats,
    formatFaDateTime,
    formatFaNumber,
} from '../utils/dashboardStats';

const USERS_API_URL = 'http://185.222.163.113:7000/api/admin/users';

const statusMapApiToFront: Record<number, UserStatus> = {
    1: 'active',
    0: 'blocked',
};

function normalizeUserFromApi(user: Record<string, unknown>): AdminUserRow {
    const name = (user.name as string) ?? '';
    return {
        ...(user as AdminUserRow),
        firstName: name.split(' ')[0] ?? '',
        lastName: name.split(' ').slice(1).join(' ') ?? '',
        status: statusMapApiToFront[user.status as number] ?? 'blocked',
        isVerified: Boolean(user.is_verify),
        type: user.role as UserType,
    };
}

async function fetchAllUsers(token: string): Promise<AdminUserRow[]> {
    const perPage = 100;
    const all: AdminUserRow[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        const response = await fetch(`${USERS_API_URL}?page=${page}&per_page=${perPage}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`خطا در دریافت کاربران: ${response.statusText}`);
        }

        const result = await response.json();
        const payload = result.data;
        const normalized = payload.data.map((user: Record<string, unknown>) =>
            normalizeUserFromApi(user)
        );
        all.push(...normalized);
        totalPages = Math.max(1, Math.ceil(payload.total / perPage));
        page++;
    }

    return all;
}

const roleChartConfig = {
    count: { label: 'تعداد', color: '#6366f1' },
    patient: { label: userTypeLabels.patient, color: '#64748b' },
    doctor: { label: userTypeLabels.doctor, color: '#6366f1' },
    pharmacy: { label: userTypeLabels.pharmacy, color: '#14b8a6' },
    lab: { label: userTypeLabels.lab, color: '#f59e0b' },
} satisfies ChartConfig;

const appointmentChartConfig = {
    count: { label: 'تعداد', color: '#0ea5e9' },
    booked: { label: appointmentStatusLabels.booked, color: '#0ea5e9' },
    done: { label: appointmentStatusLabels.done, color: '#10b981' },
    canceled: { label: appointmentStatusLabels.canceled, color: '#ef4444' },
    'no-show': { label: appointmentStatusLabels['no-show'], color: '#f59e0b' },
} satisfies ChartConfig;

const paymentChartConfig = {
    amount: { label: 'مبلغ', color: '#8b5cf6' },
    count: { label: 'تعداد', color: '#6366f1' },
    appointment: { label: 'نوبت', color: '#6366f1' },
    subscription: { label: 'اشتراک', color: '#8b5cf6' },
    lab: { label: 'آزمایش', color: '#06b6d4' },
    consultation: { label: 'مشاوره', color: '#0ea5e9' },
} satisfies ChartConfig;

const roleColors: Record<UserType, string> = {
    patient: '#64748b',
    doctor: '#6366f1',
    pharmacy: '#14b8a6',
    lab: '#f59e0b',
};

const appointmentColors: Record<string, string> = {
    booked: '#0ea5e9',
    done: '#10b981',
    canceled: '#ef4444',
    'no-show': '#f59e0b',
};

interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    tone?: 'default' | 'emerald' | 'amber' | 'indigo' | 'rose';
}

function KpiCard({ label, value, sub, icon: Icon, tone = 'default' }: KpiCardProps) {
    const tones = {
        default: 'border-slate-200 bg-white text-slate-800',
        emerald: 'border-emerald-100 bg-emerald-50/50 text-emerald-800',
        amber: 'border-amber-100 bg-amber-50/50 text-amber-800',
        indigo: 'border-indigo-100 bg-indigo-50/50 text-indigo-800',
        rose: 'border-rose-100 bg-rose-50/50 text-rose-800',
    };
    const iconTones = {
        default: 'bg-slate-100 text-slate-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        amber: 'bg-amber-100 text-amber-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        rose: 'bg-rose-100 text-rose-600',
    };

    return (
        <div className={`rounded-2xl border px-4 py-4 ${tones[tone]}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold">{value}</p>
                    {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function SectionLink({ to, label }: { to: string; label: string }) {
    return (
        <Link
            to={to}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition hover:text-indigo-700"
        >
            {label}
            <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
    );
}

export function AdminDashboard() {
    const token = useAdminAuthStore((state) => state.token);
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [appointments] = useState<AdminAppointmentRow[]>(sampleAppointments);
    const [payments] = useState<AdminPaymentRow[]>(samplePayments);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadUsers = useCallback(async () => {
        if (!token) {
            setError('توکن احراز هویت معتبر نیست.');
            setLoading(false);
            return;
        }

        setError(null);
        try {
            const data = await fetchAllUsers(token);
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const userStats = useMemo(() => computeUserStats(users), [users]);
    const appointmentStats = useMemo(() => computeAppointmentStats(appointments), [appointments]);
    const paymentStats = useMemo(() => computePaymentStats(payments), [payments]);

    const roleChartData = useMemo(
        () =>
            userStats.byRole.map((item) => ({
                role: item.role,
                label: item.label,
                count: item.count,
                fill: roleColors[item.role],
            })),
        [userStats.byRole]
    );

    const appointmentChartData = useMemo(
        () =>
            appointmentStats.byStatus.map((item) => ({
                status: item.status,
                label: item.label,
                count: item.count,
                fill: appointmentColors[item.status],
            })),
        [appointmentStats.byStatus]
    );

    const serviceChartData = useMemo(
        () =>
            paymentStats.byService
                .filter((item) => item.count > 0)
                .map((item) => ({
                    service: item.service,
                    label: item.label,
                    amount: item.amount,
                    count: item.count,
                })),
        [paymentStats.byService]
    );

    const alerts = useMemo(() => {
        const items: { text: string; tone: 'amber' | 'rose' | 'indigo' }[] = [];
        if (userStats.unverified > 0) {
            items.push({
                text: `${formatFaNumber(userStats.unverified)} کاربر در انتظار احراز هویت`,
                tone: 'amber',
            });
        }
        if (userStats.blocked > 0) {
            items.push({
                text: `${formatFaNumber(userStats.blocked)} کاربر مسدود`,
                tone: 'rose',
            });
        }
        if (paymentStats.pendingCount > 0) {
            items.push({
                text: `${formatFaNumber(paymentStats.pendingCount)} پرداخت در انتظار تأیید`,
                tone: 'amber',
            });
        }
        if (paymentStats.failedCount > 0) {
            items.push({
                text: `${formatFaNumber(paymentStats.failedCount)} پرداخت ناموفق`,
                tone: 'rose',
            });
        }
        if (appointmentStats.noShow > 0) {
            items.push({
                text: `${formatFaNumber(appointmentStats.noShow)} نوبت با عدم حضور`,
                tone: 'indigo',
            });
        }
        return items;
    }, [userStats, paymentStats, appointmentStats]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadUsers();
    };

    if (loading) {
        return <AdminDashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-red-500">
                <p>{error}</p>
                <button
                    type="button"
                    onClick={handleRefresh}
                    className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">داشبورد مدیریت</h2>
                        <p className="text-sm text-slate-500">نمای کلی عملکرد و وضعیت سامانه</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    بروزرسانی
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <KpiCard
                    label="کل کاربران"
                    value={formatFaNumber(userStats.total)}
                    sub={`${formatFaNumber(userStats.verified)} تأیید‌شده`}
                    icon={Users}
                    tone="indigo"
                />
                <KpiCard
                    label="نوبت‌های امروز"
                    value={formatFaNumber(appointmentStats.today)}
                    sub={`${formatFaNumber(appointmentStats.booked)} رزرو فعال`}
                    icon={CalendarCheck}
                />
                <KpiCard
                    label="درآمد موفق"
                    value={formatFaNumber(paymentStats.successAmount)}
                    sub="تومان"
                    icon={TrendingUp}
                    tone="emerald"
                />
                <KpiCard
                    label="تراکنش موفق"
                    value={formatFaNumber(paymentStats.successCount)}
                    sub={`از ${formatFaNumber(paymentStats.total)} تراکنش`}
                    icon={CreditCard}
                    tone="emerald"
                />
                <KpiCard
                    label="در انتظار احراز"
                    value={formatFaNumber(userStats.unverified)}
                    sub="کاربر"
                    icon={BadgeCheck}
                    tone="amber"
                />
                <KpiCard
                    label="کاربران مسدود"
                    value={formatFaNumber(userStats.blocked)}
                    icon={ShieldBan}
                    tone="rose"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">توزیع کاربران بر اساس نقش</h3>
                            <p className="mt-0.5 text-xs text-slate-500">داده زنده از API</p>
                        </div>
                        <SectionLink to="/admin/users" label="مدیریت کاربران" />
                    </div>
                    {roleChartData.length > 0 ? (
                        <ChartContainer config={roleChartConfig} className="mx-auto aspect-auto h-[260px] w-full">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                                <Pie
                                    data={roleChartData}
                                    dataKey="count"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={3}
                                >
                                    {roleChartData.map((entry) => (
                                        <Cell key={entry.role} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
                            داده‌ای برای نمایش وجود ندارد
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {roleChartData.map((item) => (
                            <span
                                key={item.role}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${userTypeStyles[item.role]}`}
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: item.fill }}
                                />
                                {item.label}: {formatFaNumber(item.count)}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">وضعیت نوبت‌ها</h3>
                            <p className="mt-0.5 text-xs text-slate-500">کل {formatFaNumber(appointmentStats.total)} نوبت</p>
                        </div>
                        <SectionLink to="/admin/appointments" label="مدیریت نوبت‌ها" />
                    </div>
                    <ChartContainer config={appointmentChartConfig} className="aspect-auto h-[260px] w-full">
                        <BarChart data={appointmentChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={32} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {appointmentChartData.map((entry) => (
                                    <Cell key={entry.status} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">درآمد بر اساس نوع خدمت</h3>
                            <p className="mt-0.5 text-xs text-slate-500">فقط پرداخت‌های موفق</p>
                        </div>
                        <SectionLink to="/admin/payments" label="مدیریت پرداخت‌ها" />
                    </div>
                    <ChartContainer config={paymentChartConfig} className="aspect-auto h-[260px] w-full">
                        <BarChart data={serviceChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                width={48}
                                tickFormatter={(v) => formatFaNumber(Number(v))}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => `${formatFaNumber(Number(value))} تومان`}
                                    />
                                }
                            />
                            <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">روند تراکنش‌ها</h3>
                            <p className="mt-0.5 text-xs text-slate-500">تعداد تراکنش در روزهای اخیر</p>
                        </div>
                    </div>
                    <ChartContainer config={paymentChartConfig} className="aspect-auto h-[260px] w-full">
                        <BarChart data={paymentStats.dailyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={32} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">نوبت‌های پیش‌رو</h3>
                            <p className="mt-0.5 text-xs text-slate-500">۵ نوبت بعدی با وضعیت رزرو شده</p>
                        </div>
                        <SectionLink to="/admin/appointments" label="همه نوبت‌ها" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs text-slate-500">
                                    <th className="px-5 py-3 text-right font-medium">بیمار</th>
                                    <th className="px-5 py-3 text-right font-medium">پزشک</th>
                                    <th className="px-5 py-3 text-right font-medium">زمان</th>
                                    <th className="px-5 py-3 text-right font-medium">وضعیت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointmentStats.upcoming.length > 0 ? (
                                    appointmentStats.upcoming.map((row) => (
                                        <tr key={row.id} className="border-b border-slate-50 last:border-0">
                                            <td className="px-5 py-3 font-medium text-slate-800">{row.patientName}</td>
                                            <td className="px-5 py-3 text-slate-600">{row.doctorName}</td>
                                            <td className="px-5 py-3 text-slate-600">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatFaDateTime(row.scheduledAt)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${appointmentStatusStyles[row.status]}`}
                                                >
                                                    {appointmentStatusLabels[row.status]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                                            نوبت پیش‌رویی ثبت نشده است
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-slate-800">نیاز به توجه</h3>
                    </div>
                    {alerts.length > 0 ? (
                        <ul className="space-y-3">
                            {alerts.map((alert, index) => (
                                <li
                                    key={index}
                                    className={`rounded-xl border px-3 py-2.5 text-sm ${
                                        alert.tone === 'amber'
                                            ? 'border-amber-100 bg-amber-50/60 text-amber-800'
                                            : alert.tone === 'rose'
                                              ? 'border-rose-100 bg-rose-50/60 text-rose-800'
                                              : 'border-indigo-100 bg-indigo-50/60 text-indigo-800'
                                    }`}
                                >
                                    {alert.text}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500">مورد فوری برای پیگیری وجود ندارد.</p>
                    )}

                    {userStats.byProvince.length > 0 && (
                        <div className="mt-6 border-t border-slate-100 pt-4">
                            <h4 className="mb-3 text-xs font-semibold text-slate-600">برترین استان‌ها (کاربران)</h4>
                            <ul className="space-y-2">
                                {userStats.byProvince.map((item) => (
                                    <li key={item.province} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">{item.province}</span>
                                        <span className="font-medium text-slate-800">
                                            {formatFaNumber(item.count)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">آخرین تراکنش‌ها</h3>
                        <p className="mt-0.5 text-xs text-slate-500">۵ تراکنش اخیر</p>
                    </div>
                    <SectionLink to="/admin/payments" label="همه پرداخت‌ها" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs text-slate-500">
                                <th className="px-5 py-3 text-right font-medium">کد پیگیری</th>
                                <th className="px-5 py-3 text-right font-medium">پرداخت‌کننده</th>
                                <th className="px-5 py-3 text-right font-medium">مبلغ</th>
                                <th className="px-5 py-3 text-right font-medium">نوع خدمت</th>
                                <th className="px-5 py-3 text-right font-medium">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentStats.recent.map((row) => (
                                <tr key={row.id} className="border-b border-slate-50 last:border-0">
                                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{row.trackingCode}</td>
                                    <td className="px-5 py-3 font-medium text-slate-800">{row.patientName}</td>
                                    <td className="px-5 py-3 text-slate-700">
                                        {formatFaNumber(row.amount)} تومان
                                    </td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${paymentServiceStyles[row.serviceType]}`}
                                        >
                                            {paymentServiceLabels[row.serviceType]}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${paymentStatusStyles[row.status]}`}
                                        >
                                            {paymentStatusLabels[row.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link
                    to="/admin/users"
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                    <Users className="h-5 w-5 text-indigo-600" />
                    <div>
                        <p className="text-sm font-medium text-slate-800">مدیریت کاربران</p>
                        <p className="text-xs text-slate-500">{formatFaNumber(userStats.total)} کاربر</p>
                    </div>
                </Link>
                <Link
                    to="/admin/appointments"
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                    <CalendarCheck className="h-5 w-5 text-indigo-600" />
                    <div>
                        <p className="text-sm font-medium text-slate-800">مدیریت نوبت‌ها</p>
                        <p className="text-xs text-slate-500">{formatFaNumber(appointmentStats.total)} نوبت</p>
                    </div>
                </Link>
                <Link
                    to="/admin/payments"
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <div>
                        <p className="text-sm font-medium text-slate-800">مدیریت پرداخت‌ها</p>
                        <p className="text-xs text-slate-500">
                            {formatFaNumber(paymentStats.successAmount)} تومان درآمد
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
