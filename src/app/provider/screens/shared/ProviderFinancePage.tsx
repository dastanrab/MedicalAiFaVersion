import { useMemo, useState, useEffect } from 'react';
import { FileSpreadsheet, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, formatPrice } from '../../components';
import type { ProviderRole } from '../../config/providerNav';
import {format} from "date-fns";
import {useProviderSession} from "../../store/providerAuthStore";
import {useNavigate} from "react-router";

const chartConfig = {
    amount: { label: 'مبلغ', color: '#f59e0b' },
} satisfies ChartConfig;

interface TransactionRow {
    id: number;
    code: string;
    amount: number;
    type: 1 | 2; // 1: واریز (Deposit), 2: برداشت (Withdraw)
    description: string;
    date: string;
    reason_ref?: string | null; // اضافه شد
}

interface ProviderFinancePageProps {
    role: ProviderRole;
}

export function ProviderFinancePage({ role }: ProviderFinancePageProps) {
    const labSession = useProviderSession(role);
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
    const [rows, setRows] = useState<TransactionRow[]>([]);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    console.log(role,'ssss')
    const isLab = role === 'lab';
    const navigate = useNavigate();
    // دریافت داده‌ها از API
    useEffect(() => {
        const fetchFinanceData = async () => {
            setIsLoading(true);
            try {
                // جایگزین با متد fetch یا axios واقعی خودتان
                const response = await fetch(`http://185.222.163.113:7000/api/owner/${role == 'lab' ? 'lab':'medical-center'}/finance?period=${period}`, {
                    headers: { 'Authorization': `Bearer ${labSession?.token}` }
                });
                const result = await response.json();

                if (result.status === 200) {
                    setRows(result.data.rows);
                    setTotalIncome(result.data.balance);
                }
            } catch (error) {
                console.error('Error fetching finance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinanceData();
    }, [period]);

    // آماده‌سازی داده برای نمودار (نمایش واریزی‌های اخیر)
    const chartData = useMemo(() => {
        return rows
            .filter(r => r.type === 1)
            .slice(0, 10)
            .map((r) => ({
                // تبدیل تاریخ برای محور X نمودار
                name: format(new Date(r.date), 'yyyy/MM/dd'),
                amount: r.amount
            })).reverse();
    }, [rows]);

    const exportExcel = () => {
        const header = ['ردیف', 'کد پیگیری', 'شرح تراکنش', 'مبلغ (تومان)', 'نوع تراکنش', 'تاریخ'];
        const body = rows
            .map((r, i) =>
                `<tr>
                    <td>${i + 1}</td>
                    <td>${r.code}</td>
                    <td>${r.description}</td>
                    <td>${r.amount}</td>
                    <td>${r.type === 1 ? 'واریز' : 'برداشت'}</td>
                    <td>${r.date}</td>
                </tr>`
            ).join('');

        const html = `<html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></body></html>`;
        const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-${role}-${period}.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="گزارش مالی تراکنش‌ها"
                description={isLab ? 'مدیریت کیف پول و درآمدهای آزمایشگاه' : 'درآمد، کارمزد و تراکنش‌ها'}
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
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            خروجی Excel
                        </button>
                    </>
                }
            />

            <div className={`grid gap-4 ${isLab ? 'sm:grid-cols-1' : 'sm:grid-cols-3'}`}>
                <KpiCard
                    label="موجودی کیف پول (درآمد)"
                    value={isLoading ? '...' : `${formatPrice(totalIncome)} ت`}
                    icon={Wallet}
                    tone="indigo"
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-4 text-sm font-semibold text-slate-700">نمودار درآمد (واریزی‌ها)</p>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <BarChart data={chartData} barSize={36}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatPrice(v)} fontSize={12} width={80} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="amount" fill="var(--color-amount)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 text-right font-semibold">کد پیگیری</th>
                        <th className="px-4 py-3 text-right font-semibold">شرح تراکنش</th>
                        <th className="px-4 py-3 text-right font-semibold">مبلغ</th>
                        <th className="px-4 py-3 text-right font-semibold">نوع تراکنش</th>
                        <th className="px-4 py-3 text-right font-semibold">تاریخ</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan={5} className="p-4 text-center text-slate-500">در حال دریافت اطلاعات...</td></tr>
                    ) : rows.length === 0 ? (
                        <tr><td colSpan={5} className="p-4 text-center text-slate-500">تراکنشی در این بازه زمانی یافت نشد.</td></tr>
                    ) : (
                        rows.map((r) => (
                            <tr key={r.id} onClick={() => {
                                if ( r.reason_ref) {
                                    if (role === 'nurse')
                                    {
                                        navigate(`/provider/nurse/requests/${r.reason_ref}`);
                                    }
                                    if (role === 'doctor')
                                    {
                                        navigate(`/provider/doctor/appointments/${r.reason_ref}`);
                                    }

                                }
                            }} className={`border-t border-slate-100 hover:bg-slate-50 ${
                                (role === 'nurse' || role === 'doctor') && r.reason_ref ? 'cursor-pointer' : ''
                            }`}>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.code}</td>
                                <td className="px-4 py-3 font-medium text-slate-700">{r.description}</td>
                                <td className="px-4 py-3 font-mono">
                                    {formatPrice(r.amount)} <span className="text-xs text-slate-400">تومان</span>
                                </td>
                                <td className="px-4 py-3">
                                    {r.type === 1 ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-1 text-xs font-medium">
                            <ArrowDownRight className="h-3 w-3" /> واریز
                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-600 px-2.5 py-1 text-xs font-medium">
                            <ArrowUpRight className="h-3 w-3" /> برداشت
                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs dir-ltr text-right">
                                    {format(new Date(r.date), 'yyyy/MM/dd HH:mm')}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>

                </table>
            </div>
        </div>
    );
}
