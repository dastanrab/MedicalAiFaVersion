import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig, ChartTooltip,
} from '../../../components/ui/chart';
import { KpiCard, PageHeader, formatPrice } from '../../components';
import { useDoctorAuthStore } from "../store/doctorAuthStore";

interface TransactionRow {
    id: number;
    code: string;
    amount: number;
    type: 1 | 2;
    description: string;
    date: string;
    reason_ref?: string | null;
    patientName?: string | null;
    patientPhone?: string | null;
}

interface FinanceData {
    balance: number;
    totalIncome: number;
    rows: TransactionRow[];
}

const chartConfig = {
    amount: { label: 'مبلغ', color: '#2563eb' },
} satisfies ChartConfig;

export function DoctorFinancePage() {
    const { token } = useDoctorAuthStore();
    const navigate = useNavigate();

    const [financeData, setFinanceData] = useState<FinanceData>({
        balance: 0,
        totalIncome: 0,
        rows: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                if (!token) return;

                const response = await fetch('http://185.222.163.113:7000/api/doctor/finance', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (result.status === 200 && result.data) {
                    setFinanceData(result.data);
                }
            } catch (error) {
                console.error('Error fetching finance data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFinanceData();
    }, [token]);

    const chartData = useMemo(() => {
        return financeData.rows
            .filter((t) => t.type === 1)
            .map((t) => ({
                name: new Date(t.date).toLocaleDateString('fa-IR'),
                amount: t.amount,
            }))
            .reverse();
    }, [financeData.rows]);

    const handleRowClick = (t: TransactionRow) => {
        if (t.reason_ref) {
            navigate(`/provider/doctor/appointments/${t.reason_ref}`);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="گزارش مالی" description="درآمد، تراکنش‌ها و تسویه‌ها" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                <KpiCard
                    label="موجودی حساب"
                    value={`${formatPrice(financeData.balance)} ت`}
                    icon={Wallet}
                    tone="blue"
                />
                <KpiCard
                    label="کل درآمد"
                    value={`${formatPrice(financeData.totalIncome)} ت`}
                    icon={TrendingUp}
                    tone="emerald"
                />
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-10">در حال دریافت اطلاعات...</div>
            ) : (
                <>
                    {chartData.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="mb-4 text-sm font-semibold text-slate-700">نمودار درآمد</p>
                            <ChartContainer config={chartConfig} className="h-[220px] w-full">
                                <BarChart data={chartData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => formatPrice(v)}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="amount" fill="var(--color-amount)"  />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <p className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                            تراکنش‌ها
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار / شرح</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">مبلغ</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">نوع تراکنش</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">تاریخ</th>
                                </tr>
                                </thead>
                                <tbody>
                                {financeData.rows.map((t) => (
                                    <tr
                                        key={t.id}
                                        onClick={() => handleRowClick(t)}
                                        className={`border-t border-slate-100 transition-colors hover:bg-slate-50 ${
                                            t.reason_ref ? 'cursor-pointer' : 'cursor-default'
                                        }`}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs">{t.code}</td>
                                        <td className="px-4 py-3">
                                            <div>{t.patientName || '---'}</div>
                                            <div className="text-xs text-slate-500">
                                                {t.patientPhone || t.description}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{formatPrice(t.amount)}</td>
                                        <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                                        t.type === 1
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-indigo-50 text-indigo-700'
                                                    }`}
                                                >
                                {t.type === 1 ? 'درآمد' : 'سایر / تسویه'}
                                </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs text-center" dir="ltr">
                                            {t.date}
                                        </td>
                                    </tr>
                                ))}
                                {financeData.rows.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            تراکنشی یافت نشد.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
