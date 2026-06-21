import { Link } from 'react-router';
import { Pill, ClipboardList, Truck, Star, Wallet, Clock, Power } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, StatusBadge, formatPrice } from '../../components';
import { mockPharmacyRequests, mockChartData, mockPharmacyProfile } from '../../data/mockData';
import { pharmacyStatusLabels, pharmacyStatusStyles } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

const chartConfig = { count: { label: 'درخواست', color: '#14b8a6' } } satisfies ChartConfig;

export function PharmacyDashboard() {
    const newCount = mockPharmacyRequests.filter((r) => r.status === 'new').length;
    const preparing = mockPharmacyRequests.filter((r) =>
        ['reviewing', 'preparing'].includes(r.status)
    ).length;
    const ready = mockPharmacyRequests.filter((r) => r.status === 'ready').length;
    const revenue = mockPharmacyRequests.reduce((s, r) => s + r.totalPrice, 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="داشبورد داروخانه"
                description={mockPharmacyProfile.pharmacyName}
                actions={
                    <button
                        type="button"
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
                            mockPharmacyProfile.isOpen
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                        <Power className="h-4 w-4" />
                        {mockPharmacyProfile.isOpen ? 'باز' : 'بسته'}
                    </button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard label="نسخه‌های جدید" value={String(newCount)} icon={ClipboardList} tone="blue" />
                <KpiCard label="در حال آماده‌سازی" value={String(preparing)} icon={Pill} tone="amber" />
                <KpiCard label="آماده تحویل" value={String(ready)} icon={Truck} tone="emerald" />
                <KpiCard label="درآمد" value={`${formatPrice(revenue)} ت`} icon={Wallet} tone="indigo" />
                <KpiCard label="میانگین آماده‌سازی" value="۲۵ دقیقه" icon={Clock} tone="rose" />
                <KpiCard label="امتیاز" value="۴.۹" icon={Star} tone="amber" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                    <p className="mb-4 text-sm font-semibold text-slate-700">درخواست‌ها — ۷ روز</p>
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
                        <p className="text-sm font-semibold text-slate-700">اخیر</p>
                        <Link to={providerPath('pharmacy', 'requests')} className="text-xs text-teal-600 hover:underline">
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
                                        label={pharmacyStatusLabels[r.status]}
                                        className={pharmacyStatusStyles[r.status]}
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
