import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
  TicketPercent,
  X,
} from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  calcDiscountAmount,
  findDiscountCode,
  paymentGateways,
  type PaymentGatewayId,
  type SampleDiscountCode,
} from '../data/paymentGateways';
import { formatPrice } from '../data/userFinanceMockData';
import {
  createMockAuthority,
  loadCheckoutSession,
  type CheckoutSession,
} from '../lib/checkoutSession';

const pageClass =
  'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';

function AmountWithToman({
  amount,
  prefix = '',
  amountClassName = 'font-bold text-gray-900',
  tomanClassName = 'text-[11px] font-normal text-gray-500',
}: {
  amount: number | string;
  prefix?: string;
  amountClassName?: string;
  tomanClassName?: string;
}) {
  const value = typeof amount === 'number' ? formatPrice(amount) : amount;
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={amountClassName}>
        {prefix}
        {value}
      </span>
      <span className={tomanClassName}>تومان</span>
    </span>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [gatewayId, setGatewayId] = useState<PaymentGatewayId>('mellat');
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<SampleDiscountCode | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const loaded = loadCheckoutSession();
    if (!loaded) {
      navigate('/finance', { replace: true });
      return;
    }
    setSession(loaded);
  }, [navigate]);

  const discountAmount = useMemo(() => {
    if (!session || !appliedDiscount) return 0;
    return calcDiscountAmount(session.amount, appliedDiscount);
  }, [session, appliedDiscount]);

  const payable = session ? Math.max(0, session.amount - discountAmount) : 0;

  const applyCoupon = () => {
    setCouponError(null);
    const found = findDiscountCode(couponInput);
    if (!found) {
      setAppliedDiscount(null);
      setCouponError('کد تخفیف معتبر نیست');
      return;
    }
    if (!session || calcDiscountAmount(session.amount, found) <= 0) {
      setAppliedDiscount(null);
      setCouponError('این کد برای این مبلغ قابل استفاده نیست');
      return;
    }
    setAppliedDiscount(found);
    setCouponInput(found.code);
  };

  const removeCoupon = () => {
    setAppliedDiscount(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handlePay = () => {
    if (!session || isPaying) return;
    setIsPaying(true);

    const authority = createMockAuthority(gatewayId);
    const params = new URLSearchParams({
      status: 'OK',
      authority,
      gateway: gatewayId,
      amount: String(payable),
      discount: String(discountAmount),
      coupon: appliedDiscount?.code ?? '',
    });

    window.setTimeout(() => {
      navigate(`/payment/callback?${params.toString()}`, { replace: true });
    }, 1200);
  };

  if (!session) {
    return (
      <div className={pageClass}>
        <AppBar backTo="/finance" />
        <div className="flex min-h-[50vh] items-center justify-center pt-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <AppBar backTo={session.returnPath || '/finance'} />

      <div className="mx-auto w-full max-w-lg px-3 pb-6 pt-24 sm:px-4" dir="rtl">
        <header className="mb-4">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
            <CreditCard className="h-3 w-3" />
            پرداخت آنلاین
          </p>
          <h1 className="mt-2 text-xl font-bold text-gray-900">تکمیل پرداخت</h1>
          <p className="mt-1 text-sm text-gray-500">مبلغ، کد تخفیف و درگاه بانکی را بررسی کنید</p>
        </header>

        <Card className="mb-3 gap-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {session.serviceTypeLabel && (
                <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {session.serviceTypeLabel}
                </span>
              )}
              <h2 className="mt-2 text-sm font-bold text-gray-900">{session.title}</h2>
              {session.providerName && (
                <p className="mt-1 text-xs text-gray-500">{session.providerName}</p>
              )}
              {session.subtitle && (
                <p className="mt-1 text-xs text-gray-500">{session.subtitle}</p>
              )}
              {session.slotLabel && (
                <p className="mt-1 text-xs text-blue-600">{session.slotLabel}</p>
              )}
              {session.orderCode && (
                <p className="mt-2 text-[11px] text-gray-400">کد سفارش: {session.orderCode}</p>
              )}
            </div>
            <div className="shrink-0 text-left">
              <p className="text-[11px] text-gray-400">مبلغ</p>
              <AmountWithToman
                amount={session.amount}
                amountClassName="text-sm font-bold text-gray-900"
                tomanClassName="text-[10px] font-normal text-gray-400"
              />
            </div>
          </div>
        </Card>

        <Card className="mb-3 gap-0 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50/80 to-white p-0 shadow-sm">
          <div className="flex items-center gap-2 border-b border-blue-100/80 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <TicketPercent className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">کد تخفیف</h3>
              <p className="text-[11px] text-gray-500">در صورت داشتن کد، اینجا وارد کنید</p>
            </div>
          </div>

          <div className="px-4 py-3">
            {appliedDiscount ? (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 ring-1 ring-blue-200">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-blue-900" dir="ltr">
                    {appliedDiscount.code}
                  </p>
                  <p className="text-[11px] text-blue-700">{appliedDiscount.description}</p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  disabled={isPaying}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-blue-700 transition hover:bg-blue-100"
                  aria-label="حذف کد تخفیف"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <TicketPercent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
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
                    placeholder="کد تخفیف را وارد کنید"
                    disabled={isPaying}
                    className="h-11 w-full rounded-xl border border-blue-200 bg-white pr-10 pl-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                    dir="rtl"
                  />
                </div>
                <Button
                  type="button"
                  onClick={applyCoupon}
                  disabled={!couponInput.trim() || isPaying}
                  className="h-11 shrink-0 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  اعمال
                </Button>
              </div>
            )}
            {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
          </div>
        </Card>

        <Card className="mb-3 gap-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">انتخاب درگاه بانکی</h3>
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
                      ? `border-transparent bg-blue-50/80 ring-2 ${gateway.selectedRingClass}`
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-gray-100">
                    <img
                      src={gateway.logo}
                      alt={gateway.name}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900">{gateway.name}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500">{gateway.description}</p>
                  </div>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="mb-4 gap-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>مبلغ سفارش</span>
              <AmountWithToman
                amount={session.amount}
                amountClassName="font-bold text-gray-800"
                tomanClassName="text-[11px] font-normal text-gray-500"
              />
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>تخفیف</span>
              <AmountWithToman
                amount={discountAmount > 0 ? formatPrice(discountAmount) : '۰'}
                prefix={discountAmount > 0 ? '−' : ''}
                amountClassName={`font-bold ${discountAmount > 0 ? 'text-emerald-600' : 'text-gray-800'}`}
                tomanClassName="text-[11px] font-normal text-gray-500"
              />
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
              <span className="text-base font-bold text-gray-900">مبلغ قابل پرداخت</span>
              <AmountWithToman
                amount={payable}
                amountClassName="text-base font-bold text-gray-900"
                tomanClassName="text-[11px] font-normal text-gray-500"
              />
            </div>
          </div>
        </Card>

        <div className="mb-3 flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            درگاه‌های ملت و سامان فعلاً به‌صورت نمایشی هستند. با زدن دکمه پرداخت، شبیه‌سازی بازگشت از بانک انجام می‌شود.
          </p>
        </div>

        <Button
          type="button"
          onClick={handlePay}
          disabled={isPaying || payable < 0}
          className="h-12 w-full bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700"
        >
          {isPaying ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              در حال اتصال به درگاه...
            </>
          ) : (
            <>
              <CreditCard className="ml-2 h-5 w-5" />
              <span className="inline-flex items-baseline gap-1">
                <span>پرداخت آنلاین — {formatPrice(payable)}</span>
                <span className="text-xs font-normal opacity-90">تومان</span>
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
