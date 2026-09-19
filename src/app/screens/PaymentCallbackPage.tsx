import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Home, RotateCcw } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import {
  PaymentStatusView,
  paymentActionClass,
  type PaymentDetailRow,
} from '../components/PaymentStatusView';
import { getGatewayById } from '../data/paymentGateways';
import { formatPrice } from '../data/userFinanceMockData';
import { useAuthStore } from '../store/authStore';
import {
  clearCheckoutSession,
  createMockRefId,
  loadCheckoutSession,
  type CheckoutSession,
} from '../lib/checkoutSession';

const pageClass =
  'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-[radial-gradient(ellipse_at_top,_#e0f2fe_0%,_#f8fafc_45%,_#ffffff_100%)] pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';

type CallbackState = 'loading' | 'success' | 'failed';

export function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuthStore();

  const [state, setState] = useState<CallbackState>('loading');
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [refId, setRefId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const status = searchParams.get('status');
  const authority = searchParams.get('authority') ?? '';
  const gatewayId = searchParams.get('gateway');
  const amount = Number(searchParams.get('amount') || 0);
  const gateway = getGatewayById(gatewayId);

  useEffect(() => {
    let cancelled = false;

    async function finalize() {
      const loaded = loadCheckoutSession();
      if (!loaded) {
        if (!cancelled) {
          setErrorMessage('اطلاعات پرداخت یافت نشد');
          setState('failed');
        }
        return;
      }
      if (!cancelled) setSession(loaded);

      if (status !== 'OK') {
        if (!cancelled) {
          setErrorMessage('پرداخت توسط درگاه تأیید نشد یا لغو شد');
          setState('failed');
        }
        return;
      }

      try {
        if (loaded.kind === 'reservation' && loaded.reservationToken) {
          const response = await fetch(
            'https://api.mediraai.com/api/user/reservations/confirm',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                reservation_token: loaded.reservationToken,
                authority: authority || `A${Date.now()}`,
                status: 'OK',
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'خطا در تأیید رزرو پس از پرداخت');
          }

          const result = await response.json();
          if (!result.success) {
            throw new Error(result.message || 'تأیید رزرو ناموفق بود');
          }

          if (!cancelled) {
            setRefId(String(result.data?.payment?.ref_id ?? createMockRefId()));
            setState('success');
          }
        } else {
          await new Promise((r) => setTimeout(r, 700));
          if (!cancelled) {
            setRefId(createMockRefId());
            setState('success');
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'خطا در نهایی‌سازی پرداخت');
          setState('failed');
        }
      } finally {
        clearCheckoutSession();
      }
    }

    void finalize();
    return () => {
      cancelled = true;
    };
  }, [accessToken, authority, status]);

  const goHome = () => {
    if (session?.kind === 'reservation' && session.doctorId) {
      navigate(`/doctor/${session.doctorId}`, { replace: true });
      return;
    }
    navigate(session?.returnPath || '/finance', { replace: true });
  };

  const returnPath = session?.returnPath || '/finance';

  const details = useMemo(() => {
    const rows: PaymentDetailRow[] = [];
    if (state === 'success' && refId) {
      rows.push({ label: 'شماره پیگیری', value: refId, mono: true, copyValue: refId, emphasize: true });
    }
    if (authority) {
      rows.push({ label: 'کد مرجع', value: authority, mono: true });
    }
    if (gateway) {
      rows.push({
        label: 'درگاه',
        value: `${gateway.name}${gateway.isSample ? ' (نمونه)' : ''}`,
      });
    }
    if (amount > 0) {
      rows.push({
        label: 'مبلغ',
        value: `${formatPrice(amount)} تومان`,
        emphasize: true,
      });
    }
    return rows;
  }, [amount, authority, gateway, refId, state]);

  return (
    <div className={pageClass}>
      <AppBar backTo={returnPath} />

      <div className="mx-auto w-full max-w-lg px-3 pb-6 pt-24 sm:px-4">
        {state === 'loading' && (
          <PaymentStatusView
            status="loading"
            title="در حال تأیید پرداخت..."
            subtitle="لطفاً چند لحظه صبر کنید؛ نتیجه تراکنش در حال بررسی است."
          />
        )}

        {state === 'success' && (
          <PaymentStatusView
            status="success"
            title="پرداخت با موفقیت انجام شد"
            subtitle={session?.title ?? 'سفارش شما ثبت و پرداخت شد'}
            details={details}
            primaryAction={
              <button type="button" onClick={goHome} className={paymentActionClass.success}>
                <Home className="h-4 w-4" />
                بازگشت
              </button>
            }
          />
        )}

        {state === 'failed' && (
          <PaymentStatusView
            status="failed"
            title="پرداخت ناموفق بود"
            subtitle={errorMessage ?? 'تراکنش تکمیل نشد'}
            details={details.length > 0 ? details : undefined}
            notice="اگر مبلغی از حساب شما کسر شده، معمولاً تا ۷۲ ساعت توسط بانک مبدأ برگشت داده می‌شود."
            primaryAction={
              <button
                type="button"
                onClick={() => navigate(returnPath, { replace: true })}
                className={paymentActionClass.danger}
              >
                <RotateCcw className="h-4 w-4" />
                تلاش مجدد
              </button>
            }
            secondaryAction={
              <button
                type="button"
                onClick={() => navigate(returnPath, { replace: true })}
                className={paymentActionClass.secondary}
              >
                انصراف
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
