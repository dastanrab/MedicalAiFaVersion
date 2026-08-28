import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { formatPrice } from '../../components';
import type { ProviderRole } from '../../config/providerNav';
import { providerPath } from '../../config/providerNav';
import { cycleLabel, providerPayButtonClass } from '../../data/providerPlans';
import { getGatewayById } from '../../../data/paymentGateways';
import {
    createProviderRefId,
    isVipCheckout,
    loadProviderPlanCheckout,
    saveProviderPlanCheckout,
    type ProviderPlanCheckoutSession,
} from '../../lib/providerPlanCheckout';
import { useProviderPlanStore } from '../../store/providerPlanStore';
import { useProviderVipStore } from '../../store/providerVipStore';
import { formatJalali, toFaDigits } from '../../utils/jalali';
import { toJalaali } from 'jalaali-js';

interface ProviderPlanPaymentResultPageProps {
    role: ProviderRole;
}

type ResultState = 'loading' | 'success' | 'failed' | 'cancelled';

function formatIsoJalali(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return toFaDigits(formatJalali(j));
}

export function ProviderPlanPaymentResultPage({ role }: ProviderPlanPaymentResultPageProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activatePlan = useProviderPlanStore((s) => s.activatePlan);
    const addPayment = useProviderPlanStore((s) => s.addPayment);
    const hasPayment = useProviderPlanStore((s) => s.hasPayment);
    const creditVip = useProviderVipStore((s) => s.creditBalance);
    const addVipCharge = useProviderVipStore((s) => s.addCharge);
    const hasVipCharge = useProviderVipStore((s) => s.hasCharge);
    const ensureVipAccount = useProviderVipStore((s) => s.ensureAccount);

    const [state, setState] = useState<ResultState>('loading');
    const [session, setSession] = useState<ProviderPlanCheckoutSession | null>(null);
    const [refId, setRefId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('پرداخت انجام نشد');

    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const authority = searchParams.get('authority') ?? '';
    const gateway = getGatewayById(searchParams.get('gateway'));
    const amount = Number(searchParams.get('amount') || 0);

    useEffect(() => {
        let cancelled = false;

        const finalize = async () => {
            const loaded = loadProviderPlanCheckout();
            if (!loaded || loaded.role !== role) {
                if (!cancelled) {
                    setErrorMessage('اطلاعات پرداخت یافت نشد. لطفاً دوباره اقدام کنید.');
                    setState('failed');
                }
                return;
            }
            if (!cancelled) setSession(loaded);
            const vip = isVipCheckout(loaded);
            if (vip) ensureVipAccount(role);

            await new Promise((r) => setTimeout(r, 700));
            if (cancelled) return;

            if (loaded.finalized && loaded.resultStatus) {
                setRefId(loaded.refId ?? null);
                setState(loaded.resultStatus);
                return;
            }

            if (status !== 'OK') {
                const resultStatus = reason === 'cancelled' ? 'cancelled' : 'failed';
                const failureReason =
                    resultStatus === 'cancelled'
                        ? 'پرداخت توسط شما لغو شد'
                        : 'درگاه بانکی تراکنش را تأیید نکرد';

                if (vip) {
                    addVipCharge(role, {
                        id: `vip-${loaded.authority}`,
                        packageId: loaded.vipPackageId ?? 'vip',
                        packageName: loaded.planName,
                        payAmount: loaded.amount,
                        giftAmount: loaded.vipGift ?? 0,
                        credit: loaded.vipCredit ?? loaded.amount,
                        discount: loaded.discount,
                        payable: loaded.payable,
                        gatewayId: loaded.gatewayId,
                        authority: loaded.authority,
                        status: resultStatus,
                        createdAt: new Date().toISOString(),
                        failureReason,
                    });
                } else if (loaded.planId && loaded.cycle) {
                    addPayment(role, {
                        id: `pay-${loaded.authority}`,
                        planId: loaded.planId,
                        planName: loaded.planName,
                        cycle: loaded.cycle,
                        amount: loaded.amount,
                        discount: loaded.discount,
                        payable: loaded.payable,
                        gatewayId: loaded.gatewayId,
                        authority: loaded.authority,
                        status: resultStatus,
                        createdAt: new Date().toISOString(),
                        failureReason,
                    });
                }

                saveProviderPlanCheckout({
                    ...loaded,
                    finalized: true,
                    resultStatus,
                });

                setErrorMessage(failureReason);
                setState(resultStatus);
                return;
            }

            const nextRefId = createProviderRefId();
            if (vip) {
                if (!hasVipCharge(role, loaded.authority)) {
                    creditVip(role, loaded.vipCredit ?? loaded.amount);
                    addVipCharge(role, {
                        id: `vip-${loaded.authority}`,
                        packageId: loaded.vipPackageId ?? 'vip',
                        packageName: loaded.planName,
                        payAmount: loaded.amount,
                        giftAmount: loaded.vipGift ?? 0,
                        credit: loaded.vipCredit ?? loaded.amount,
                        discount: loaded.discount,
                        payable: loaded.payable,
                        gatewayId: loaded.gatewayId,
                        authority: loaded.authority,
                        refId: nextRefId,
                        status: 'success',
                        createdAt: new Date().toISOString(),
                    });
                }
            } else if (loaded.planId && loaded.cycle && !hasPayment(role, loaded.authority)) {
                activatePlan(role, loaded.planId, loaded.cycle);
                addPayment(role, {
                    id: `pay-${loaded.authority}`,
                    planId: loaded.planId,
                    planName: loaded.planName,
                    cycle: loaded.cycle,
                    amount: loaded.amount,
                    discount: loaded.discount,
                    payable: loaded.payable,
                    gatewayId: loaded.gatewayId,
                    authority: loaded.authority,
                    refId: nextRefId,
                    status: 'success',
                    createdAt: new Date().toISOString(),
                });
            }

            saveProviderPlanCheckout({
                ...loaded,
                finalized: true,
                resultStatus: 'success',
                refId: nextRefId,
            });

            setRefId(nextRefId);
            setState('success');
        };

        void finalize();
        return () => {
            cancelled = true;
        };
    }, [
        activatePlan,
        addPayment,
        addVipCharge,
        creditVip,
        ensureVipAccount,
        hasPayment,
        hasVipCharge,
        reason,
        role,
        status,
    ]);

    const vip = isVipCheckout(session);
    const homePath = vip ? providerPath(role, 'vip') : providerPath(role, 'plans');
    const goHome = () => navigate(homePath, { replace: true });
    const retry = () => {
        if (session) {
            saveProviderPlanCheckout({
                ...session,
                finalized: false,
                resultStatus: undefined,
                refId: undefined,
            });
            if (isVipCheckout(session)) {
                navigate(
                    `${providerPath(role, 'vip/checkout')}?package=${session.vipPackageId ?? ''}`,
                    { replace: true }
                );
                return;
            }
            navigate(
                `${providerPath(role, 'plans/checkout')}?plan=${session.planId}&cycle=${session.cycle}`,
                { replace: true }
            );
            return;
        }
        goHome();
    };

    return (
        <div className="mx-auto max-w-xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                {state === 'loading' && (
                    <>
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-400" />
                        <h1 className="mt-4 text-lg font-bold text-slate-800">در حال بررسی نتیجه پرداخت...</h1>
                        <p className="mt-2 text-sm text-slate-500">لطفاً چند لحظه صبر کنید</p>
                    </>
                )}

                {state === 'success' && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                        </div>
                        <h1 className="mt-4 text-xl font-bold text-slate-800">از پرداخت شما متشکریم</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {vip
                                ? `${formatPrice(session?.vipCredit ?? session?.amount ?? 0)} تومان به موجودی VIP اضافه شد.`
                                : `پلن ${session?.planName} با دوره ${session?.cycle ? cycleLabel(session.cycle) : ''} با موفقیت فعال شد.`}
                        </p>
                        <Receipt
                            session={session}
                            refId={refId}
                            authority={authority}
                            gatewayName={gateway?.name}
                            amount={amount || session?.payable || 0}
                        />
                        <button
                            type="button"
                            onClick={goHome}
                            className={`mt-6 h-11 w-full rounded-xl text-sm font-bold text-white ${providerPayButtonClass[role]}`}
                        >
                            {vip ? 'مشاهده کیف‌پول VIP' : 'مشاهده پلن فعال'}
                        </button>
                    </>
                )}

                {(state === 'failed' || state === 'cancelled') && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                            <XCircle className="h-9 w-9 text-red-600" />
                        </div>
                        <h1 className="mt-4 text-xl font-bold text-slate-800">
                            {state === 'cancelled' ? 'پرداخت لغو شد' : 'پرداخت ناموفق بود'}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                        <p className="mt-1 text-xs text-slate-400">
                            {vip
                                ? 'موجودی VIP شما تغییری نکرده است و می‌توانید دوباره تلاش کنید.'
                                : 'پلن فعلی شما تغییری نکرده است و می‌توانید دوباره تلاش کنید.'}
                        </p>
                        {session && (
                            <Receipt
                                session={session}
                                refId={null}
                                authority={authority}
                                gatewayName={gateway?.name}
                                amount={amount || session.payable}
                            />
                        )}
                        <div className="mt-6 flex gap-2">
                            <button
                                type="button"
                                onClick={goHome}
                                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                {vip ? 'بازگشت به VIP' : 'بازگشت به پلن‌ها'}
                            </button>
                            <button
                                type="button"
                                onClick={retry}
                                className={`inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold text-white ${providerPayButtonClass[role]}`}
                            >
                                <RotateCcw className="h-4 w-4" />
                                تلاش مجدد
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function Receipt({
    session,
    refId,
    authority,
    gatewayName,
    amount,
}: {
    session: ProviderPlanCheckoutSession | null;
    refId: string | null;
    authority: string;
    gatewayName?: string;
    amount: number;
}) {
    if (!session) return null;

    return (
        <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            {refId && (
                <div className="flex justify-between gap-3">
                    <span className="text-slate-500">شماره پیگیری</span>
                    <span className="font-bold" dir="ltr">
                        {refId}
                    </span>
                </div>
            )}
            {authority && (
                <div className="flex justify-between gap-3">
                    <span className="text-slate-500">کد مرجع</span>
                    <span className="truncate font-mono text-xs" dir="ltr">
                        {authority}
                    </span>
                </div>
            )}
            <div className="flex justify-between gap-3">
                <span className="text-slate-500">{isVipCheckout(session) ? 'بسته' : 'پلن'}</span>
                <span>
                    {session.planName}
                    {session.cycle ? ` (${cycleLabel(session.cycle)})` : ''}
                </span>
            </div>
            {isVipCheckout(session) && session.vipGift ? (
                <div className="flex justify-between gap-3">
                    <span className="text-slate-500">شارژ هدیه</span>
                    <span>{formatPrice(session.vipGift)} تومان</span>
                </div>
            ) : null}
            {isVipCheckout(session) && session.vipCredit ? (
                <div className="flex justify-between gap-3">
                    <span className="text-slate-500">اعتبار اضافه‌شده</span>
                    <span>{formatPrice(session.vipCredit)} تومان</span>
                </div>
            ) : null}
            {gatewayName && (
                <div className="flex justify-between gap-3">
                    <span className="text-slate-500">درگاه</span>
                    <span>{gatewayName} (نمونه)</span>
                </div>
            )}
            {session.discount > 0 && (
                <div className="flex justify-between gap-3">
                    <span className="text-slate-500">تخفیف</span>
                    <span>{formatPrice(session.discount)} تومان</span>
                </div>
            )}
            <div className="flex justify-between gap-3">
                <span className="text-slate-500">مبلغ</span>
                <span className="font-bold">{formatPrice(amount)} تومان</span>
            </div>
            <div className="flex justify-between gap-3">
                <span className="text-slate-500">تاریخ</span>
                <span>{formatIsoJalali(session.createdAt)}</span>
            </div>
        </div>
    );
}
