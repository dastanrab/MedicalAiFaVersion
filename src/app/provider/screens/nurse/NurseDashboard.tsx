import { Link } from 'react-router';
import { ClipboardList, Calendar, Star, Wallet, MapPin, Power } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, StatusBadge } from '../../components';
import { mockChartData, mockNurseProfile } from '../../data/mockData';
import { useNurseStore } from '../../store/nurseStore';
import { nurseStatusLabels, nurseStatusStyles } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

const chartConfig = { count: { label: 'ویزیت', color: '#f43f5e' } } satisfies ChartConfig;

export function NurseDashboard() {
    const requests = useNurseStore((s) => s.requests);
    const todayVisits = requests.filter((r) =>
        ['accepted', 'on_way', 'in_progress'].includes(r.status)
    ).length;
    const newCount = requests.filter((r) => r.status === 'new').length;
    const completed = requests.filter((r) => r.status === 'completed').length;
    const revenue = requests.reduce((s, r) => s + r.amount, 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="داشبورد پرستار"
                description={`${mockNurseProfile.firstName} ${mockNurseProfile.lastName}`}
                actions={
                    <button
                        type="button"
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
                            mockNurseProfile.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                        <Power className="h-4 w-4" />
                        {mockNurseProfile.isAvailable ? 'آماده دریافت درخواست' : 'مشغول'}
                    </button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard label="درخواست‌های جدید" value={String(newCount)} icon={ClipboardList} tone="blue" />
                <KpiCard label="ویزیت‌های امروز" value={String(todayVisits)} icon={Calendar} tone="rose" />
                <KpiCard label="تکمیل این ماه" value={String(completed)} icon={MapPin} tone="emerald" />
                <KpiCard label="درآمد" value={`${revenue.toLocaleString('fa-IR')} ت`} icon={Wallet} tone="indigo" />
                <KpiCard label="امتیاز" value="۴.۷" icon={Star} tone="amber" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                    <p className="mb-4 text-sm font-semibold text-slate-700">ویزیت‌ها — ۷ روز</p>
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
                    <p className="mb-4 text-sm font-semibold">ویزیت‌های امروز</p>
                    <ul className="space-y-3">
                        {requests.slice(0, 5).map((r) => (
                            <li key={r.id} className="rounded-xl border border-slate-100 p-3">
                                <p className="text-sm font-medium">{r.patientName}</p>
                                <p className="text-xs text-slate-500">{r.scheduledAt}</p>
                                <div className="mt-2">
                                    <StatusBadge
                                        label={nurseStatusLabels[r.status]}
                                        className={nurseStatusStyles[r.status]}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Link to={providerPath('nurse', 'calendar')} className="mt-3 block text-xs text-rose-600 hover:underline">
                        مشاهده تقویم
                    </Link>
                </div>
            </div>
        </div>
    );
}
