import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Crown, Check, Sparkles, Clock, History, CreditCard, X } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { PageLoader } from '../components/PageLoader';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { pricingPlans, type PricingPlan } from '../data/pricingPlans';

const pageClass =
    'h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum] relative';

// نوع داده‌های سابقه خرید (به عنوان نمونه)
interface PlanHistoryItem {
    id: string;
    planName: string;
    date: string;
    price: string;
    status: 'موفق' | 'ناموفق';
}

export function PricingPlans() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();
    const [loading, setLoading] = useState(true);

    // State های جدید برای مدیریت اطلاعات پلن و پرداخت
    const [currentPlan, setCurrentPlan] = useState('basic');
    const [remainingDays, setRemainingDays] = useState(0);
    const [purchaseHistory, setPurchaseHistory] = useState<PlanHistoryItem[]>([]);

    // State های مربوط به مدال پرداخت
    const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<PricingPlan | null>(null);
    const [selectedGateway, setSelectedGateway] = useState('zarinpal');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                if (!accessToken) {
                    navigate('/');
                    return;
                }

                const response = await fetch('https://api.mediraai.com/api/user/profile', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // در سناریوی واقعی، remainingDays و history را هم از API دریافت می‌کنید
                        setCurrentPlan(data.data.plan?.type || 'basic');
                        setRemainingDays(data.data.plan?.remainingDays || 0);

                        // دیتای تستی برای سابقه خرید
                        setPurchaseHistory([
                            { id: '1', planName: 'پلن حرفه‌ای', date: '۱۴۰۲/۰۸/۱۵', price: '۱۹۹,۰۰۰ تومان', status: 'موفق' },
                            { id: '2', planName: 'پلن پایه', date: '۱۴۰۲/۰۷/۱۵', price: 'رایگان', status: 'موفق' }
                        ]);
                    }
                }
            } catch (error) {
                console.error('خطا در دریافت اطلاعات پلن:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlanData();
    }, [accessToken, navigate]);

    const handleOpenPaymentModal = (plan: PricingPlan) => {
        setSelectedPlanToBuy(plan);
        setIsPaymentModalOpen(true);
    };

    const handlePayment = () => {
        // منطق اتصال به درگاه پرداخت در اینجا قرار می‌گیرد
        console.log(`هدایت به درگاه ${selectedGateway} برای پلن ${selectedPlanToBuy?.name}`);
        setIsPaymentModalOpen(false);
    };

    if (loading) {
        return (
            <div className={pageClass}>
                <PageLoader />
            </div>
        );
    }

    return (
        <div className={pageClass}>
            <AppBar backTo="/home" />

            <div className="mx-auto max-w-md px-6 pb-8 pt-24">
                <PlansHero />

                {/* بخش وضعیت پلن فعلی */}
                <CurrentPlanStatus currentPlan={currentPlan} remainingDays={remainingDays} />

                {/* لیست پلن‌ها - به صورت افقی و اسکرول‌پذیر */}
                <div className="mt-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4" dir="rtl">ارتقاء پلن</h2>
                    {/* کانتینر اسکرول افقی */}
                    <div
                        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // برای مخفی کردن اسکرول‌بار در برخی مرورگرها
                    >
                        {pricingPlans.map((plan) => (
                            <div key={plan.id} className="min-w-[280px] sm:min-w-[300px] shrink-0 snap-center">
                                <PlanCard
                                    plan={plan}
                                    currentPlan={currentPlan}
                                    onSelect={() => handleOpenPaymentModal(plan)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* بخش تاریخچه خرید - به صورت جدول */}
                <PurchaseHistory history={purchaseHistory} />

                <p className="flex items-center justify-center gap-2 pt-8 text-xs text-gray-500">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    پرداخت امن و رمزنگاری شده
                </p>
            </div>

            {/* مدال انتخاب درگاه پرداخت */}
            {isPaymentModalOpen && selectedPlanToBuy && (
                <PaymentModal
                    plan={selectedPlanToBuy}
                    selectedGateway={selectedGateway}
                    setSelectedGateway={setSelectedGateway}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handlePayment}
                />
            )}
        </div>
    );
}

function PlansHero() {
    return (
        <div className="relative mb-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 px-5 py-5 shadow-[0_8px_32px_rgba(245,158,11,0.28)]">
                <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                    }}
                />
                <div className="relative z-10 flex items-center gap-4" dir="rtl">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                        <Crown className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                        <h1 className="text-xl font-bold leading-tight text-white">مدیریت اشتراک</h1>
                        <p className="mt-0.5 text-sm leading-snug text-amber-100">
                            ارتقاء امکانات و مشاهده وضعیت پلن
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CurrentPlanStatus({ currentPlan, remainingDays }: { currentPlan: string, remainingDays: number }) {
    const planName = pricingPlans.find(p => p.id === currentPlan)?.name || 'پایه';

    return (
        <Card className="p-4 border-blue-100 bg-blue-50/50 shadow-sm" dir="rtl">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">پلن فعال شما</span>
                <span className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">
          {planName}
        </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">
          {remainingDays > 0 ? `${remainingDays} روز از اعتبار شما باقیمانده است` : 'اعتبار شما به پایان رسیده است'}
        </span>
            </div>
        </Card>
    );
}

function PlanCard({ plan, currentPlan, onSelect }: { plan: PricingPlan; currentPlan: string, onSelect: () => void }) {
    const isCurrent = currentPlan === plan.id;

    return (
        <Card
            dir="rtl"
            className={`relative h-full flex flex-col overflow-hidden rounded-2xl border p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] text-right ${
                plan.popular
                    ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'
                    : plan.id === 'premium'
                        ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white'
                        : 'border-gray-100 bg-white'
            }`}
        >
            {plan.popular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-md">
                    محبوب‌ترین
                </div>
            )}

            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
          <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  plan.id === 'basic'
                      ? 'bg-gray-100 text-gray-500'
                      : plan.id === 'pro'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-amber-100 text-amber-600'
              }`}
          >
            <Crown className="h-5 w-5" />
          </span>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                </div>
                <p
                    className={`text-sm font-bold ${
                        plan.id === 'basic'
                            ? 'text-gray-700'
                            : plan.id === 'pro'
                                ? 'text-blue-600'
                                : 'text-amber-600'
                    }`}
                >
                    {plan.price}
                </p>
            </div>

            <ul className="mb-6 space-y-2 flex-1">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                                plan.id === 'basic'
                                    ? 'text-gray-400'
                                    : plan.id === 'pro'
                                        ? 'text-blue-500'
                                        : 'text-amber-500'
                            }`}
                        />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                disabled={isCurrent}
                onClick={onSelect}
                className={`h-10 w-full mt-auto rounded-full text-sm font-semibold transition-all active:scale-[0.98] ${
                    isCurrent
                        ? 'cursor-default bg-gray-100 text-gray-500'
                        : plan.id === 'basic'
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : plan.id === 'pro'
                                ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600'
                                : 'bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700'
                }`}
            >
                {isCurrent ? 'پلن فعلی شما' : `خرید ${plan.name}`}
            </button>
        </Card>
    );
}

function PurchaseHistory({ history }: { history: PlanHistoryItem[] }) {
    if (!history || history.length === 0) return null;

    return (
        <div className="mt-10" dir="rtl">
            <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-800">سابقه خریدها</h2>
            </div>

            <Card className="overflow-hidden shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-sm">پلن</th>
                            <th className="px-4 py-3 font-semibold text-sm">تاریخ</th>
                            <th className="px-4 py-3 font-semibold text-sm">مبلغ</th>
                            <th className="px-4 py-3 font-semibold text-sm text-center">وضعیت</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3.5 font-bold text-gray-800">{item.planName}</td>
                                <td className="px-4 py-3.5 text-gray-600">{item.date}</td>
                                <td className="px-4 py-3.5 font-medium text-gray-800">{item.price}</td>
                                <td className="px-4 py-3.5 text-center">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full inline-block ${
                        item.status === 'موفق' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function PaymentModal({
                          plan,
                          selectedGateway,
                          setSelectedGateway,
                          onClose,
                          onConfirm
                      }: {
    plan: PricingPlan;
    selectedGateway: string;
    setSelectedGateway: (gateway: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div
                className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                dir="rtl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">تأیید و پرداخت</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">پلن انتخابی:</span>
                        <span className="font-bold text-gray-900">{plan.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">مبلغ قابل پرداخت:</span>
                        <span className="font-bold text-blue-600 text-lg">{plan.price}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">انتخاب درگاه پرداخت</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setSelectedGateway('zarinpal')}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                selectedGateway === 'zarinpal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            <CreditCard className="h-6 w-6" />
                            <span className="text-sm font-medium">زرین‌پال</span>
                        </button>
                        <button
                            onClick={() => setSelectedGateway('saman')}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                selectedGateway === 'saman' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            <CreditCard className="h-6 w-6" />
                            <span className="text-sm font-medium">بانک سامان</span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={onConfirm}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-colors"
                >
                    انتقال به درگاه پرداخت
                </button>
            </div>
        </div>
    );
}