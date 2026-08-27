import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, ShieldAlert, X } from 'lucide-react';
import type { ProviderRole } from '../../config/providerNav';
import { providerPath } from '../../config/providerNav';
import { cycleLabel } from '../../data/providerPlans';
import { getGatewayById } from '../../../data/paymentGateways';
import { formatPrice } from '../../components';
import { loadProviderPlanCheckout } from '../../lib/providerPlanCheckout';

interface ProviderPlanGatewayPageProps {
    role: ProviderRole;
}

export function ProviderPlanGatewayPage({ role }: ProviderPlanGatewayPageProps) {
    const navigate = useNavigate();
    const [session] = useState(() => loadProviderPlanCheckout());
    const gateway = getGatewayById(session?.gatewayId);
    const [busy, setBusy] = useState<'success' | 'failed' | 'cancelled' | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(10 * 60);

    useEffect(() => {
        if (!session || session.role !== role) {
            navigate(providerPath(role, 'plans'), { replace: true });
        }
    }, [navigate, role, session]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    finish('cancelled');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
        // finish is stable enough for this mock timer
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const finish = (outcome: 'success' | 'failed' | 'cancelled') => {
        if (busy || !session) return;
        setBusy(outcome);
        const status = outcome === 'success' ? 'OK' : 'NOK';
        const reason = outcome === 'success' ? '' : outcome;
        const params = new URLSearchParams({
            status,
            reason,
            authority: session.authority,
            gateway: session.gatewayId,
            amount: String(session.payable),
        });
        window.setTimeout(() => {
            navigate(`${providerPath(role, 'plans/result')}?${params.toString()}`, { replace: true });
        }, 900);
    };

    if (!session) return null;

    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const seconds = String(secondsLeft % 60).padStart(2, '0');

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-200 font-[YekanBakhFaNum]" dir="rtl">
            <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-8">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between bg-slate-800 px-5 py-4 text-white">
                        <div className="flex items-center gap-3">
                            {gateway?.logo && (
                                <img
                                    src={gateway.logo}
                                    alt={gateway.name}
                                    className="h-10 w-10 rounded-lg bg-white object-contain p-1"
                                />
                            )}
                            <div>
                                <p className="text-sm font-bold">{gateway?.name ?? 'درگاه پرداخت'}</p>
                                <p className="text-[11px] text-slate-300">پرداخت امن اینترنتی (نمایشی)</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={Boolean(busy)}
                            onClick={() => finish('cancelled')}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                            aria-label="انصراف"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-4 p-5">
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                            <Row label="پذیرنده" value="پلتفرم خدمات سلامت" />
                            <Row label="بابت" value={`اشتراک پلن ${session.planName} (${cycleLabel(session.cycle)})`} />
                            <Row label="شماره سفارش" value={session.authority} mono />
                            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                                <span className="text-slate-500">مبلغ قابل پرداخت</span>
                                <span className="text-lg font-bold text-slate-800">
                                    {formatPrice(session.payable)} تومان
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">
                            <span>زمان باقی‌مانده نشست</span>
                            <span className="font-mono font-bold" dir="ltr">
                                {minutes}:{seconds}
                            </span>
                        </div>

                        <p className="text-xs leading-6 text-slate-500">
                            این صفحه جایگزین درگاه واقعی بانک است. یکی از سه نتیجه را انتخاب کنید تا صفحه تشکر یا خطا نمایش داده شود.
                        </p>

                        {busy ? (
                            <div className="flex flex-col items-center py-6 text-slate-600">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                <p className="mt-3 text-sm">
                                    {busy === 'success'
                                        ? 'در حال تأیید پرداخت...'
                                        : busy === 'cancelled'
                                          ? 'در حال لغو تراکنش...'
                                          : 'در حال ثبت خطای درگاه...'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => finish('success')}
                                    className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700"
                                >
                                    پرداخت موفق
                                </button>
                                <button
                                    type="button"
                                    onClick={() => finish('failed')}
                                    className="h-12 w-full rounded-xl bg-red-50 text-sm font-bold text-red-700 ring-1 ring-red-100 hover:bg-red-100"
                                >
                                    شبیه‌سازی خطای درگاه
                                </button>
                                <button
                                    type="button"
                                    onClick={() => finish('cancelled')}
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    انصراف از پرداخت
                                </button>
                            </div>
                        )}

                        <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            هیچ اطلاعات کارت بانکی واقعی دریافت یا ذخیره نمی‌شود.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-3 py-1.5">
            <span className="text-slate-500">{label}</span>
            <span className={`text-left text-slate-800 ${mono ? 'font-mono text-xs' : 'font-medium'}`} dir={mono ? 'ltr' : undefined}>
                {value}
            </span>
        </div>
    );
}
