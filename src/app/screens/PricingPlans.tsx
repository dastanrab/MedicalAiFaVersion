import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Crown, Check, Sparkles, Clock, History, CreditCard, X, Loader2, Info } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { PageLoader } from '../components/PageLoader';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { toJalaliDate } from "../components/orders/utils";

const API_BASE_URL = 'https://api.mediraai.com/api/user/plans';

// نوع داده‌های دریافتی از API
interface ApiPlan {
    id: number;
    name: string;
    slug: string;
    price: number;
    duration_days: number;
}

interface PlanHistoryItem {
    id: number;
    plan_name: string;
    created_at: string;
    paid_price: number;
    payment_status: number;
}

interface CurrentPlanData {
    id: number;
    plan_id: number;
    plan_name: string;
    slug: string;
    start_date: string;
    end_date: string;
    is_active: number;
}

export function PricingPlans() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // State ها
    const [plans, setPlans] = useState<ApiPlan[]>([]);
    const [currentPlan, setCurrentPlan] = useState<CurrentPlanData | null>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<PlanHistoryItem[]>([]);

    // State های مربوط به مدال پرداخت
    const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<ApiPlan | null>(null);
    const [selectedGateway, setSelectedGateway] = useState('saman');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        if (!accessToken) {
            navigate('/');
            return;
        }
        fetchAllData();
    }, [accessToken, navigate]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            };

            const [plansRes, currentRes, historyRes] = await Promise.all([
                fetch(API_BASE_URL, { headers }),
                fetch(`${API_BASE_URL}/current`, { headers }),
                fetch(`${API_BASE_URL}/history`, { headers })
            ]);

            if (plansRes.ok) {
                const plansData = await plansRes.json();
                if (plansData.success) setPlans(plansData.data);
            }

            if (currentRes.ok) {
                const currentData = await currentRes.json();
                if (currentData.success) setCurrentPlan(currentData.data);
            }

            if (historyRes.ok) {
                const historyData = await historyRes.json();
                if (historyData.success) setPurchaseHistory(historyData.data);
            }
        } catch (error) {
            console.error('خطا در دریافت اطلاعات:', error);
            alert('خطا در دریافت اطلاعات از سرور');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPaymentModal = (plan: ApiPlan) => {
        setSelectedPlanToBuy(plan);
        setIsPaymentModalOpen(true);
    };

    const handlePayment = async () => {
        if (!selectedPlanToBuy) return;
        setActionLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/purchase`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    plan_id: selectedPlanToBuy.id,
                    gateway: selectedGateway
                })
            });

            const data = await response.json();

            if (response.ok && data.success && data.data?.payment_url) {
                window.location.href = data.data.payment_url;
            } else {
                alert(data.message || 'خطا در اتصال به درگاه پرداخت');
                setActionLoading(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('خطا در برقراری ارتباط با سرور');
            setActionLoading(false);
        }
    };

    const calculateRemainingDays = (endDateStr: string) => {
        if (!endDateStr) return 0;
        const end = new Date(endDateStr).getTime();
        const now = new Date().getTime();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const remainingDays = currentPlan?.end_date ? calculateRemainingDays(currentPlan.end_date) : 0;

    if (loading) {
        return (
            <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50/50 to-white pb-24 text-right font-[YekanBakhFaNum] relative">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="min-h-full overflow-y-auto bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white pb-24 text-right font-[YekanBakhFaNum] relative">
            <AppBar backTo="/home" />

            <main className="mx-auto w-full max-w-xl px-3.5 sm:px-6 pt-20 sm:pt-24">
                <PlansHero />

                {/* بخش وضعیت پلن فعلی */}
                <CurrentPlanStatus currentPlan={currentPlan} remainingDays={remainingDays} />

                {/* لیست پلن‌ها: همیشه در یک ردیف و انعطاف‌پذیر بر اساس سایز صفحه */}
                <section className="mt-6 sm:mt-8">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-sm sm:text-base font-bold text-gray-800" dir="rtl">انتخاب یا ارتقاء پلن</h2>
                        <span className="text-[11px] text-gray-400 font-medium">قابلیت تمدید آنلاین</span>
                    </div>

                    <div className="flex w-full gap-2 sm:gap-3.5 items-stretch" dir="rtl">
                        {plans.map((plan) => (
                            <div key={plan.id} className="flex-1 min-w-0 flex">
                                <PlanCard
                                    plan={plan}
                                    isActive={currentPlan?.plan_id === plan.id}
                                    onSelect={() => handleOpenPaymentModal(plan)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* بخش تاریخچه خرید */}
                <PurchaseHistory history={purchaseHistory} />

                <div className="flex items-center justify-center gap-1.5 pt-8 pb-4 text-[11px] sm:text-xs text-gray-400">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    <span>پرداخت امن شتابی با پروتکل رمزنگاری شاپرک</span>
                </div>
            </main>

            {/* مدال انتخاب درگاه پرداخت */}
            {isPaymentModalOpen && selectedPlanToBuy && (
                <PaymentModal
                    plan={selectedPlanToBuy}
                    selectedGateway={selectedGateway}
                    setSelectedGateway={setSelectedGateway}
                    onClose={() => !actionLoading && setIsPaymentModalOpen(false)}
                    onConfirm={handlePayment}
                    loading={actionLoading}
                />
            )}
        </div>
    );
}

function PlansHero() {
    return (
        <div className="relative mb-4 sm:mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 shadow-lg shadow-orange-500/15">
            <div className="pointer-events-none absolute -top-8 -left-8 h-28 w-28 rounded-full bg-white/10 blur-sm" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-sm" />

            <div className="relative z-10 flex items-center gap-3 sm:gap-4" dir="rtl">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-md">
                    <Crown className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg font-black text-white">مدیریت اشتراک</h1>
                    <p className="text-xs sm:text-sm text-amber-100 line-clamp-1 mt-0.5">
                        ارتقاء امکانات تشخیصی و پرونده هوشمند
                    </p>
                </div>
            </div>
        </div>
    );
}

function CurrentPlanStatus({ currentPlan, remainingDays }: { currentPlan: CurrentPlanData | null, remainingDays: number }) {
    if (!currentPlan) {
        return (
            <Card className="p-3.5 sm:p-4 border-dashed border-gray-300 bg-white/80 rounded-2xl shadow-none" dir="rtl">
                <div className="flex items-center gap-2.5 text-gray-600">
                    <Info className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">در حال حاضر پلن فعالی ندارید.</span>
                </div>
            </Card>
        );
    }

    const isExpired = remainingDays <= 0;

    return (
        <Card className="p-3.5 sm:p-4 border border-blue-100/80 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 rounded-2xl shadow-sm" dir="rtl">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">پلن فعال شما</span>
                <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-100/90 rounded-full">
                    {currentPlan.plan_name}
                </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
                <Clock className={`h-4 w-4 shrink-0 ${isExpired ? 'text-red-500' : 'text-blue-500'}`} />
                <span className="text-xs sm:text-sm font-semibold">
                    {!isExpired ? `${remainingDays} روز از اعتبار حساب باقی مانده است` : 'اعتبار پلن شما منقضی شده است'}
                </span>
            </div>
        </Card>
    );
}

function PlanCard({ plan, isActive, onSelect }: { plan: ApiPlan; isActive: boolean; onSelect: () => void }) {
    const isPro = plan.slug === 'pro';
    const isPremium = plan.slug === 'premium';
    const isFree = plan.price === 0;

    return (
        <Card
            dir="rtl"
            className={`relative flex flex-col justify-between w-full rounded-2xl p-2.5 sm:p-4 transition-all duration-200 ${
                isActive
                    ? 'ring-2 ring-blue-500/70 bg-blue-50/30 border-blue-200'
                    : isPro
                        ? 'border-blue-300 bg-gradient-to-b from-blue-50/40 to-white shadow-md shadow-blue-500/5'
                        : isPremium
                            ? 'border-amber-200 bg-gradient-to-b from-amber-50/40 to-white'
                            : 'border-gray-200 bg-white shadow-xs'
            }`}
        >
            {/* نشان محبوب‌ترین در بالای کارت پرو */}
            {isPro && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    محبوب‌ترین
                </div>
            )}

            <div>
                {/* بخش بالایی کارت */}
                <div className="flex flex-col items-center text-center mt-1 mb-2.5">
                    <span
                        className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl mb-1.5 ${
                            isPro
                                ? 'bg-blue-100 text-blue-600'
                                : isPremium
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                        <Crown className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate w-full" title={plan.name}>
                        {plan.name}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                        {plan.duration_days} روزه
                    </span>
                </div>

                {/* قیمت با سایزبندی دقیق جهت شکست نخوردن متن */}
                <div className="my-2 text-center border-y border-gray-100/80 py-2">
                    {isFree ? (
                        <span className="text-xs sm:text-base font-black text-gray-800">رایگان</span>
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-xs sm:text-base font-black text-gray-900 tracking-tight">
                                {plan.price.toLocaleString('fa-IR')}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium -mt-0.5">تومان</span>
                        </div>
                    )}
                </div>

                {/* ویژگی‌های پلن */}
                <div className="space-y-1.5 my-2">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-600">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">دسترسی کامل</span>
                    </div>
                </div>
            </div>

            {/* دکمه عملیات */}
            <button
                type="button"
                disabled={isActive}
                onClick={onSelect}
                className={`mt-2 h-8 sm:h-9 w-full rounded-xl text-[11px] sm:text-xs font-bold transition-all active:scale-95 ${
                    isActive
                        ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-200'
                        : isPro
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25'
                            : isPremium
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/25'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
                {isActive ? 'فعال' : 'انتخاب'}
            </button>
        </Card>
    );
}

function PurchaseHistory({ history }: { history: PlanHistoryItem[] }) {
    if (!history || history.length === 0) return null;

    return (
        <section className="mt-8" dir="rtl">
            <div className="flex items-center gap-2 mb-3 px-1">
                <History className="h-4 w-4 text-gray-700" />
                <h2 className="text-sm sm:text-base font-bold text-gray-800">سوابق تراکنش‌ها</h2>
            </div>

            {/* نسخه بهینه موبایل (کارت‌های سبک) */}
            <div className="space-y-2 sm:hidden">
                {history.map((item) => (
                    <Card key={item.id} className="p-3 border-gray-100 bg-white flex items-center justify-between text-xs">
                        <div>
                            <p className="font-bold text-gray-800">{item.plan_name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{toJalaliDate(item.created_at)}</p>
                        </div>
                        <div className="text-left flex flex-col items-end gap-1">
                            <span className="font-bold text-gray-900">
                                {item.paid_price === 0 ? 'رایگان' : `${item.paid_price.toLocaleString('fa-IR')} ت`}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                item.payment_status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                                {item.payment_status === 1 ? 'موفق' : 'ناموفق'}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* نسخه دسکتاپ و تبلت (جدول کامل) */}
            <Card className="hidden sm:block overflow-hidden shadow-none border border-gray-200/70 rounded-2xl bg-white">
                <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50/70 text-gray-500 border-b border-gray-100">
                    <tr>
                        <th className="px-4 py-3 font-semibold">پلن</th>
                        <th className="px-4 py-3 font-semibold">تاریخ</th>
                        <th className="px-4 py-3 font-semibold">مبلغ</th>
                        <th className="px-4 py-3 font-semibold text-center">وضعیت</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {history.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/40">
                            <td className="px-4 py-3 font-bold text-gray-800">{item.plan_name}</td>
                            <td className="px-4 py-3 text-gray-500">{toJalaliDate(item.created_at)}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                                {item.paid_price === 0 ? 'رایگان' : `${item.paid_price.toLocaleString('fa-IR')} تومان`}
                            </td>
                            <td className="px-4 py-3 text-center">
                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full inline-block ${
                                        item.payment_status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                    }`}>
                                        {item.payment_status === 1 ? 'موفق' : 'ناموفق'}
                                    </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Card>
        </section>
    );
}

function PaymentModal({
                          plan,
                          selectedGateway,
                          setSelectedGateway,
                          onClose,
                          onConfirm,
                          loading
                      }: {
    plan: ApiPlan;
    selectedGateway: string;
    setSelectedGateway: (gateway: string) => void;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                dir="rtl"
            >
                {/* دستگیره مودال موبایل */}
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">تأیید و پرداخت اشتراک</h3>
                    <button onClick={onClose} disabled={loading} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 mb-5 space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">پلن انتخابی:</span>
                        <span className="font-bold text-gray-900">{plan.name} ({plan.duration_days} روز)</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                        <span className="text-gray-500">مبلغ نهایی:</span>
                        <span className="font-black text-blue-600 text-sm sm:text-base">
                            {plan.price === 0 ? 'رایگان' : `${plan.price.toLocaleString('fa-IR')} تومان`}
                        </span>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-600 mb-2.5">درگاه پرداخت را انتخاب کنید:</p>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={() => setSelectedGateway('saman')}
                            disabled={loading}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                                selectedGateway === 'saman'
                                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            <CreditCard className="h-5 w-5" />
                            <span className="text-xs">بانک سامان</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedGateway('zarinpal')}
                            disabled={loading}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                                selectedGateway === 'zarinpal'
                                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            <CreditCard className="h-5 w-5" />
                            <span className="text-xs">زرین‌پال</span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            در حال انتقال به درگاه...
                        </>
                    ) : (
                        'پرداخت آنلاین'
                    )}
                </button>
            </div>
        </div>
    );
}
