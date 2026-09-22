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
import { PanelPageSkeleton } from '../../../components/PageSkeleton';
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

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000];

export function DoctorFinancePage() {
    const { token } = useDoctorAuthStore();
    const navigate = useNavigate();

    const [financeData, setFinanceData] = useState<FinanceData>({
        balance: 0,
        totalIncome: 0,
        rows: [],
    });
    const [loading, setLoading] = useState(true);

    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
    const [chargeAmount, setChargeAmount] = useState<string>('');
    const [isCharging, setIsCharging] = useState(false);
    const [chargeError, setChargeError] = useState<string | null>(null);

    const fetchFinanceData = useCallback(async () => {
        try {
            if (!token) return;
            setLoading(true);
            const response = await fetch('https://api.mediraai.com/api/doctor/finance', {
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

    // ─── تابع ساخت دیتای ثابت 7 روزه برای نمودار ───
    const chartData = useMemo(() => {
        // ۱. ابتدا دیتای واقعیِ درآمدها را به شکل یک آبجکت بر اساس تاریخ گروه‌بندی می‌کنیم
        const incomeRows = financeData.rows.filter((t) => t.type === 1);
        const aggregatedIncome: Record<string, number> = {};

        incomeRows.forEach((row) => {
            const dateStr = new Date(row.date).toLocaleDateString('fa-IR');
            if (!aggregatedIncome[dateStr]) {
                aggregatedIncome[dateStr] = 0;
            }
            aggregatedIncome[dateStr] += row.amount;
        });

        // ۲. ساخت آرایه ۷ روز گذشته به صورت ثابت
        const last7DaysData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const faDateStr = d.toLocaleDateString('fa-IR');

            last7DaysData.push({
                name: faDateStr,
                // اگر در این روز درآمدی ثبت شده مقدار آن، وگرنه 0
                amount: aggregatedIncome[faDateStr] || 0,
            });
        }

        return last7DaysData;
    }, [financeData.rows]);

    const handleRowClick = (t: TransactionRow) => {
        if (t.reason_ref) {
            navigate(`/provider/doctor/appointments/${t.reason_ref}`);
        }
    };

    const handleChargeSubmit = async () => {
        const amountNum = Number(chargeAmount);

        if (!chargeAmount || isNaN(amountNum) || amountNum < 10000) {
            setChargeError('لطفاً مبلغی بزرگتر یا مساوی ۱۰,۰۰۰ تومان وارد کنید.');
            return;
        }

        setIsCharging(true);
        setChargeError(null);

        try {
            const response = await fetch('https://api.mediraai.com/api/user/wallet/charge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: amountNum, gateway: 'saman' }),
            });

            const result = await response.json();

            if (response.ok && result.success && result.data?.payment_url) {
                window.location.href = result.data.payment_url;
            } else {
                setChargeError(result.message || 'خطا در ایجاد لینک پرداخت.');
                setIsCharging(false);
            }
        } catch (error) {
            console.error('Error initiating wallet charge:', error);
            setChargeError('خطا در برقراری ارتباط با سرور.');
            setIsCharging(false);
        }
    };

    const closeModal = () => {
        if (isCharging) return;
        setIsChargeModalOpen(false);
        setChargeAmount('');
        setChargeError(null);
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <PageHeader title="گزارش مالی" description="درآمد، تراکنش‌ها و تسویه‌ها" />
                <button
                    onClick={() => setIsChargeModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
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
                <PanelPageSkeleton />
            ) : (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="mb-4 text-sm font-semibold text-slate-700">نمودار درآمد (۷ روز گذشته)</p>

                        {/* به جای ResponsiveContainer از ChartContainer استفاده می‌کنیم */}
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={11}
                                    tick={{ fill: '#64748b' }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => formatPrice(v)}
                                    fontSize={11}
                                    tick={{ fill: '#64748b' }}
                                    width={80}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} cursor={{fill: '#f1f5f9'}} />
                                {/* عرض ستون‌ها با maxBarSize و barSize کنترل می‌شود */}
                                <Bar
                                    dataKey="amount"
                                    fill="var(--color-amount)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                    barSize={35}
                                />
                            </BarChart>
                        </ChartContainer>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                                        <td className="px-4 py-3 font-medium">{formatPrice(t.amount)} ت</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                                    t.type === 1
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                }`}
                                            >
                                                {t.type === 1 ? 'درآمد/واریز' : 'سایر/برداشت'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px] text-center" dir="ltr">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative animate-in zoom-in-95">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">شارژ کیف پول</h3>
                            <button
                                onClick={closeModal}
                                disabled={isCharging}
                                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-500">
                                    مبالغ پیشنهادی:
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRESET_AMOUNTS.map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => {
                                                setChargeAmount(amount.toString());
                                                setChargeError(null);
                                            }}
                                            disabled={isCharging}
                                            className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                                                Number(chargeAmount) === amount
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            {amount.toLocaleString('fa-IR')} تومان
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    مبلغ دلخواه (تومان)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={chargeAmount}
                                        onChange={(e) => {
                                            setChargeAmount(e.target.value);
                                            setChargeError(null);
                                        }}
                                        disabled={isCharging}
                                        placeholder="مثلا 50000"
                                        className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-2.5 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        dir="ltr"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-sans">تومان</span>
                                </div>
                                {chargeAmount && Number(chargeAmount) > 0 && (
                                    <p className="mt-1.5 text-[11px] text-emerald-600 text-left" dir="ltr">
                                        {Number(chargeAmount).toLocaleString('fa-IR')} تومان
                                    </p>
                                )}
                            </div>

                            {chargeError && (
                                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 text-center border border-red-100">
                                    {chargeError}
                                </div>
                            )}

                            <button
                                onClick={handleChargeSubmit}
                                disabled={isCharging || !chargeAmount}
                                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isCharging ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        در حال انتقال به درگاه...
                                    </>
                                ) : (
                                    'پرداخت و افزایش موجودی'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}