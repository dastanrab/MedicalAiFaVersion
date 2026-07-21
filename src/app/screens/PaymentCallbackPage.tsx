import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
  'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';

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
            'http://185.222.163.113:7000/api/user/reservations/confirm',
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
          // سفارش / شارژ کیف پول — فعلاً شبیه‌سازی موفق
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

  return (
    <div className={pageClass}>
      <AppBar backTo={session?.returnPath || '/finance'} />

      <div className="mx-auto w-full max-w-lg px-3 pb-6 pt-24 sm:px-4" dir="rtl">
        <Card className="gap-0 rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          {state === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
              <h1 className="mt-4 text-lg font-bold text-gray-900">در حال تأیید پرداخت...</h1>
              <p className="mt-2 text-sm text-gray-500">لطفاً چند لحظه صبر کنید</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <h1 className="mt-4 text-lg font-bold text-gray-900">پرداخت با موفقیت انجام شد</h1>
              <p className="mt-2 text-sm text-gray-500">
                {session?.title ?? 'سفارش شما ثبت و پرداخت شد'}
              </p>

              <div className="mt-5 space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                {refId && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">شماره پیگیری</span>
                    <span className="font-bold" dir="ltr">
                      {refId}
                    </span>
                  </div>
                )}
                {authority && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Authority</span>
                    <span className="truncate font-mono text-xs" dir="ltr">
                      {authority}
                    </span>
                  </div>
                )}
                {gateway && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">درگاه</span>
                    <span>
                      {gateway.name}
                      {gateway.isSample ? ' (نمونه)' : ''}
                    </span>
                  </div>
                )}
                {amount > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">مبلغ</span>
                    <span className="font-bold">{formatPrice(amount)} تومان</span>
                  </div>
                )}
              </div>

              <Button type="button" onClick={goHome} className="mt-6 h-11 w-full">
                بازگشت
              </Button>
            </>
          )}

          {state === 'failed' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-9 w-9 text-red-600" />
              </div>
              <h1 className="mt-4 text-lg font-bold text-gray-900">پرداخت ناموفق بود</h1>
              <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
              <div className="mt-6 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(session?.returnPath || '/finance', { replace: true })}
                >
                  انصراف
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    if (session) {
                      // session cleared — user should re-enter from source
                      navigate(session.returnPath || '/finance', { replace: true });
                    } else {
                      navigate('/finance', { replace: true });
                    }
                  }}
                >
                  بازگشت
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
