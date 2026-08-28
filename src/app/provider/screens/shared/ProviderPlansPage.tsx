import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
    Check,
    Crown,
    CreditCard,
    HelpCircle,
    Sparkles,
    Wallet,
} from 'lucide-react';
import { PageHeader, StatusBadge, formatPrice } from '../../components';
import type { ProviderRole } from '../../config/providerNav';
import { providerPath } from '../../config/providerNav';
import { providerRoleLabels } from '../../config/providerTheme';
import {
    cycleLabel,
    getPlanPrice,
    getProviderPlans,
    getYearlySavingsPercent,
    providerPayButtonClass,
    providerPlanAccent,
    type BillingCycle,
    type ProviderPlan,
} from '../../data/providerPlans';
import {
    createProviderAuthority,
    saveProviderPlanCheckout,
} from '../../lib/providerPlanCheckout';
import {
    DEFAULT_PROVIDER_SUBSCRIPTION,
    EMPTY_PROVIDER_PAYMENTS,
    useProviderPlanStore,
} from '../../store/providerPlanStore';
import { showProviderSuccess } from '../../utils/toast';
import { formatJalali, toFaDigits, todayJalali } from '../../utils/jalali';
import { toJalaali } from 'jalaali-js';

interface ProviderPlansPageProps {
    role: ProviderRole;
}

function formatIsoJalali(iso: string | null): string {
    if (!iso) return 'بدون محدودیت';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return toFaDigits(formatJalali(j));
}

export function ProviderPlansPage({ role }: ProviderPlansPageProps) {
    const navigate = useNavigate();
    const plans = useMemo(() => getProviderPlans(role), [role]);
    const accent = providerPlanAccent[role];
    const subscription =
        useProviderPlanStore((s) => s.subscriptions[role]) ?? DEFAULT_PROVIDER_SUBSCRIPTION;
    const payments = useProviderPlanStore((s) => s.payments[role]) ?? EMPTY_PROVIDER_PAYMENTS;
    const activatePlan = useProviderPlanStore((s) => s.activatePlan);
    const [cycle, setCycle] = useState<BillingCycle>(subscription.cycle || 'monthly');

    const currentPlan = plans.find((plan) => plan.id === subscription.planId) ?? plans[0];
    const maxSaving = Math.max(...plans.map(getYearlySavingsPercent));

    const startCheckout = (plan: ProviderPlan) => {
        if (plan.id === subscription.planId && (plan.id === 'starter' || cycle === subscription.cycle)) {
            return;
        }

        if (plan.monthlyPrice === 0) {
            activatePlan(role, 'starter', 'monthly');
            showProviderSuccess('پلن پایه با موفقیت فعال شد');
            return;
        }

        const amount = getPlanPrice(plan, cycle);
        saveProviderPlanCheckout({
            kind: 'subscription',
            role,
            planId: plan.id,
            planName: plan.name,
            cycle,
            amount,
            payable: amount,
            discount: 0,
            coupon: '',
            gatewayId: 'mellat',
            authority: createProviderAuthority('mellat'),
            returnPath: providerPath(role, 'plans'),
            createdAt: new Date().toISOString(),
        });

        navigate(
            `${providerPath(role, 'plans/checkout')}?plan=${plan.id}&cycle=${cycle}`
        );
    };

    const buttonLabel = (plan: ProviderPlan) => {
        if (plan.id === subscription.planId) {
            if (plan.id === 'starter' || cycle === subscription.cycle) return 'پلن فعلی';
            return `تغییر دوره به ${cycleLabel(cycle)}`;
        }
        const currentPrice = getPlanPrice(currentPlan, cycle);
        const nextPrice = getPlanPrice(plan, cycle);
        if (plan.monthlyPrice === 0) return 'بازگشت به پلن رایگان';
        if (nextPrice > currentPrice) return `ارتقا به ${plan.name}`;
        return `انتخاب ${plan.name}`;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="پلن‌ها و اشتراک"
                description={`پلن مناسب پنل ${providerRoleLabels[role]} را انتخاب کنید و اشتراک را تمدید یا ارتقا دهید.`}
                actions={
                    <button
                        type="button"
                        onClick={() => navigate(providerPath(role, 'vip'))}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                    >
                        معرفی ویژه VIP
                    </button>
                }
            />

            <div className={`rounded-2xl border border-slate-200 bg-white p-5 ring-1 ${accent.ring}/10`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.soft} ring-1`}>
                            <Crown className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">اشتراک فعلی</p>
                            <h3 className="mt-0.5 text-lg font-bold text-slate-800">
                                پلن {currentPlan.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                دوره {cycleLabel(subscription.cycle)}
                                {' · '}
                                اعتبار تا {formatIsoJalali(subscription.expiresAt)}
                            </p>
                        </div>
                    </div>
                    <StatusBadge
                        label={subscription.planId === 'starter' ? 'رایگان' : 'فعال'}
                        className={
                            subscription.planId === 'starter'
                                ? 'bg-slate-50 text-slate-600 ring-slate-200'
                                : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        }
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">دوره پرداخت را انتخاب کنید</p>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1">
                    <CycleButton active={cycle === 'monthly'} onClick={() => setCycle('monthly')}>
                        ماهانه
                    </CycleButton>
                    <CycleButton active={cycle === 'yearly'} onClick={() => setCycle('yearly')}>
                        سالانه
                        {maxSaving > 0 && (
                            <span className="mr-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                تا {toFaDigits(maxSaving)}٪ تخفیف
                            </span>
                        )}
                    </CycleButton>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {plans.map((plan) => {
                    const price = getPlanPrice(plan, cycle);
                    const isCurrent =
                        plan.id === subscription.planId &&
                        (plan.id === 'starter' || cycle === subscription.cycle);
                    const saving = cycle === 'yearly' ? getYearlySavingsPercent(plan) : 0;

                    return (
                        <article
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border p-5 shadow-sm ${
                                plan.popular
                                    ? accent.popular
                                    : 'border-slate-200 bg-white'
                            } ${isCurrent ? `ring-2 ${accent.ring}` : ''}`}
                        >
                            {plan.popular && (
                                <span
                                    className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${accent.badge} px-3 py-0.5 text-[11px] font-bold text-white shadow-sm`}
                                >
                                    محبوب‌ترین
                                </span>
                            )}

                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                                    <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                                </div>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.soft} ring-1`}>
                                    {plan.id === 'enterprise' ? (
                                        <Sparkles className="h-5 w-5" />
                                    ) : (
                                        <Crown className="h-5 w-5" />
                                    )}
                                </span>
                            </div>

                            <div className="mb-4">
                                {price === 0 ? (
                                    <p className="text-2xl font-bold text-slate-800">رایگان</p>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-slate-800">
                                            {formatPrice(price)}
                                            <span className="mr-1 text-sm font-normal text-slate-500">تومان</span>
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {cycle === 'yearly' ? 'برای یک سال' : 'برای هر ماه'}
                                            {saving > 0 ? ` · ${toFaDigits(saving)}٪ صرفه‌جویی` : ''}
                                        </p>
                                    </>
                                )}
                            </div>

                            <ul className="mb-5 flex-1 space-y-2">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accent.text}`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                disabled={isCurrent}
                                onClick={() => startCheckout(plan)}
                                className={`h-11 w-full rounded-xl text-sm font-semibold shadow-sm transition ${
                                    isCurrent
                                        ? 'cursor-default bg-slate-100 text-slate-500'
                                        : `text-white ${providerPayButtonClass[role]}`
                                }`}
                            >
                                {buttonLabel(plan)}
                            </button>
                        </article>
                    );
                })}
            </div>

            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-slate-500" />
                        <h3 className="font-bold text-slate-800">سوابق پرداخت اشتراک</h3>
                    </div>
                    {payments.length === 0 ? (
                        <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                            هنوز پرداخت اشتراکی ثبت نشده است.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-right text-sm">
                                <thead className="text-xs text-slate-500">
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-2 font-medium">پلن</th>
                                        <th className="pb-2 font-medium">مبلغ</th>
                                        <th className="pb-2 font-medium">وضعیت</th>
                                        <th className="pb-2 font-medium">پیگیری</th>
                                        <th className="pb-2 font-medium">تاریخ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.slice(0, 8).map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50">
                                            <td className="py-2.5 text-slate-700">
                                                {item.planName}
                                                <span className="mr-1 text-xs text-slate-400">
                                                    ({cycleLabel(item.cycle)})
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-slate-700">
                                                {formatPrice(item.payable)} تومان
                                            </td>
                                            <td className="py-2.5">
                                                <PaymentStatus status={item.status} />
                                            </td>
                                            <td className="py-2.5 font-mono text-xs text-slate-500" dir="ltr">
                                                {item.refId ?? '—'}
                                            </td>
                                            <td className="py-2.5 text-slate-500">
                                                {formatIsoJalali(item.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-slate-500" />
                        <h3 className="font-bold text-slate-800">سؤالات متداول</h3>
                    </div>
                    <ul className="space-y-3 text-sm">
                        <FaqItem
                            q="پرداخت الان واقعی است؟"
                            a="خیر. درگاه ملت و سامان فعلاً نمایشی هستند و فقط روند انتخاب پلن تا نتیجه پرداخت شبیه‌سازی می‌شود."
                        />
                        <FaqItem
                            q="اگر پرداخت ناموفق باشد چه می‌شود؟"
                            a="پلن فعلی تغییر نمی‌کند. می‌توانید دوباره تلاش کنید یا پلن دیگری انتخاب کنید."
                        />
                        <FaqItem
                            q="تفاوت دوره ماهانه و سالانه چیست؟"
                            a={`با پرداخت سالانه تا ${toFaDigits(maxSaving)}٪ کمتر از مجموع ۱۲ ماه پرداخت می‌کنید.`}
                        />
                        <FaqItem
                            q="تفاوت اشتراک پنل و VIP چیست؟"
                            a="اشتراک پنل امکانات خود داشبورد را باز می‌کند. معرفی ویژه VIP جداست و برای دیده شدن در جستجوی بیمار با کلمات کلیدی و شارژ کیف‌پول است."
                        />
                    </ul>
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                        <CreditCard className="h-3.5 w-3.5" />
                        پرداخت امن و رمزنگاری‌شده — به‌روزرسانی {toFaDigits(formatJalali(todayJalali()))}
                    </p>
                </div>
            </section>
        </div>
    );
}

function CycleButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                active ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
            {children}
        </button>
    );
}

function PaymentStatus({ status }: { status: 'success' | 'failed' | 'cancelled' }) {
    if (status === 'success') {
        return <StatusBadge label="موفق" className="bg-emerald-50 text-emerald-700 ring-emerald-200" />;
    }
    if (status === 'cancelled') {
        return <StatusBadge label="لغو شده" className="bg-slate-50 text-slate-600 ring-slate-200" />;
    }
    return <StatusBadge label="ناموفق" className="bg-red-50 text-red-700 ring-red-200" />;
}

function FaqItem({ q, a }: { q: string; a: string }) {
    return (
        <li className="rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="font-medium text-slate-700">{q}</p>
            <p className="mt-1 text-slate-500">{a}</p>
        </li>
    );
}
