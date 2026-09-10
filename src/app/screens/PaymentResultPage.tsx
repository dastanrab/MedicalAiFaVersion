import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowRight,
    RotateCcw,
    Receipt,
    Hash,
    Copy,
    Check
} from 'lucide-react';

export const PaymentResultPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [copied, setCopied] = React.useState(false);

    // استخراج پارامترهای ارسالی از سمت بک‌اند
    const status = searchParams.get('status'); // 'success' | 'failed' | 'error'
    const refNum = searchParams.get('ref_num') || '---';
    const resNum = searchParams.get('res_num') || '---';
    const errorMessage = searchParams.get('message') || 'تراکنش با خطا مواجه شد یا توسط کاربر لغو گردید.';

    const isSuccess = status === 'success';
    const isError = status === 'error' || status === 'failed' || !status;

    const handleCopyRefNum = () => {
        if (refNum && refNum !== '---') {
            navigator.clipboard.writeText(refNum);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const currentDate = useMemo(() => {
        return new Intl.DateTimeFormat('fa-IR', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date());
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans dir-rtl" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all">

                {/* هدر وضعیت */}
                <div className={`p-8 text-center ${isSuccess ? 'bg-emerald-50/80' : 'bg-rose-50/80'}`}>
                    <div className="flex justify-center mb-4">
                        {isSuccess ? (
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                                <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shadow-inner">
                                <XCircle className="w-12 h-12 stroke-[2.2]" />
                            </div>
                        )}
                    </div>

                    <h1 className={`text-2xl font-bold tracking-tight ${isSuccess ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {isSuccess ? 'پرداخت با موفقیت انجام شد' : 'پرداخت ناموفق بود'}
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        {isSuccess
                            ? 'تراکنش شما با موفقیت در سامانه ثبت و تایید گردید.'
                            : errorMessage}
                    </p>
                </div>

                {/* جزئیات رسید دیجیتال */}
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">

                        {/* شماره پیگیری بانکی (RefNum) */}
                        {isSuccess && (
                            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  شماره پیگیری بانک (RefNum)
                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-slate-800 text-base">{refNum}</span>
                                    <button
                                        onClick={handleCopyRefNum}
                                        title="کپی شماره پیگیری"
                                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* شماره سفارش سیستم (ResNum) */}
                        <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-slate-400" />
                شناسه سفارش (ResNum)
              </span>
                            <span className="font-mono font-medium text-slate-700">{resNum}</span>
                        </div>

                        {/* درگاه پرداخت */}
                        <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">درگاه پرداخت</span>
                            <span className="font-medium text-slate-700">بانک سامان (سپ)</span>
                        </div>

                        {/* زمان تراکنش */}
                        <div className="flex items-center justify-between text-sm py-1">
                            <span className="text-slate-500">زمان تراکنش</span>
                            <span className="text-slate-600 text-xs font-medium">{currentDate}</span>
                        </div>
                    </div>

                    {/* پیام هشدار برای تراکنش ناموفق */}
                    {isError && (
                        <div className="flex items-start gap-2 bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                            <span>
                اگر مبلغی از حساب شما کسر شده است، ظرف حداکثر ۷۲ ساعت آینده توسط بانک مبدا به حسابتان برگشت داده خواهد شد.
              </span>
                        </div>
                    )}

                    {/* دکمه‌های عملیاتی */}
                    <div className="pt-2 space-y-2">
                        {isSuccess ? (
                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <span>ورود به داشبورد</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>تلاش مجدد برای پرداخت</span>
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-sm"
                                >
                                    بازگشت به صفحه اصلی
                                </button>
                            </>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default PaymentResultPage;
