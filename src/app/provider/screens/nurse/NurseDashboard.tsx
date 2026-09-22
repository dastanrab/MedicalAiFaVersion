import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ClipboardList, Calendar, Star, Wallet, MapPin, Power, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, StatusBadge } from '../../components';
import { PanelPageSkeleton } from '../../../components/PageSkeleton';
import { nurseStatusLabels, nurseStatusStyles } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import {useProviderSession} from "../../store/providerAuthStore";

const chartConfig = { count: { label: 'ویزیت', color: '#f43f5e' } } satisfies ChartConfig;

interface DashboardData {
    profile: {
        name: string;
        status: number;
        isAvailable: boolean;
        rating: number;
    };
    stats: {
        newCount: number;
        todayVisits: number;
        completedThisMonth: number;
        revenue: number;
    };
    chartData: Array<{
        day: string;
        date: string;
        count: number;
    }>;
    recentRequests: Array<{
        id: number;
        patientName: string;
        scheduledAt: string;
        status: string;
        amount: number;
    }>;
}

export function NurseDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState<boolean>(false);

    const medicalCenterSession = useProviderSession('nurse');

    // دریافت اطلاعات داشبورد
    const fetchDashboard = async () => {
        if (!medicalCenterSession?.token) return;
        try {
            setLoading(true);
            const response = await fetch('https://api.mediraai.com/api/owner/medical-center/dashboard', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${medicalCenterSession?.token}`
                }
            });

            if (!response.ok) throw new Error('خطا در دریافت اطلاعات داشبورد');

            const res = await response.json();
            setData(res.data);
        } catch (err: any) {
            setError(err.message || 'خطایی رخ داد');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // عملیات تغییر وضعیت آنی (Toggle)
    const handleToggleStatus = async () => {
        if (!medicalCenterSession?.token) return;
        if (!data || isToggling) return;

        const nextStatus = data.profile.status === 1 ? 0 : 1;
        setIsToggling(true);

        try {
            const response = await fetch('https://api.mediraai.com/api/owner/medical-center/toggle-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${medicalCenterSession?.token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });

            if (!response.ok) throw new Error('خطا در تغییر وضعیت');

            const res = await response.json();

            // به‌روزرسانی مقدار وضعیت در استیت
            setData((prev) => prev ? {
                ...prev,
                profile: {
                    ...prev.profile,
                    status: res.data.status,
                    isAvailable: res.data.isAvailable
                }
            } : null);

        } catch (err) {
            console.error(err);
            alert('تغییر وضعیت انجام نشد.');
        } finally {
            setIsToggling(false);
        }
    };

    if (loading) {
        return <PanelPageSkeleton />;
    }

    if (error || !data) {
        return (
            <div className="flex h-72 items-center justify-center text-sm text-rose-500">
                {error || 'اطلاعاتی یافت نشد'}
            </div>
        );
    }

    const isAvailable = data.profile.status === 1;

    return (
        <div className="space-y-6">
            <PageHeader
                title="داشبورد پرستار"
                description={data.profile.name}
                actions={
                    <button
                        type="button"
                        onClick={handleToggleStatus}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all shadow-sm ${
                            isAvailable
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200'
                        } ${isToggling ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Power className="h-4 w-4" />
                        )}
                        <span>{isAvailable ? 'آماده دریافت درخواست' : 'مشغول'}</span>
                    </button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard label="درخواست‌های جدید" value={String(data.stats.newCount)} icon={ClipboardList} tone="blue" />
                <KpiCard label="ویزیت‌های امروز" value={String(data.stats.todayVisits)} icon={Calendar} tone="rose" />
                <KpiCard label="تکمیل این ماه" value={String(data.stats.completedThisMonth)} icon={MapPin} tone="emerald" />
                <KpiCard label="درآمد" value={`${data.stats.revenue.toLocaleString('fa-IR')} ت`} icon={Wallet} tone="indigo" />
                <KpiCard label="امتیاز" value={data.profile.rating ? data.profile.rating.toLocaleString('fa-IR') : '۰'} icon={Star} tone="amber" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                    <p className="mb-4 text-sm font-semibold text-slate-700">ویزیت‌ها — ۷ روز</p>
                    <ChartContainer config={chartConfig} className="h-[220px] w-full">
                        <BarChart data={data.chartData}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-4 text-sm font-semibold text-slate-700">ویزیت‌های امروز</p>
                    <ul className="space-y-3">
                        {data.recentRequests.length > 0 ? (
                            data.recentRequests.map((r) => (
                                <li key={r.id} className="rounded-xl border border-slate-100 p-3">
                                    <p className="text-sm font-medium">{r.patientName}</p>
                                    <p className="text-xs text-slate-500">{r.scheduledAt}</p>
                                    <div className="mt-2">
                                        <StatusBadge
                                            label={nurseStatusLabels[r.status] || r.status}
                                            className={nurseStatusStyles[r.status] || ''}
                                        />
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="py-6 text-center text-xs text-slate-400">درخواستی برای امروز ثبت نشده است.</p>
                        )}
                    </ul>
                    <Link to={providerPath('nurse', 'calendar')} className="mt-3 block text-xs text-rose-600 hover:underline">
                        مشاهده تقویم
                    </Link>
                </div>
            </div>
        </div>
    );
}
