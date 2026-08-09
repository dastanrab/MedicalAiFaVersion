import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    CalendarDays,
    Users,
    Wallet,
    MessageSquare,
    Star,
    Loader2,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, StatusBadge, formatPrice } from '../../components';
import {
    doctorAppointmentStatusLabels,
    doctorAppointmentStatusStyles,
} from '../../config/statusOptions';
import { doctorVisitTypeLabels } from '../data/mockDoctorData';
import { providerPath } from '../../config/providerNav';
import { useDoctorAuthStore } from '../store/doctorAuthStore';

const revenueChartConfig = {
    amount: { label: 'درآمد', color: '#2563eb' },
} satisfies ChartConfig;

const visitsChartConfig = {
    visits: { label: 'ویزیت', color: '#3b82f6' },
} satisfies ChartConfig;

interface DashboardData {
    profile: {
        name: string;
        specialty: string;
        rating: number;
    };
    stats: {
        todayAppointments: number;
        totalPatients: number;
        monthlyRevenue: number;
        activeConsultations: number;
    };
    revenueChart: Array<{
        day: string;
        amount: number;
        visits: number;
        description?: string;
    }>;
    recentAppointments: Array<{
        id: number;
        patientName: string;
        date: string;
        time: string;
        status: string;
        visitType: string;
    }>;
}

// کامپوننت تولتیپ سفارشی برای نمایش درآمد به همراه توضیحات
function CustomRevenueTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs space-y-1.5 min-w-[140px]">
                <p className="font-semibold text-slate-700">تاریخ: {label}</p>
                <div className="flex items-center justify-between gap-2 text-blue-600">
                    <span>درآمد:</span>
                    <span className="font-bold">{formatPrice(item.amount)} ت</span>
                </div>
                {item.description && (
                    <div className="pt-1.5 border-t border-slate-100 text-slate-500 max-w-[200px] break-words">
                        <span className="font-medium text-slate-700">توضیحات: </span>
                        <span>{item.description}</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
}

export function DoctorDashboardPage() {
    const token = useDoctorAuthStore((state) => state.token);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://185.222.163.113:7000/api/doctor/dashboard', {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('خطا در دریافت اطلاعات داشبورد');

                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchDashboard();
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-64 items-center justify-center text-red-500">
                {error || 'داده‌ای یافت نشد'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="داشبورد پزشک"
                description={`${data.profile.name} — ${data.profile.specialty}`}
                actions={
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                        doctor
                    </span>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    label="نوبت امروز"
                    value={String(data.stats.todayAppointments)}
                    icon={CalendarDays}
                    tone="blue"
                />
                <KpiCard
                    label="تعداد بیماران"
                    value={String(data.stats.totalPatients)}
                    icon={Users}
                    tone="indigo"
                />
                <KpiCard
                    label="درآمد ماه"
                    value={`${formatPrice(data.stats.monthlyRevenue)} ت`}
                    icon={Wallet}
                    tone="emerald"
                />
                <KpiCard
                    label="مشاوره فعال"
                    value={String(data.stats.activeConsultations)}
                    icon={MessageSquare}
                    tone="rose"
                />
            </div>

            {/* چارت درآمد - همراه با توضیحات در تولتیپ */}
            <div className="grid gap-6 lg:grid-cols-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-4 text-sm font-semibold text-slate-700">درآمد — ۷ روز اخیر</p>
                    <ChartContainer config={revenueChartConfig} className="h-[220px] w-full">
                        <BarChart data={data.revenueChart}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatPrice(v)} />
                            <Tooltip content={<CustomRevenueTooltip />} />
                            <Bar dataKey="amount" fill="var(--color-amount)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* چارت ویزیت‌ها */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-4 text-sm font-semibold text-slate-700">تعداد ویزیت — ۷ روز</p>
                    <ChartContainer config={visitsChartConfig} className="h-[200px] w-full">
                        <LineChart data={data.revenueChart}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
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

                {/* نوبت‌های اخیر */}
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
                        {data.recentAppointments.length > 0 ? (
                            data.recentAppointments.map((a) => (
                                <li key={a.id} className="rounded-xl border border-slate-100 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium">{a.patientName}</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {a.date} — {a.time} — {doctorVisitTypeLabels[a.visitType] || 'حضوری'}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            label={doctorAppointmentStatusLabels[a.status] || a.status}
                                            className={doctorAppointmentStatusStyles[a.status] || ''}
                                        />
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-4">نوبتی یافت نشد.</p>
                        )}
                    </ul>
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        امتیاز شما: {data.profile.rating?.toLocaleString('fa-IR')} از ۵
                    </div>
                </div>
            </div>
        </div>
    );
}
