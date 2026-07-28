import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const API_BASE_URL = "http://185.222.163.113:7000/api/user";

export default function PartnerJoin() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('در حال بررسی کد دعوت پارتنر...');

    const [partnerCode] = useState(code || localStorage.getItem('pending_partner_invite_code') || '');

    const connectToPartner = useCallback(async (inviteCode: string) => {
        try {
            setStatus('loading');

            const res = await fetch(`${API_BASE_URL}/period-tracker/partner/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ partner_code: inviteCode }),
            });

            const result = await res.json();

            if (res.ok && result.status) {
                setStatus('success');
                setMessage(result.message || 'اتصال با پارتنر با موفقیت برقرار شد.');
                localStorage.removeItem('pending_partner_invite_code');
            } else {
                setStatus('error');
                setMessage(result.message || 'خطا در برقراری ارتباط با پارتنر.');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage('اتصال به سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید.');
        }
    }, [accessToken]);

    useEffect(() => {
        if (!partnerCode) {
            setStatus('error');
            setMessage('کد دعوت معتبری یافت نشد.');
            return;
        }

        if (!accessToken) {
            localStorage.setItem('pending_partner_invite_code', partnerCode);
            setStatus('error');
            setMessage('شما وارد حساب کاربری خود نشده‌اید. در حال هدایت به صفحه ورود...');

            const timer = setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);

            return () => clearTimeout(timer);
        }

        connectToPartner(partnerCode);
    }, [partnerCode, accessToken, navigate, connectToPartner]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-[#FFF9FA] px-6 text-right font-[YekanBakhFaNum]" dir="rtl">
            <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center py-6">
                        <Loader2 className="mb-4 h-12 w-12 animate-spin text-pink-500" />
                        <h3 className="text-lg font-bold text-gray-800">لطفاً منتظر بمانید</h3>
                        <p className="mt-2 text-sm text-gray-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center py-6 animate-in zoom-in-95 duration-300">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">عملیات موفقیت‌آمیز بود</h3>
                        <p className="mt-2 px-4 text-sm leading-relaxed text-gray-500">{message}</p>

                        <Button
                            onClick={() => navigate('/home')}
                            className="mt-8 h-12 w-full rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 font-bold text-white shadow-md shadow-pink-200"
                        >
                            ورود به داشبورد
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center py-6 animate-in zoom-in-95 duration-300">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                            <AlertCircle className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">توجه</h3>
                        <p className="mt-2 px-4 text-sm leading-relaxed text-gray-500">{message}</p>

                        {!accessToken ? (
                            <Button
                                onClick={() => navigate('/login')}
                                className="mt-8 h-12 w-full rounded-2xl bg-pink-600 font-bold text-white hover:bg-pink-700"
                            >
                                ورود / ثبت‌نام در سامانه
                            </Button>
                        ) : (
                            <Button
                                onClick={() => navigate('/home')}
                                variant="outline"
                                className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-pink-200 text-pink-600 hover:bg-pink-50"
                            >
                                <ArrowRight className="h-4 w-4" />
                                بازگشت به صفحه اصلی
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
