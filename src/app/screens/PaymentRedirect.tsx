import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Skeleton } from '../components/ui/skeleton';

interface PaymentResponse {
    success: boolean;
    payment_id: number;
    payment_url: string;
    res_num: string;
}

interface PaymentPageProps {
    orderId?: number;
    token?: string; // توکن Bearer لاگین کاربر
}

export const PaymentRedirect: React.FC<PaymentPageProps> = ({
                                                                orderId = 100,
                                                                token = '276|sHKhAKXkzWOASvZjjcA8ArCPkA7Nlp2tbKsGfZs8JKeUQSEo4dHZMGeBE0SJ5JzTtgLzrbc7csprCbILaC9hNa0s6ym8PzFrUGBE',
                                                            }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * تابع ایجاد و ارسال فرم POST به درگاه سپ
     * برای جلوگیری از خطای "آدرس ارجاع دهنده دریافت نشد"
     */
    const submitFormToSep = (paymentUrl: string) => {
        try {
            // استخراج Token از انتهای payment_url
            const url = new URL(paymentUrl);
            const sepToken = url.searchParams.get('token') || '';

            // ساخت فرم مخفی در DOM
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://sep.shaparak.ir/OnlinePG/OnlinePG';

            // فیلد Token
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'Token';
            tokenInput.value = sepToken;
            form.appendChild(tokenInput);

            // در صورت نیاز به تعیین متد برگشت به صورت GET
            const getMethodInput = document.createElement('input');
            getMethodInput.type = 'hidden';
            getMethodInput.name = 'GetMethod';
            getMethodInput.value = 'true';
            form.appendChild(getMethodInput);

            document.body.appendChild(form);
            form.submit();
        } catch (e) {
            // اگر در تجزیه URL خطایی بود، مستقیم هدایت شود
            window.location.href = paymentUrl;
        }
    };

    const handleInitiatePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post<PaymentResponse>(
                'http://api.mediraai.com/api/payments/initiate',
                {
                    order_id: orderId,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.success && response.data.payment_url) {
                // هدایت کاربر به درگاه سپ با متد POST
                submitFormToSep(response.data.payment_url);
            } else {
                setError('خطا در دریافت اطلاعات درگاه پرداخت.');
                setLoading(false);
            }
        } catch (err: any) {
            const errorMsg =
                err.response?.data?.message ||
                'برقراری ارتباط با سرور پرداخت با خطا مواجه شد.';
            setError(errorMsg);
            setLoading(false);
        }
    };

    // اگر می‌خواهید به محض ورود به صفحه پرداخت شروع شود:
    useEffect(() => {
        handleInitiatePayment();
    }, [orderId]);

    return (
        <div
            dir="rtl"
            className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans"
        >
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                {/* حالت لودینگ */}
                {loading && (
                    <div className="space-y-5">
                        <div className="relative flex justify-center items-center">
                            <Skeleton className="h-16 w-16 rounded-2xl bg-blue-100" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                در حال انتقال به درگاه پرداخت...
                            </h2>
                            <p className="text-sm text-gray-500 mt-2">
                                لطفاً شکیبا باشید، در حال اتصال به سامانه پرداخت اینترنتی سامان (سپ).
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                            سفارش شماره: <span className="font-semibold">{orderId}</span>
                        </div>
                    </div>
                )}

                {/* حالت خطا */}
                {error && !loading && (
                    <div className="space-y-5">
                        <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                            ✕
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-red-600">
                                خطا در پردازش پرداخت
                            </h2>
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={handleInitiatePayment}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition duration-200 shadow-md"
                        >
                            تلاش مجدد
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentRedirect;
