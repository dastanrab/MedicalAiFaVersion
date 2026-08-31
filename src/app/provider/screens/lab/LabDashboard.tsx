import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    ClipboardList,
    FlaskConical,
    Star,
    Wallet,
    TrendingUp,
    Bell,
    Power,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, StatusBadge, formatPrice } from '../../components';
import { mockChartData } from '../../data/mockData';
import { useLabStore } from '../../store/labStore';
import { labStatusLabels, labStatusStyles } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import { useProviderSession } from "../../store/providerAuthStore";

// اضافه شدن ایمپورت fetchWithAuth
import { fetchWithAuth } from '../../utils/apiClient';

const chartConfig = { count: { label: 'درخواست', color: '#f59e0b' } } satisfies ChartConfig;

interface LabProfile {
    id: number;
    name: string;
    isActive: boolean;
    address: string;
    technicalManager: string;
    workHours: string;
}

export function LabDashboard() {
    const labSession = useProviderSession('lab');
    const token = labSession?.token || '';

    const [profile, setProfile] = useState<LabProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false); // برای نمایش وضعیت در حین درخواست

    const requests = useLabStore((s) => s.requests);
    const newCount = requests.filter((r) => r.status === 'new').length;
    const inProgress = requests.filter((r) =>
        ['confirmed', 'sampled', 'testing'].includes(r.status)
    ).length;
    const ready = requests.filter((r) => ['ready', 'completed'].includes(r.status)).length;
    const totalRevenue = requests.reduce((s, r) => s + r.totalPrice, 0);

    // دریافت پروفایل از سرور
    const fetchProfile = async (showLoading = true) => {
        if (!token) {
            setError('توکن احراز هویت یافت نشد');
            if (showLoading) setLoading(false);
            return;
        }

        if (showLoading) setLoading(true);
        try {
            // جایگزینی fetch با fetchWithAuth
            const response = await fetchWithAuth('http://185.222.163.113:7000/api/owner/lab/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },"lab");

            const result = await response.json();

            if (result.status === true) {
                const labData = result.data;
                setProfile({
                    id: labData.id,
                    name: labData.name,
                    isActive: labData.status === 1,
                    address: labData.address,
                    technicalManager: labData.technical_manager,
                    workHours: labData.work_hours,
                });
                setError(null);
            } else {
                setError(result.message || 'خطا در دریافت اطلاعات');
            }
        } catch (err: any) {
            // مدیریت خطای ۴۰۱ و جلوگیری از اجرای کدهای بعدی
            if (err.message === 'UNAUTHORIZED') {
                console.warn('Session expired. Redirecting...');
                return;
            }

            console.error('Network error:', err);
            setError('مشکل در ارتباط با سرور');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // تغییر وضعیت فعال/غیرفعال
    const toggleStatus = async () => {
        if (!token) {
            alert('لطفاً وارد شوید.');
            return;
        }

        setUpdating(true);
        try {
            // جایگزینی fetch با fetchWithAuth
            const response = await fetchWithAuth('http://185.222.163.113:7000/api/owner/lab/status', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            },'lab');

            const result = await response.json();

            if (result.status === true || result.data) {
                // تلاش برای استخراج isActive از پاسخ (ساختارهای مختلف)
                let newIsActive: boolean | undefined;
                if (result.data) {
                    newIsActive = result.data.isActive ?? (result.data.status === 1);
                } else {
                    newIsActive = result.isActive ?? (result.status === 1);
                }

                if (typeof newIsActive === 'boolean') {
                    // به‌روزرسانی مستقیم state (بدون نیاز به fetch مجدد)
                    setProfile((prev) => prev ? { ...prev, isActive: newIsActive } : null);
                } else {
                    // در صورت عدم وجود اطلاعات کافی، پروفایل را مجدداً دریافت کن
                    await fetchProfile(false); // false = بدون تغییر loading اصلی
                }
            } else {
                alert(result.message || 'خطا در تغییر وضعیت');
            }
        } catch (err: any) {
            // مدیریت خطای ۴۰۱ و جلوگیری از اجرای کدهای بعدی
            if (err.message === 'UNAUTHORIZED') {
                console.warn('Session expired in toggleStatus. Redirecting...');
                return;
            }

            console.error('Network error:', err);
            alert('مشکل در ارتباط با سرور');
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchProfile(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // نمایش بارگذاری اولیه
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-slate-500">در حال بارگذاری اطلاعات...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                <p className="font-semibold">خطا</p>
                <p className="text-sm">{error || 'اطلاعات آزمایشگاه موجود نیست'}</p>
                <button
                    onClick={() => fetchProfile(true)}
                    className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="داشبورد آزمایشگاه"
                description={profile.name}
                actions={
                    <button
                        type="button"
                        onClick={toggleStatus}
                        disabled={updating}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                            profile.isActive
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } ${updating ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <Power className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
                        {updating ? 'در حال تغییر...' : (profile.isActive ? 'فعال — دریافت درخواست' : 'غیرفعال')}
                    </button>
                }
            />

            {/* کارت‌های KPI */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard label="درخواست‌های جدید" value={String(newCount)} icon={ClipboardList} tone="blue" />
                <KpiCard label="در حال انجام" value={String(inProgress)} icon={FlaskConical} tone="amber" />
                <KpiCard label="نتایج آماده" value={String(ready)} icon={Bell} tone="emerald" />
                <KpiCard label="درآمد (نمایشی)" value={`${formatPrice(totalRevenue)} ت`} icon={Wallet} tone="indigo" />
                <KpiCard label="میانگین امتیاز" value="۴.۸" sub="از ۵" icon={Star} tone="amber" />
                <KpiCard label="روند هفتگی" value="+۱۲٪" icon={TrendingUp} tone="emerald" />
            </div>

            {/* نمودار و درخواست‌های اخیر */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                    <p className="mb-4 text-sm font-semibold text-slate-700">درخواست‌ها — ۷ روز گذشته</p>
                    <ChartContainer config={chartConfig} className="h-[220px] w-full">
                        <BarChart data={mockChartData}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">درخواست‌های اخیر</p>
                        <Link to={providerPath('lab', 'requests')} className="text-xs text-amber-600 hover:underline">
                            مشاهده همه
                        </Link>
                    </div>
                    <ul className="space-y-3">
                        {requests.slice(0, 5).map((r) => (
                            <li key={r.id} className="rounded-xl border border-slate-100 p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{r.patientName}</p>
                                        <p className="text-xs text-slate-500">{r.code}</p>
                                    </div>
                                    <StatusBadge label={labStatusLabels[r.status]} className={labStatusStyles[r.status]} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* اعلان فوری */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                <p className="text-sm font-semibold text-amber-800">اعلان فوری</p>
                <p className="mt-1 text-sm text-amber-700">{newCount} درخواست جدید منتظر تأیید است.</p>
            </div>
        </div>
    );
}
