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
    loadProviderPlanCheckout,
    saveProviderPlanCheckout,
    type ProviderPlanCheckoutSession,
} from '../../lib/providerPlanCheckout';
import { useProviderPlanStore } from '../../store/providerPlanStore';
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
                    setErrorMessage('اطلاعات پرداخت یافت نشد. لطفاً دوباره از صفحه پلن‌ها اقدام کنید.');
                    setState('failed');
                }
                return;
            }
            if (!cancelled) setSession(loaded);

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
            if (!hasPayment(role, loaded.authority)) {
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
    }, [activatePlan, addPayment, hasPayment, reason, role, status]);

    const goPlans = () => navigate(providerPath(role, 'plans'), { replace: true });
    const retry = () => {
        if (session) {
            saveProviderPlanCheckout({
                ...session,
                finalized: false,
                resultStatus: undefined,
                refId: undefined,
            });
            navigate(
                `${providerPath(role, 'plans/checkout')}?plan=${session.planId}&cycle=${session.cycle}`,
                { replace: true }
            );
            return;
        }
        goPlans();
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
                            پلن {session?.planName} با دوره {session ? cycleLabel(session.cycle) : ''} با موفقیت فعال شد.
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
                            onClick={goPlans}
                            className={`mt-6 h-11 w-full rounded-xl text-sm font-bold text-white ${providerPayButtonClass[role]}`}
                        >
                            مشاهده پلن فعال
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
                            پلن فعلی شما تغییری نکرده است و می‌توانید دوباره تلاش کنید.
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
                                onClick={goPlans}
                                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                بازگشت به پلن‌ها
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
                <span className="text-slate-500">پلن</span>
                <span>
                    {session.planName} ({cycleLabel(session.cycle)})
                </span>
            </div>
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
