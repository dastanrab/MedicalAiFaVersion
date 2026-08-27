import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
    ArrowRight,
    Check,
    CreditCard,
    Loader2,
    ShieldCheck,
    TicketPercent,
    X,
} from 'lucide-react';
import { PageHeader, formatPrice } from '../../components';
import type { ProviderRole } from '../../config/providerNav';
import { providerPath } from '../../config/providerNav';
import {
    calcProviderPlanDiscount,
    cycleLabel,
    findProviderPlanDiscount,
    getPlanPrice,
    getProviderPlan,
    providerPayButtonClass,
    type BillingCycle,
    type ProviderPlanDiscountCode,
    type ProviderPlanId,
} from '../../data/providerPlans';
import {
    paymentGateways,
    type PaymentGatewayId,
} from '../../../data/paymentGateways';
import {
    createProviderAuthority,
    loadProviderPlanCheckout,
    saveProviderPlanCheckout,
} from '../../lib/providerPlanCheckout';

interface ProviderPlanCheckoutPageProps {
    role: ProviderRole;
}

function isBillingCycle(value: string | null): value is BillingCycle {
    return value === 'monthly' || value === 'yearly';
}

function isPlanId(value: string | null): value is ProviderPlanId {
    return value === 'starter' || value === 'professional' || value === 'enterprise';
}

export function ProviderPlanCheckoutPage({ role }: ProviderPlanCheckoutPageProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [session] = useState(() => loadProviderPlanCheckout());
    const [gatewayId, setGatewayId] = useState<PaymentGatewayId>(session?.gatewayId ?? 'mellat');
    const [couponInput, setCouponInput] = useState(session?.coupon ?? '');
    const [appliedDiscount, setAppliedDiscount] = useState<ProviderPlanDiscountCode | null>(() =>
        session?.coupon ? findProviderPlanDiscount(session.coupon) : null
    );
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    const planId = isPlanId(searchParams.get('plan')) ? searchParams.get('plan')! : session?.planId;
    const cycle = isBillingCycle(searchParams.get('cycle'))
        ? searchParams.get('cycle')!
        : session?.cycle ?? 'monthly';
    const plan = planId ? getProviderPlan(role, planId) : undefined;
    const amount = plan ? getPlanPrice(plan, cycle) : 0;

    useEffect(() => {
        if (!planId || amount <= 0 || (session && session.role !== role)) {
            navigate(providerPath(role, 'plans'), { replace: true });
        }
    }, [amount, navigate, planId, role, session]);

    const discountAmount = appliedDiscount ? calcProviderPlanDiscount(amount, appliedDiscount) : 0;
    const payable = Math.max(0, amount - discountAmount);

    const applyCoupon = () => {
        setCouponError(null);
        const found = findProviderPlanDiscount(couponInput);
        if (!found) {
            setAppliedDiscount(null);
            setCouponError('کد تخفیف معتبر نیست. نمونه: PROVIDER10');
            return;
        }
        if (calcProviderPlanDiscount(amount, found) <= 0) {
            setAppliedDiscount(null);
            setCouponError('این کد برای این مبلغ قابل استفاده نیست');
            return;
        }
        setAppliedDiscount(found);
        setCouponInput(found.code);
    };

    const handlePay = () => {
        if (!plan || isPaying) return;
        setIsPaying(true);

        saveProviderPlanCheckout({
            role,
            planId: plan.id,
            planName: plan.name,
            cycle,
            amount,
            payable,
            discount: discountAmount,
            coupon: appliedDiscount?.code ?? '',
            gatewayId,
            authority: createProviderAuthority(gatewayId),
            returnPath: providerPath(role, 'plans'),
            createdAt: new Date().toISOString(),
        });

        window.setTimeout(() => {
            navigate(providerPath(role, 'plans/gateway'), { replace: true });
        }, 700);
    };

    if (!plan) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <PageHeader
                title="تکمیل پرداخت اشتراک"
                description="جزئیات پلن، کد تخفیف و درگاه بانکی را بررسی کنید."
                actions={
                    <button
                        type="button"
                        onClick={() => navigate(providerPath(role, 'plans'))}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowRight className="h-4 w-4" />
                        بازگشت به پلن‌ها
                    </button>
                }
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs text-slate-500">پلن انتخاب‌شده</p>
                        <h2 className="mt-1 text-lg font-bold text-slate-800">{plan.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            دوره {cycleLabel(cycle)} · {plan.description}
                        </p>
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-slate-400">مبلغ</p>
                        <p className="text-base font-bold text-slate-800">
                            {formatPrice(amount)}
                            <span className="mr-1 text-xs font-normal text-slate-500">تومان</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                    <TicketPercent className="h-4 w-4 text-slate-500" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">کد تخفیف</h3>
                        <p className="text-[11px] text-slate-500">در صورت داشتن کد، اینجا وارد کنید</p>
                    </div>
                </div>
                <div className="px-5 py-4">
                    {appliedDiscount ? (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-200">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                                <Check className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-emerald-900" dir="ltr">
                                    {appliedDiscount.code}
                                </p>
                                <p className="text-[11px] text-emerald-700">{appliedDiscount.description}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setAppliedDiscount(null);
                                    setCouponInput('');
                                    setCouponError(null);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-100"
                                aria-label="حذف کد تخفیف"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => {
                                    setCouponInput(e.target.value);
                                    if (couponError) setCouponError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        applyCoupon();
                                    }
                                }}
                                placeholder="مثلاً PROVIDER10"
                                disabled={isPaying}
                                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                                dir="ltr"
                            />
                            <button
                                type="button"
                                onClick={applyCoupon}
                                disabled={!couponInput.trim() || isPaying}
                                className="h-11 rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
                            >
                                اعمال
                            </button>
                        </div>
                    )}
                    {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-800">انتخاب درگاه بانکی</h3>
                <div className="space-y-2">
                    {paymentGateways.map((gateway) => {
                        const selected = gatewayId === gateway.id;
                        return (
                            <button
                                key={gateway.id}
                                type="button"
                                disabled={isPaying}
                                onClick={() => setGatewayId(gateway.id)}
                                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-right transition ${
                                    selected
                                        ? `border-transparent bg-slate-50 ring-2 ${gateway.selectedRingClass}`
                                        : 'border-slate-100 bg-white hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
                                    <img src={gateway.logo} alt={gateway.name} className="h-10 w-10 object-contain" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-800">{gateway.name}</p>
                                    <p className="mt-0.5 text-[11px] text-slate-500">{gateway.description}</p>
                                </div>
                                <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                        selected ? 'border-slate-800 bg-slate-800' : 'border-slate-300'
                                    }`}
                                >
                                    {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="space-y-2.5 text-sm">
                    <Row label="مبلغ اشتراک" value={formatPrice(amount)} />
                    <Row
                        label="تخفیف"
                        value={discountAmount > 0 ? `−${formatPrice(discountAmount)}` : '۰'}
                        valueClass={discountAmount > 0 ? 'text-emerald-600' : undefined}
                    />
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                        <span className="text-base font-bold text-slate-800">مبلغ قابل پرداخت</span>
                        <span className="text-base font-bold text-slate-800">
                            {formatPrice(payable)}
                            <span className="mr-1 text-xs font-normal text-slate-500">تومان</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800 ring-1 ring-amber-100">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                    درگاه‌های ملت و سامان فعلاً نمایشی هستند. پس از ادامه، صفحه شبیه‌سازی بانک باز می‌شود تا پرداخت موفق، لغو یا ناموفق را انتخاب کنید.
                </p>
            </div>

            <button
                type="button"
                onClick={handlePay}
                disabled={isPaying}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white shadow-sm ${providerPayButtonClass[role]}`}
            >
                {isPaying ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        در حال اتصال به درگاه...
                    </>
                ) : (
                    <>
                        <CreditCard className="h-5 w-5" />
                        پرداخت آنلاین — {formatPrice(payable)} تومان
                    </>
                )}
            </button>
        </div>
    );
}

function Row({
    label,
    value,
    valueClass,
}: {
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between text-slate-600">
            <span>{label}</span>
            <span className={`font-bold ${valueClass ?? 'text-slate-800'}`}>
                {value}
                <span className="mr-1 text-[11px] font-normal text-slate-500">تومان</span>
            </span>
        </div>
    );
}
