import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, TrendingUp, Plus, X } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
    ChartTooltip,
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

    // --- State های مربوط به شارژ کیف پول ---
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [chargeAmount, setChargeAmount] = useState<string>('');
    const [isCharging, setIsCharging] = useState(false);

    // استخراج تابع دریافت اطلاعات برای استفاده مجدد بعد از شارژ
    const fetchFinanceData = useCallback(async () => {
        try {
            if (!token) return;
            setLoading(true);
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
    }, [token]);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData]);

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

    // --- تابع انجام فرآیند شارژ شبیه‌سازی شده ---
    const handleChargeSubmit = async () => {
        const amountNum = Number(chargeAmount);
        if (!chargeAmount || isNaN(amountNum) || amountNum < 10000) {
            alert('لطفا مبلغ معتبری وارد کنید (حداقل ۱۰,۰۰۰ تومان/ریال).');
            return;
        }

        setIsCharging(true);
        try {
            const response = await fetch('http://185.222.163.113:7000/api/doctor/wallet/charge-mock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: amountNum }),
            });

            const result = await response.json();

            if (result.status === 200) {
                // موفقیت: بستن مودال، پاک کردن اینپوت و دریافت مجدد اطلاعات جدول/نمودار
                setIsChargeModalOpen(false);
                setChargeAmount('');
                fetchFinanceData();
            } else {
                alert(result.message || 'خطا در انجام عملیات شارژ.');
            }
        } catch (error) {
            console.error('Error charging wallet:', error);
            alert('خطا در ارتباط با سرور.');
        } finally {
            setIsCharging(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <PageHeader title="گزارش مالی" description="درآمد، تراکنش‌ها و تسویه‌ها" />
                <button
                    onClick={() => setIsChargeModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    افزایش موجودی
                </button>
            </div>

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
                                    <Bar dataKey="amount" fill="var(--color-amount)" />
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
                                                    {t.type === 1 ? 'درآمد' : 'سایر / برداشت'}
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

            {/* مودال افزایش موجودی */}
            {isChargeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">افزایش موجودی کیف پول</h3>
                            <button
                                onClick={() => setIsChargeModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-600">
                                    مبلغ (تومان)
                                </label>
                                <input
                                    type="number"
                                    value={chargeAmount}
                                    onChange={(e) => setChargeAmount(e.target.value)}
                                    placeholder="مثلا 50000"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    dir="ltr"
                                />
                            </div>
                            <button
                                onClick={handleChargeSubmit}
                                disabled={isCharging}
                                className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
                            >
                                {isCharging ? 'در حال پرداخت...' : 'پرداخت (شبیه‌سازی)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
