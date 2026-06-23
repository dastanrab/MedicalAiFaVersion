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
import { mockLabProfile, mockChartData } from '../../data/mockData';
import { useLabStore } from '../../store/labStore';
import { labStatusLabels, labStatusStyles } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

const chartConfig = { count: { label: 'درخواست', color: '#f59e0b' } } satisfies ChartConfig;

export function LabDashboard() {
    const requests = useLabStore((s) => s.requests);
    const newCount = requests.filter((r) => r.status === 'new').length;
    const inProgress = requests.filter((r) =>
        ['confirmed', 'sampled', 'testing'].includes(r.status)
    ).length;
    const ready = requests.filter((r) => ['ready', 'completed'].includes(r.status)).length;
    const totalRevenue = requests.reduce((s, r) => s + r.totalPrice, 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="داشبورد آزمایشگاه"
                description={mockLabProfile.labName}
                actions={
                    <button
                        type="button"
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
                            mockLabProfile.isActive
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                        <Power className="h-4 w-4" />
                        {mockLabProfile.isActive ? 'فعال — دریافت درخواست' : 'غیرفعال'}
                    </button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard label="درخواست‌های جدید" value={String(newCount)} icon={ClipboardList} tone="blue" />
                <KpiCard label="در حال انجام" value={String(inProgress)} icon={FlaskConical} tone="amber" />
                <KpiCard label="نتایج آماده" value={String(ready)} icon={Bell} tone="emerald" />
                <KpiCard label="درآمد (نمایشی)" value={`${formatPrice(totalRevenue)} ت`} icon={Wallet} tone="indigo" />
                <KpiCard label="میانگین امتیاز" value="۴.۸" sub="از ۵" icon={Star} tone="amber" />
                <KpiCard label="روند هفتگی" value="+۱۲٪" icon={TrendingUp} tone="emerald" />
            </div>

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

            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                <p className="text-sm font-semibold text-amber-800">اعلان فوری</p>
                <p className="mt-1 text-sm text-amber-700">{newCount} درخواست جدید منتظر تأیید است.</p>
            </div>
        </div>
    );
}
