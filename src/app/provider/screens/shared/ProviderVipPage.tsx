import {
    CartesianGrid, Line, LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { Sparkles, Power, Wallet, Search, Trash2, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';
import { PageHeader, formatPrice } from '../../components';
import { ProviderModal } from '../../components/ProviderModal';
import type { ProviderRole } from '../../config/providerNav';
import { providerPath } from '../../config/providerNav';
import { providerRoleLabels } from '../../config/providerTheme';
import { showProviderError, showProviderSuccess } from '../../utils/toast';
import { formatJalali, toFaDigits } from '../../utils/jalali';
import { toJalaali } from 'jalaali-js';
import { useDoctorAuthStore } from "../../doctor/store/doctorAuthStore";
import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router";

const API_BASE_URL = 'http://185.222.163.113:7000/api';

interface ProviderVipPageProps {
    role: ProviderRole;
}

const chartConfig = {
    amount: { label: 'هزینه مصرفی (تومان)', color: '#f59e0b' },
} satisfies ChartConfig;

function formatIsoJalali(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return toFaDigits(formatJalali(j));
}

interface Keyword {
    id: number;
    word: string;
    base_click_tariff: string | number;
    base_impression_tariff: string | number;
    base_price: string | number;
}

interface MyKeyword {
    id: number;
    keyword_id: number;
    keyword_name: string;
    status: 'active' | 'paused';
    tier_level: number;
    final_click_tariff: number;
    final_impression_tariff: number;
}

interface Plan {
    id: number;
    name: string;
    tier_level: number;
    price: number;
    multiplier: number;
    duration_days: number;
    description?: string;
}

interface ActivePlan {
    id: number;
    plan_id: number;
    plan_name: string;
    tier_level: number;
    multiplier: number;
}

export function ProviderVipPage({ role }: ProviderVipPageProps) {
    const navigate = useNavigate();
    const { token } = useDoctorAuthStore();

    const [myKeywords, setMyKeywords] = useState<MyKeyword[]>([]);
    const [availableKeywords, setAvailableKeywords] = useState<Keyword[]>([]);
    const [chartData, setChartData] = useState<{ name: string; amount: number }[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);

    const [searchInput, setSearchInput] = useState('');
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // State for plan selection (preview)
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [paymentVisible, setPaymentVisible] = useState(false);

    const sampleKeyword = {
        word: 'دکتر قلب',
        base_click_tariff: 1200,
        base_impression_tariff: 300,
        base_price: 150000,
    };

    const apiHeaders = useMemo(() => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }), [token]);

    const fetchDashboardData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const activePlanRes = await fetch(`${API_BASE_URL}/doctor/my-plan`, { headers: apiHeaders });
            if (activePlanRes.ok) {
                const planData = await activePlanRes.json();
                setActivePlan(planData?.data || null);
            }

            const plansRes = await fetch(`${API_BASE_URL}/doctor/plans`, { headers: apiHeaders });
            if (plansRes.ok) {
                const plansData = await plansRes.json();
                setPlans(Array.isArray(plansData?.data) ? plansData.data : []);
            }

            const mineRes = await fetch(`${API_BASE_URL}/doctor/keywords/mine`, { headers: apiHeaders });
            if (mineRes.ok) {
                const mineData = await mineRes.json();
                setMyKeywords(Array.isArray(mineData?.data) ? mineData.data : []);
            }

            const availableRes = await fetch(`${API_BASE_URL}/doctor/keywords/available`, { headers: apiHeaders });
            if (availableRes.ok) {
                const availableData = await availableRes.json();
                const validArray = Array.isArray(availableData?.data?.data)
                    ? availableData.data.data
                    : (Array.isArray(availableData?.data) ? availableData.data : []);
                setAvailableKeywords(validArray);
            }

            fetchFinanceAndChart();
        } catch (error) {
            console.error('Error fetching data:', error);
            showProviderError('خطا در ارتباط با سرور');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFinanceAndChart = async () => {
        try {
            const chartRes = await fetch(`${API_BASE_URL}/doctor/keywords/chart`, { headers: apiHeaders });
            if (chartRes.ok) {
                const chartRaw = await chartRes.json();
                const validArray = Array.isArray(chartRaw?.data) ? chartRaw.data : [];
                setChartData(validArray.map((item: any) => ({
                    name: item?.date ? formatIsoJalali(item.date) : '—',
                    amount: Number(item?.total_cost || 0),
                })));
            }

            const financeRes = await fetch(`${API_BASE_URL}/doctor/finance`, { headers: apiHeaders });
            if (financeRes.ok) {
                const financeData = await financeRes.json();
                setWalletBalance(Number(financeData?.wallet_balance || 0));
            }
        } catch (e) {
            console.warn('Silent Fetch Error', e);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [token]);

    const filteredAvailable = useMemo(() => {
        if (!searchInput) return availableKeywords;
        return availableKeywords.filter(k => k.word.includes(searchInput));
    }, [availableKeywords, searchInput]);

    // Derived: selected plan object
    const selectedPlan = plans.find(p => p.id === selectedPlanId) || null;

    // Multiplier for sample keyword preview
    const previewMultiplier = selectedPlan ? selectedPlan.multiplier : (activePlan?.multiplier || 1);

    const sampleClickTariff = sampleKeyword.base_click_tariff * previewMultiplier;
    const sampleImpressionTariff = sampleKeyword.base_impression_tariff * previewMultiplier;
    const sampleTotalPrice = sampleKeyword.base_price * previewMultiplier;

    const handleSubscribePlan = async (planId: number, planName: string) => {
        if (!window.confirm(`آیا از ارتقا / تغییر پلن خود به "${planName}" اطمینان دارید؟`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/doctor/plans/subscribe`, {
                method: 'POST',
                headers: apiHeaders,
                body: JSON.stringify({ plan_id: planId })
            });
            const data = await res.json();
            if (res.ok) {
                showProviderSuccess(data.message || 'پلن شما با موفقیت تغییر کرد');
                setSelectedPlanId(null);
                setPaymentVisible(false);
                fetchDashboardData();
            } else {
                showProviderError(data.message || 'خطا در تغییر پلن');
            }
        } catch (error) {
            showProviderError('ارتباط با سرور برقرار نشد.');
        }
    };

    const handleSubscribeKeyword = async (keywordId: number, keywordText: string) => {
        if (!activePlan) {
            showProviderError('ابتدا یک پلن VIP فعال انتخاب کنید.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/doctor/keywords/subscribe`, {
                method: 'POST',
                headers: apiHeaders,
                body: JSON.stringify({
                    keyword_id: keywordId,
                    duration_days: 30
                })
            });

            const data = await res.json();

            if (res.ok) {
                showProviderSuccess(`«${keywordText}» با موفقیت فعال شد`);
                setSearchInput('');
                setSuggestOpen(false);
                fetchDashboardData();
            } else {
                showProviderError(data.message || 'موجودی کافی نیست یا خطایی رخ داد.');
            }
        } catch (error) {
            showProviderError('ارتباط با سرور برقرار نشد.');
        }
    };

    const handleToggleStatus = async (subscriptionId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/keywords/${subscriptionId}/toggle-status`, {
                method: 'PATCH',
                headers: apiHeaders,
            });
            if (res.ok) {
                showProviderSuccess('وضعیت با موفقیت تغییر کرد');
                fetchDashboardData();
            }
        } catch (error) {
            showProviderError('ارتباط با سرور برقرار نشد.');
        }
    };

    const handleDeleteKeyword = async (subscriptionId: number) => {
        if (!window.confirm('آیا از حذف این کلمه کلیدی اطمینان دارید؟')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/doctor/keywords/${subscriptionId}`, {
                method: 'DELETE',
                headers: apiHeaders,
            });
            const data = await res.json();
            if (res.ok) {
                showProviderSuccess(data.message || 'کلمه با موفقیت حذف شد');
                setMyKeywords(prev => prev.filter(k => k.id !== subscriptionId));
            } else {
                showProviderError(data.message || 'خطا در حذف کلمه');
            }
        } catch (error) {
            showProviderError('ارتباط با سرور برقرار نشد.');
        }
    };

    const handleSearchEnter = () => {
        if (searchInput.length > 1) {
            setSuggestOpen(true);
        } else {
            showProviderError('لطفا حداقل ۲ حرف وارد کنید');
        }
    };

    const handlePlanSelect = (planId: number) => {
        setSelectedPlanId(planId);
        setPaymentVisible(false); // reset payment when selecting a new plan
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="معرفی ویژه VIP"
                description="با شارژ کیف‌پول و انتخاب کلمات کلیدی، در جستجوی بیماران بالاتر دیده می‌شوید."
                actions={
                    <button
                        type="button"
                        onClick={() => navigate(providerPath(role, 'vip/charge'))}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-amber-600"
                    >
                        <Wallet className="h-4 w-4" />
                        شارژ سرویس VIP
                    </button>
                }
            />

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">پلن فعال شما</p>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {activePlan ? `سطح ${toFaDigits(activePlan.tier_level)} (${activePlan.plan_name})` : 'بدون پلن فعال'}
                                </h2>
                            </div>
                        </div>
                        <div className="rounded-xl bg-amber-50 px-3 py-2 text-left ring-1 ring-amber-100">
                            <p className="text-[11px] text-amber-700">موجودی VIP</p>
                            <p className="text-sm font-bold text-amber-900">
                                {formatPrice(walletBalance)} تومان
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setSearchInput('');
                                setSuggestOpen(true);
                            }}
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600"
                        >
                            <Sparkles className="h-4 w-4" />
                            کلمات قابل خرید
                        </button>
                        <div className="flex min-w-[220px] flex-1 gap-2">
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearchEnter();
                                    }
                                }}
                                placeholder="جستجوی کلمات مرتبط..."
                                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-amber-400"
                            />
                            <button
                                type="button"
                                onClick={handleSearchEnter}
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Sample keyword preview - updates based on selected plan */}
                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-amber-800">نمونه کلمه (پیش‌نمایش هزینه‌ها)</h3>
                            <span className="text-xs text-amber-600">
                                {selectedPlan ? `با پلن انتخابی: ${selectedPlan.name}` : (activePlan ? `با پلن فعال: ${activePlan.plan_name}` : 'بدون پلن')}
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4">
                            <span className="text-sm font-medium text-slate-700">{sampleKeyword.word}</span>
                            <div className="flex gap-3 text-[11px] text-slate-500">
                                <span>هر کلیک: <b className="text-amber-700">{formatPrice(sampleClickTariff)} ت</b></span>
                                <span>هر نمایش: <b className="text-amber-700">{formatPrice(sampleImpressionTariff)} ت</b></span>
                                <span>هزینه کمپین: <b className="text-amber-700">{formatPrice(sampleTotalPrice)} ت</b></span>
                            </div>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">با انتخاب هر پلن، اعداد بالا تغییر می‌کنند.</p>
                    </div>

                    <div>
                        <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">کمپین‌های کلمات کلیدی من</h3>
                        {isLoading ? (
                            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                در حال دریافت اطلاعات...
                            </p>
                        ) : myKeywords.length === 0 ? (
                            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                هنوز کلمه‌ای انتخاب نکرده‌اید.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] text-right text-sm">
                                    <thead className="text-xs text-slate-500">
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-2 font-medium">کلمه کلیدی</th>
                                        <th className="pb-2 font-medium">نرخ کلیک</th>
                                        <th className="pb-2 font-medium">نرخ نمایش</th>
                                        <th className="pb-2 font-medium">وضعیت</th>
                                        <th className="pb-2 font-medium">عملیات</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {myKeywords.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50">
                                            <td className="py-2.5 font-bold text-slate-800">{item.keyword_name}</td>
                                            <td className="py-2.5 text-slate-700">{formatPrice(item.final_click_tariff)} ت</td>
                                            <td className="py-2.5 text-slate-700">{formatPrice(item.final_impression_tariff)} ت</td>
                                            <td className="py-2.5">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {item.status === 'active' ? 'فعال' : 'متوقف'}
                                                </span>
                                            </td>
                                            <td className="py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(item.id)}
                                                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                                            item.status === 'active'
                                                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteKeyword(item.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-bold text-slate-800">ارتقای سطح VIP</h3>
                        {plans.length === 0 ? (
                            <p className="text-xs text-slate-500">در حال دریافت سطوح...</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {plans.map((plan) => {
                                    const isActive = activePlan?.plan_id === plan.id;
                                    const isSelected = selectedPlanId === plan.id;
                                    return (
                                        <div
                                            key={plan.id}
                                            onClick={() => handlePlanSelect(plan.id)}
                                            className={`rounded-2xl border px-2 py-3 text-center transition cursor-pointer ${
                                                isActive
                                                    ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                                                    : isSelected
                                                        ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
                                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            <LevelGauge percent={plan.tier_level * 20} active={isActive || isSelected} />
                                            <p className="mt-1 text-[11px] font-bold text-slate-700">{plan.name}</p>
                                            <p className="mt-0.5 text-[10px] text-slate-500">سطح {toFaDigits(plan.tier_level)}</p>
                                            {isActive ? (
                                                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                    <CheckCircle2 className="inline h-3 w-3 ml-1" />
                                                    پلن فعال
                                                </span>
                                            ) : isSelected ? (
                                                <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                                    انتخاب شده
                                                </span>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Plan details panel */}
                        {selectedPlan && (
                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                                <h4 className="text-sm font-bold text-slate-800">
                                    {selectedPlan.name}
                                    {activePlan?.plan_id === selectedPlan.id && (
                                        <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                            پلن فعال
                                        </span>
                                    )}
                                </h4>
                                <p className="mt-1 text-xs text-slate-600">{selectedPlan.description}</p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                                    <div>
                                        <span className="text-slate-400">قیمت: </span>
                                        <b>{formatPrice(selectedPlan.price)} تومان</b>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">مدت: </span>
                                        <b>{toFaDigits(selectedPlan.duration_days)} روز</b>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">ضریب: </span>
                                        <b>{toFaDigits(selectedPlan.multiplier)}x</b>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">سطح: </span>
                                        <b>{toFaDigits(selectedPlan.tier_level)}</b>
                                    </div>
                                </div>

                                {/* Sample keyword preview for selected plan */}
                                <div className="mt-3 rounded-lg bg-white p-3 text-[11px] space-y-1">
                                    <p className="font-bold text-slate-700">پیش‌نمایش کلمه نمونه با این پلن:</p>
                                    <p>هر کلیک: {formatPrice(sampleKeyword.base_click_tariff * selectedPlan.multiplier)} ت</p>
                                    <p>هر نمایش: {formatPrice(sampleKeyword.base_impression_tariff * selectedPlan.multiplier)} ت</p>
                                    <p>هزینه کمپین: {formatPrice(sampleKeyword.base_price * selectedPlan.multiplier)} ت</p>
                                </div>

                                {activePlan?.plan_id === selectedPlan.id ? (
                                    <p className="mt-3 text-center text-xs font-bold text-green-600">
                                        این پلن در حال حاضر فعال است.
                                    </p>
                                ) : !paymentVisible ? (
                                    <button
                                        type="button"
                                        onClick={() => setPaymentVisible(true)}
                                        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        ادامه و پرداخت
                                    </button>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        <div className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-400">
                                            [درگاه پرداخت اینجا قرار می‌گیرد]
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentVisible(false)}
                                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                            >
                                                انصراف
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSubscribePlan(selectedPlan.id, selectedPlan.name)}
                                                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
                                            >
                                                تایید و پرداخت
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="mt-3 text-[11px] leading-6 text-slate-500">
                            ضریب پلن فعال شما مستقیماً روی نرخ کلیک و نمایش کلمات اعمال می‌شود. در صورت ارتقا، پلن قبلی باطل می‌شود.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-1 text-sm font-bold text-slate-800">گزارش مصرف (۳۰ روز اخیر)</h3>
                        <ChartContainer config={chartConfig} className="mt-4 h-[200px] w-full">
                            <LineChart data={chartData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                                <YAxis tickLine={false} axisLine={false} fontSize={10} width={45} tickFormatter={(val) => toFaDigits(val)} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </div>
                </aside>
            </div>

            <ProviderModal
                open={suggestOpen}
                onClose={() => setSuggestOpen(false)}
                title={searchInput ? `نتایج جستجو برای «${searchInput}»` : "کلمات کلیدی قابل خرید"}
                description="مبالغ زیر با احتساب ضریب پلن فعال شما محاسبه شده‌اند."
            >
                <ul className="space-y-2 max-h-[400px] overflow-y-auto pl-1">
                    {!activePlan ? (
                        <p className="text-center text-sm font-bold text-red-500 py-4">لطفا ابتدا از پنل سمت راست یک پلن VIP فعال کنید.</p>
                    ) : filteredAvailable.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 py-4">کلمه‌ای یافت نشد.</p>
                    ) : (
                        filteredAvailable.map((item) => {
                            const multiplier = activePlan.multiplier || 1;
                            const finalPrice = Number(item.base_price) * multiplier;
                            const displayClick = Number(item.base_click_tariff) * multiplier;
                            const displayImpression = Number(item.base_impression_tariff) * multiplier;

                            return (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-bold text-slate-800">{item.word}</p>

                                        <div className="flex gap-3 text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                            <span>هر کلیک: {formatPrice(displayClick)} ت</span>
                                            <span>هر نمایش: {formatPrice(displayImpression)} ت</span>
                                        </div>

                                        <p className="text-xs font-semibold text-amber-600">
                                            مبلغ شروع کمپین: {formatPrice(finalPrice)} تومان
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSubscribeKeyword(item.id, item.word)}
                                        className="h-10 shrink-0 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600 shadow-sm"
                                    >
                                        خرید در سطح {toFaDigits(activePlan.tier_level)}
                                    </button>
                                </li>
                            );
                        })
                    )}
                </ul>
            </ProviderModal>
        </div>
    );
}

function LevelGauge({ percent, active }: { percent: number; active: boolean }) {
    const r = 28;
    const c = Math.PI * r;
    const dash = Math.max(4, (percent / 100) * c);
    const color = active ? '#f59e0b' : '#94a3b8';
    return (
        <svg viewBox="0 0 80 48" className="mx-auto h-10 w-16">
            <path
                d="M 12 40 A 28 28 0 0 1 68 40"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="7"
                strokeLinecap="round"
            />
            <path
                d="M 12 40 A 28 28 0 0 1 68 40"
                fill="none"
                stroke={color}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c}`}
            />
        </svg>
    );
}