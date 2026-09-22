import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import {useDoctorAuthStore} from "../store/doctorAuthStore"; // برای آیکون لودینگ

interface Props {
    children: React.ReactNode;
    role: string;
}

export function SubscriptionGuard({ children, role }: Props) {
    const { doctor, fetchProfile } = useDoctorAuthStore();
    const location = useLocation();

    console.log('start check',doctor)
    // اگر فیلد اشتراک undefined باشد یعنی هنوز پروفایل کامل گرفته نشده است
    const [isLoading, setIsLoading] = useState(doctor?.has_paid_subscription === undefined);

    useEffect(() => {
        // اگر دیتا ناقص بود، پروفایل را فچ کن و بعد اجازه بررسی بده
        if (role === 'doctor' && doctor) {
            fetchProfile().finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);
  console.log(doctor,role)
    // اگر نقش پزشک نیست یا اصلاً لاگین نکرده، گارد کاری ندارد
    if (role !== 'doctor' || !doctor) {
        return <>{children}</>;
    }

    // تا زمانی که دیتا کامل نشده، منتظر بمان
    if (isLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 font-medium">در حال بررسی وضعیت حساب...</p>
            </div>
        );
    }

    // حالا که دیتا قطعی است، بررسی می‌کنیم
    // (با Boolean تبدیل می‌کنیم تا 0 به false و 1 به true تبدیل شود)
    const hasPaid = Boolean(doctor.has_paid_subscription);

    // اگر پزشک پرداخت نکرده است و در مسیر پرداخت نیست
    if (!hasPaid && !location.pathname.includes('/subscription-fee')) {
        return <Navigate to="/provider/doctor/subscription-fee" replace />;
    }

    // اگر پزشک پرداخت کرده ولی دستی آدرس پرداخت را می‌زند، او را به داشبورد بفرست
    if (hasPaid && location.pathname.includes('/subscription-fee')) {
        return <Navigate to="/provider/doctor/dashboard" replace />;
    }

    return <>{children}</>;
}