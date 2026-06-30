import { Link } from 'react-router';
import {
    CalendarDays,
    Users,
    Wallet,
    MessageSquare,
    Star,
    Activity,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, StatusBadge, formatPrice } from '../../components';
import {
    mockDoctorProfile,
    mockDoctorAppointments,
    mockDoctorPatients,
    mockDoctorConsultations,
    mockDoctorActivities,
    mockDoctorRevenueChart,
    doctorVisitTypeLabels,
} from '../data/mockDoctorData';
import {
    doctorAppointmentStatusLabels,
    doctorAppointmentStatusStyles,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

const revenueChartConfig = {
    amount: { label: 'درآمد', color: '#2563eb' },
} satisfies ChartConfig;

const visitsChartConfig = {
    visits: { label: 'ویزیت', color: '#3b82f6' },
} satisfies ChartConfig;

export function DoctorDashboardPage() {
    const todayAppointments = mockDoctorAppointments.filter(
        (a) => a.date === '1404/04/10' && a.status !== 'canceled'
    ).length;
    const activeConsultations = mockDoctorConsultations.filter(
        (c) => c.status === 'active'
    ).length;
    const monthlyRevenue = mockDoctorRevenueChart.reduce((s, d) => s + d.amount, 0);
    const recentAppointments = mockDoctorAppointments
        .filter((a) => a.status !== 'canceled')
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <PageHeader
                title="داشبورد پزشک"
                description={`${mockDoctorProfile.name} — ${mockDoctorProfile.specialty}`}
                actions={
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                        doctor
                    </span>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    label="نوبت امروز"
                    value={String(todayAppointments)}
                    icon={CalendarDays}
                    tone="blue"
                />
                <KpiCard
                    label="تعداد بیماران"
                    value={String(mockDoctorPatients.length)}
                    icon={Users}
                    tone="indigo"
                />
                <KpiCard
                    label="درآمد ماه"
                    value={`${formatPrice(monthlyRevenue)} ت`}
                    icon={Wallet}
                    tone="emerald"
                />
                <KpiCard
                    label="مشاوره فعال"
                    value={String(activeConsultations)}
                    icon={MessageSquare}
                    tone="rose"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                    <p className="mb-4 text-sm font-semibold text-slate-700">درآمد — ۷ روز اخیر</p>
                    <ChartContainer config={revenueChartConfig} className="h-[220px] w-full">
                        <BarChart data={mockDoctorRevenueChart}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatPrice(v)} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="amount" fill="var(--color-amount)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Activity className="h-4 w-4 text-blue-600" />
                            آخرین فعالیت‌ها
                        </p>
                    </div>
                    <ul className="space-y-3">
                        {mockDoctorActivities.map((a) => (
                            <li key={a.id} className="rounded-xl border border-slate-100 p-3">
                                <p className="text-sm font-medium text-slate-700">{a.label}</p>
                                <p className="mt-1 text-xs text-slate-400">{a.at}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-4 text-sm font-semibold text-slate-700">تعداد ویزیت — ۷ روز</p>
                    <ChartContainer config={visitsChartConfig} className="h-[200px] w-full">
                        <LineChart data={mockDoctorRevenueChart}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="visits"
                                stroke="var(--color-visits)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ChartContainer>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">نوبت‌های اخیر</p>
                        <Link
                            to={providerPath('doctor', 'appointments')}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            همه
                        </Link>
                    </div>
                    <ul className="space-y-3">
                        {recentAppointments.map((a) => (
                            <li key={a.id} className="rounded-xl border border-slate-100 p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium">{a.patientName}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {a.date} — {a.time} — {doctorVisitTypeLabels[a.visitType]}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        label={doctorAppointmentStatusLabels[a.status]}
                                        className={doctorAppointmentStatusStyles[a.status]}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        امتیاز شما: {mockDoctorProfile.rating.toLocaleString('fa-IR')} از ۵
                    </div>
                </div>
            </div>
        </div>
    );
}
