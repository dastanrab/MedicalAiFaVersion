import { useMemo, useState } from 'react';
import { FileSpreadsheet, Wallet, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, formatPrice } from '../../components';
import { mockFinanceRows } from '../../data/mockData';
import type { ProviderRole } from '../../config/providerNav';

const chartConfig = {
    amount: { label: 'مبلغ', color: '#6366f1' },
} satisfies ChartConfig;

interface ProviderFinancePageProps {
    role: ProviderRole;
}

export function ProviderFinancePage({ role }: ProviderFinancePageProps) {
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
    const rows = mockFinanceRows;

    const total = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);
    const net = useMemo(() => rows.reduce((s, r) => s + r.net, 0), [rows]);
    const fee = useMemo(() => rows.reduce((s, r) => s + r.fee, 0), [rows]);

    const chartData = rows.map((r) => ({ name: r.patientName.split(' ')[0], amount: r.amount }));

    const exportExcel = () => {
        const header = ['ردیف', 'کد', 'بیمار', 'مبلغ', 'کارمزد', 'خالص', 'روش', 'تاریخ'];
        const body = rows
            .map(
                (r, i) =>
                    `<tr><td>${i + 1}</td><td>${r.code}</td><td>${r.patientName}</td><td>${r.amount}</td><td>${r.fee}</td><td>${r.net}</td><td>${r.method}</td><td>${r.date}</td></tr>`
            )
            .join('');
        const html = `<html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></body></html>`;
        const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-${role}.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="گزارش مالی"
                description="درآمد، کارمزد پلتفرم و تراکنش‌ها"
                actions={
                    <>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as typeof period)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        >
                            <option value="day">امروز</option>
                            <option value="week">این هفته</option>
                            <option value="month">این ماه</option>
                        </select>
                        <button
                            type="button"
                            onClick={exportExcel}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            خروجی Excel
                        </button>
                        <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            درخواست تسویه
                        </button>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <KpiCard label="درآمد کل" value={`${formatPrice(total)} ت`} icon={Wallet} tone="indigo" />
                <KpiCard label="کارمزد پلتفرم" value={`${formatPrice(fee)} ت`} icon={TrendingUp} tone="amber" />
                <KpiCard label="مبلغ خالص" value={`${formatPrice(net)} ت`} icon={Wallet} tone="emerald" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-4 text-sm font-semibold text-slate-700">نمودار درآمد</p>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatPrice(v)} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="amount" fill="var(--color-amount)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold">کد</th>
                            <th className="px-4 py-3 text-right font-semibold">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold">مبلغ</th>
                            <th className="px-4 py-3 text-right font-semibold">کارمزد</th>
                            <th className="px-4 py-3 text-right font-semibold">خالص</th>
                            <th className="px-4 py-3 text-right font-semibold">روش</th>
                            <th className="px-4 py-3 text-right font-semibold">تاریخ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="border-t border-slate-100">
                                <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                                <td className="px-4 py-3">{r.patientName}</td>
                                <td className="px-4 py-3">{formatPrice(r.amount)}</td>
                                <td className="px-4 py-3 text-amber-600">{formatPrice(r.fee)}</td>
                                <td className="px-4 py-3 text-emerald-600">{formatPrice(r.net)}</td>
                                <td className="px-4 py-3">{r.method}</td>
                                <td className="px-4 py-3 text-slate-500">{r.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
