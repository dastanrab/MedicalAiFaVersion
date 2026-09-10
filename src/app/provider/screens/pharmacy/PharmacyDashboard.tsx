import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    Pill,
    ClipboardList,
    Truck,
    Star,
    Wallet,
    Clock,
    Power,
    Loader2
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, StatusBadge, formatPrice } from '../../components';
import { mockPharmacyRequests } from '../../data/mockData';
import { pharmacyStatusLabels, pharmacyStatusStyles } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import {useProviderSession} from "../../store/providerAuthStore";


const BASE_URL = 'http://185.222.163.113:7000/api/owner/pharmacy';
const chartConfig = { count: { label: 'درخواست', color: '#14b8a6' } } satisfies ChartConfig;

interface DashboardApiResponse {
    profile: {
        pharmacyName: string;
        status: number;
        isOpen: boolean;
        rating: number;
        avgPrepTime: string;
    };
    stats: {
        newCount: number;
        preparing: number;
        ready: number;
        revenue: number;
    };
    chartData: Array<{
        day: string;
        date: string;
        count: number;
    }>;
}

export function PharmacyDashboard() {
    const session = useProviderSession('pharmacy');
    const token = session?.token || '';

    const [data, setData] = useState<DashboardApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState<boolean>(false);

    // دریافت داده‌های داشبورد از سرور
    const fetchDashboard = async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${BASE_URL}/dashboard`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('خطا در دریافت اطلاعات داشبورد داروخانه');
            }

            const res = await response.json();
            setData(res.data);
        } catch (err: any) {
            setError(err.message || 'خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [token]);

    // تاگل وضعیت فعال/غیرفعال (باز/بسته)
    const handleToggleStatus = async () => {
        if (!data || isToggling || !token) return;

        const nextStatus = data.profile.status === 1 ? 0 : 1;
        setIsToggling(true);

        try {
            const response = await fetch(`${BASE_URL}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (!response.ok) {
                throw new Error('خطا در به‌روزرسانی وضعیت');
            }

            const res = await response.json();

            setData((prev) =>
                prev
                    ? {
                        ...prev,
                        profile: {
                            ...prev.profile,
                            status: res.data.status,
                            isOpen: res.data.isOpen,
                        },
                    }
                    : null
            );
        } catch (err) {
            console.error(err);
            alert('تغییر وضعیت با شکست مواجه شد.');
        } finally {
            setIsToggling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-72 items-center justify-center text-sm text-rose-500">
                {error || 'اطلاعات در دسترس نیست'}
            </div>
        );
    }

    const isOpen = data.profile.isOpen ?? (data.profile.status === 1);

    return (
        <div className="space-y-6">
            <PageHeader
                title="داشبورد داروخانه"
                description={data.profile.pharmacyName}
                actions={
                    <button
                        type="button"
                        onClick={handleToggleStatus}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all shadow-sm ${
                            isOpen
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200'
                        } ${isToggling ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Power className="h-4 w-4" />
                        )}
                        <span>{isOpen ? 'باز' : 'بسته'}</span>
                    </button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard
                    label="نسخه‌های جدید"
                    value={String(data.stats.newCount)}
                    icon={ClipboardList}
                    tone="blue"
                />
                <KpiCard
                    label="در حال آماده‌سازی"
                    value={String(data.stats.preparing)}
                    icon={Pill}
                    tone="amber"
                />
                <KpiCard
                    label="آماده تحویل"
                    value={String(data.stats.ready)}
                    icon={Truck}
                    tone="emerald"
                />
                <KpiCard
                    label="درآمد"
                    value={`${formatPrice(data.stats.revenue)} ت`}
                    icon={Wallet}
                    tone="indigo"
                />
                <KpiCard
                    label="میانگین آماده‌سازی"
                    value={data.profile.avgPrepTime || '۰ دقیقه'}
                    icon={Clock}
                    tone="rose"
                />
                <KpiCard
                    label="امتیاز"
                    value={data.profile.rating ? data.profile.rating.toLocaleString('fa-IR') : '۰'}
                    icon={Star}
                    tone="amber"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                    <p className="mb-4 text-sm font-semibold text-slate-700">درخواست‌ها — ۷ روز</p>
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

                {/* لیست درخواست‌های اخیر با استفاده از mockPharmacyRequests */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">اخیر</p>
                        <Link
                            to={providerPath('pharmacy', 'requests')}
                            className="text-xs text-teal-600 hover:underline"
                        >
                            همه
                        </Link>
                    </div>
                    <ul className="space-y-3">
                        {mockPharmacyRequests.map((r) => (
                            <li key={r.id} className="rounded-xl border border-slate-100 p-3">
                                <p className="text-sm font-medium">{r.patientName}</p>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">{r.code}</span>
                                    <StatusBadge
                                        label={pharmacyStatusLabels[r.status] || r.status}
                                        className={pharmacyStatusStyles[r.status] || ''}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
