import React, { useState } from 'react';
import { ShieldAlert, CreditCard, Loader2, LogOut } from 'lucide-react';
import { useDoctorAuthStore } from '../store/doctorAuthStore';

export function DoctorSubscriptionFeePage() {
    const { token, logout } = useDoctorAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('https://api.mediraai.com/api/doctor/pay-subscription-fee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (res.ok && data.success && data.data?.payment_url) {
                window.location.href = data.data.payment_url;
            } else {
                setError(data.message || 'خطا در اتصال به درگاه.');
            }
        } catch (err) {
            setError('خطا در برقراری ارتباط با سرور.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 " dir="rtl">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8" />
                </div>

                <h1 className="text-xl font-bold text-slate-800">تکمیل ثبت‌نام و فعال‌سازی پنل</h1>

                <p className="text-sm text-slate-600 leading-relaxed">
                    پزشک گرامی، برای دسترسی به پنل مدیریت نوبت‌ها، کیف پول و سایر امکانات سامانه، نیاز است حق اشتراک عضویت را پرداخت نمایید.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-slate-600 text-sm font-medium">مبلغ قابل پرداخت:</span>
                    <span className="text-lg font-bold text-blue-700">390,000 تومان</span>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                        {loading ? 'در حال انتقال...' : 'پرداخت و ورود به پنل'}
                    </button>

                    <button
                        onClick={() => logout()}
                        className="w-full h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-medium rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        خروج از حساب کاربری
                    </button>
                </div>
            </div>
        </div>
    );
}