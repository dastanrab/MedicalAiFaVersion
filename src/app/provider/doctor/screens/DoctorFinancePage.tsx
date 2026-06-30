import { useMemo } from 'react';
import { Wallet, TrendingUp, ArrowDownRight } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, formatPrice } from '../../components';
import { mockDoctorFinanceTransactions } from '../data/mockDoctorData';

const chartConfig = {
    amount: { label: 'مبلغ', color: '#2563eb' },
} satisfies ChartConfig;

export function DoctorFinancePage() {
    const todayIncome = mockDoctorFinanceTransactions
        .filter((t) => t.type === 'income' && t.date === '1404/04/10')
        .reduce((s, t) => s + t.net, 0);

    const monthlyIncome = mockDoctorFinanceTransactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.net, 0);

    const settlements = mockDoctorFinanceTransactions.filter((t) => t.type === 'settlement');

    const chartData = useMemo(() => {
        return mockDoctorFinanceTransactions
            .filter((t) => t.type === 'income')
            .map((t) => ({ name: t.date, amount: t.net }));
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader title="گزارش مالی" description="درآمد، تراکنش‌ها و تسویه‌ها" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <KpiCard
                    label="درآمد امروز"
                    value={`${formatPrice(todayIncome)} ت`}
                    icon={Wallet}
                    tone="blue"
                />
                <KpiCard
                    label="درآمد ماهانه"
                    value={`${formatPrice(monthlyIncome)} ت`}
                    icon={TrendingUp}
                    tone="emerald"
                />
                <KpiCard
                    label="تسویه‌ها"
                    value={String(settlements.length)}
                    icon={ArrowDownRight}
                    tone="indigo"
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-4 text-sm font-semibold text-slate-700">نمودار درآمد</p>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatPrice(v)} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="amount" fill="var(--color-amount)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <p className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">تراکنش‌ها</p>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">مبلغ</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">کارمزد</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">خالص</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">روش</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">تاریخ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockDoctorFinanceTransactions.map((t) => (
                            <tr key={t.id} className="border-t border-slate-100">
                                <td className="px-4 py-3 font-mono text-xs">{t.code}</td>
                                <td className="px-4 py-3">{t.patientName}</td>
                                <td className="px-4 py-3">{formatPrice(t.amount)}</td>
                                <td className="px-4 py-3 text-red-600">{formatPrice(t.fee)}</td>
                                <td className="px-4 py-3 font-medium text-emerald-700">{formatPrice(t.net)}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${
                                            t.type === 'settlement'
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'bg-blue-50 text-blue-700'
                                        }`}
                                    >
                                        {t.type === 'settlement' ? 'تسویه' : t.method}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{t.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* TODO: اتصال به API مالی پزشک */}
        </div>
    );
}
