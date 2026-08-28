import { useNavigate } from 'react-router';
import { ArrowRight, CreditCard, Gift, Wallet } from 'lucide-react';
import { PageHeader, formatPrice } from '../../components';
import type { ProviderRole } from '../../config/providerNav';
import { providerPath } from '../../config/providerNav';
import { providerRoleLabels } from '../../config/providerTheme';
import {
    vipChargePackages,
    vipPackageCredit,
} from '../../data/providerVip';
import {
    createProviderAuthority,
    saveProviderPlanCheckout,
} from '../../lib/providerPlanCheckout';
import {
    createDefaultVipAccount,
    useProviderVipStore,
} from '../../store/providerVipStore';

interface ProviderVipChargePageProps {
    role: ProviderRole;
}

export function ProviderVipChargePage({ role }: ProviderVipChargePageProps) {
    const navigate = useNavigate();
    const account = useProviderVipStore((s) => s.accounts[role]) ?? createDefaultVipAccount(role);

    const startPay = (packageId: string) => {
        const pack = vipChargePackages.find((item) => item.id === packageId);
        if (!pack) return;

        saveProviderPlanCheckout({
            kind: 'vip_charge',
            role,
            planName: `شارژ VIP ${formatCompact(pack.payAmount)}`,
            amount: pack.payAmount,
            payable: pack.payAmount,
            discount: 0,
            coupon: '',
            gatewayId: 'mellat',
            authority: createProviderAuthority('mellat'),
            returnPath: providerPath(role, 'vip'),
            createdAt: new Date().toISOString(),
            vipPackageId: pack.id,
            vipCredit: vipPackageCredit(pack),
            vipGift: pack.giftAmount,
        });

        navigate(`${providerPath(role, 'vip/checkout')}?package=${pack.id}`);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="شارژ سرویس VIP"
                description="با شارژ کیف‌پول، در کلمات کلیدی انتخاب‌شده بالاتر دیده می‌شوید و بیمار بیشتری جذب می‌کنید."
                actions={
                    <button
                        type="button"
                        onClick={() => navigate(providerPath(role, 'vip'))}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowRight className="h-4 w-4" />
                        بازگشت به VIP
                    </button>
                }
            />

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">شارژ سرویس VIP</h2>
                        <p className="mt-1 max-w-2xl text-sm leading-7 text-slate-500">
                            معرفی ویژه باعث می‌شود {providerRoleLabels[role]} شما در جستجوی کلمات کلیدی بالاتر دیده شود
                            و معمولاً ظرف ۴۸ ساعت بیمار بیشتری جذب کنید. مبلغ پرداختی به موجودی VIP اضافه می‌شود و شارژ هدیه هم همراه آن واریز می‌گردد.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {vipChargePackages.map((pack) => (
                        <article
                            key={pack.id}
                            className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                        >
                            {pack.popular && (
                                <span className="absolute left-4 top-4 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white">
                                    پیشنهاد ویژه
                                </span>
                            )}
                            <p className="text-sm text-slate-500">پرداختی</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">
                                {formatPrice(pack.payAmount)}
                                <span className="mr-1 text-sm font-normal text-slate-500">تومان</span>
                            </p>
                            <p className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                                <Gift className="h-4 w-4" />
                                شارژ هدیه {formatPrice(pack.giftAmount)} تومان
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                                موجودی اضافه‌شده: {formatPrice(vipPackageCredit(pack))} تومان
                            </p>
                            <button
                                type="button"
                                onClick={() => startPay(pack.id)}
                                className="mt-4 inline-flex h-10 items-center rounded-xl bg-slate-800 px-5 text-sm font-semibold text-white hover:bg-slate-900"
                            >
                                پرداخت
                            </button>
                        </article>
                    ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-2 font-semibold">
                        <Wallet className="h-4 w-4 text-slate-500" />
                        موجودی فعلی: {formatPrice(account.balance)} تومان
                    </span>
                    <span className="text-xs text-slate-400">پرداخت فعلاً نمایشی است و به درگاه نمونه متصل می‌شود.</span>
                </div>
            </div>
        </div>
    );
}

function formatCompact(amount: number): string {
    if (amount >= 1_000_000) {
        return `${formatPrice(amount / 1_000_000)} میلیون`;
    }
    return formatPrice(amount);
}
