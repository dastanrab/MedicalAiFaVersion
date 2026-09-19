import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ArrowRight, Home, RotateCcw } from 'lucide-react';
import {
  PaymentStatusView,
  paymentActionClass,
  type PaymentDetailRow,
} from '../components/PaymentStatusView';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status'); // 'success' | 'failed' | 'error'
  const refNum = searchParams.get('ref_num') || '---';
  const resNum = searchParams.get('res_num') || '---';
  const errorMessage =
    searchParams.get('message') || 'تراکنش با خطا مواجه شد یا توسط کاربر لغو گردید.';

  const isSuccess = status === 'success';

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date());
  }, []);

  const details = useMemo(() => {
    const rows: PaymentDetailRow[] = [];
    if (isSuccess && refNum && refNum !== '---') {
      rows.push({
        label: 'شماره پیگیری بانک',
        value: refNum,
        mono: true,
        copyValue: refNum,
        emphasize: true,
      });
    }
    rows.push({ label: 'شناسه سفارش', value: resNum, mono: true });
    rows.push({ label: 'درگاه پرداخت', value: 'بانک سامان (سپ)' });
    rows.push({ label: 'زمان تراکنش', value: currentDate });
    return rows;
  }, [currentDate, isSuccess, refNum, resNum]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#e0f2fe_0%,_#f8fafc_42%,_#ffffff_100%)] p-4 font-[YekanBakhFaNum]"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {isSuccess ? (
          <PaymentStatusView
            status="success"
            title="پرداخت با موفقیت انجام شد"
            subtitle="تراکنش شما با موفقیت در سامانه ثبت و تأیید شد."
            details={details}
            primaryAction={
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className={paymentActionClass.success}
              >
                ورود به داشبورد
                <ArrowRight className="h-4 w-4" />
              </button>
            }
          />
        ) : (
          <PaymentStatusView
            status="failed"
            title="پرداخت ناموفق بود"
            subtitle={errorMessage}
            details={details}
            notice="اگر مبلغی از حساب شما کسر شده است، ظرف حداکثر ۷۲ ساعت آینده توسط بانک مبدأ به حسابتان برگشت داده خواهد شد."
            primaryAction={
              <button type="button" onClick={() => navigate('/')} className={paymentActionClass.danger}>
                <RotateCcw className="h-4 w-4" />
                تلاش مجدد برای پرداخت
              </button>
            }
            secondaryAction={
              <button type="button" onClick={() => navigate('/')} className={paymentActionClass.secondary}>
                <Home className="h-4 w-4" />
                بازگشت به صفحه اصلی
              </button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
