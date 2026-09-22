import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { RotateCcw, Wallet } from 'lucide-react';
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
import {
  PaymentStatusView,
  paymentActionClass,
  type PaymentDetailRow,
} from '../../../components/PaymentStatusView';
import { cn } from '../../../components/ui/utils';

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

  const details = useMemo(() => buildReceiptDetails({
    session,
    refId,
    authority,
    gatewayName: gateway?.name,
    amount: amount || session?.payable || 0,
  }), [amount, authority, gateway?.name, refId, session]);

  const rolePrimaryClass = cn(
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(15,23,42,0.35)] transition hover:brightness-105 active:scale-[0.99]',
    providerPayButtonClass[role]
  );

  return (
    <div className="mx-auto max-w-xl">
      {state === 'loading' && (
        <PaymentStatusView
          status="loading"
          title="در حال بررسی نتیجه پرداخت..."
          subtitle="لطفاً چند لحظه صبر کنید تا وضعیت تراکنش مشخص شود."
        />
      )}

      {state === 'success' && (
        <PaymentStatusView
          status="success"
          title="از پرداخت شما متشکریم"
          subtitle={
            vip
              ? `${formatPrice(session?.vipCredit ?? session?.amount ?? 0)} تومان به موجودی VIP اضافه شد.`
              : `پلن ${session?.planName} با دوره ${session?.cycle ? cycleLabel(session.cycle) : ''} با موفقیت فعال شد.`
          }
          details={details}
          primaryAction={
            <button type="button" onClick={goHome} className={rolePrimaryClass}>
              <Wallet className="h-4 w-4" />
              {vip ? 'مشاهده کیف‌پول VIP' : 'مشاهده پلن فعال'}
            </button>
          }
        />
      )}

      {(state === 'failed' || state === 'cancelled') && (
        <PaymentStatusView
          status={state === 'cancelled' ? 'cancelled' : 'failed'}
          title={state === 'cancelled' ? 'پرداخت لغو شد' : 'پرداخت ناموفق بود'}
          subtitle={errorMessage}
          notice={
            vip
              ? 'موجودی VIP شما تغییری نکرده است و می‌توانید دوباره تلاش کنید.'
              : 'پلن فعلی شما تغییری نکرده است و می‌توانید دوباره تلاش کنید.'
          }
          details={details}
          primaryAction={
            <button type="button" onClick={retry} className={rolePrimaryClass}>
              <RotateCcw className="h-4 w-4" />
              تلاش مجدد
            </button>
          }
          secondaryAction={
            <button type="button" onClick={goHome} className={paymentActionClass.secondary}>
              {vip ? 'بازگشت به VIP' : 'بازگشت به پلن‌ها'}
            </button>
          }
        />
      )}
    </div>
  );
}

function buildReceiptDetails({
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
}): PaymentDetailRow[] {
  if (!session) return [];

  const rows: PaymentDetailRow[] = [];
  if (refId) {
    rows.push({
      label: 'شماره پیگیری',
      value: refId,
      mono: true,
      copyValue: refId,
      emphasize: true,
    });
  }
  if (authority) {
    rows.push({ label: 'کد مرجع', value: authority, mono: true });
  }
  rows.push({
    label: isVipCheckout(session) ? 'بسته' : 'پلن',
    value: `${session.planName}${session.cycle ? ` (${cycleLabel(session.cycle)})` : ''}`,
  });
  if (isVipCheckout(session) && session.vipGift) {
    rows.push({ label: 'شارژ هدیه', value: `${formatPrice(session.vipGift)} تومان` });
  }
  if (isVipCheckout(session) && session.vipCredit) {
    rows.push({ label: 'اعتبار اضافه‌شده', value: `${formatPrice(session.vipCredit)} تومان` });
  }
  if (gatewayName) {
    rows.push({ label: 'درگاه', value: `${gatewayName} (نمونه)` });
  }
  if (session.discount > 0) {
    rows.push({ label: 'تخفیف', value: `${formatPrice(session.discount)} تومان` });
  }
  rows.push({
    label: 'مبلغ',
    value: `${formatPrice(amount)} تومان`,
    emphasize: true,
  });
  rows.push({ label: 'تاریخ', value: formatIsoJalali(session.createdAt) });
  return rows;
}
