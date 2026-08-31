import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router'; // برای تشخیص تغییر مسیرها
import { useDoctorAuthStore } from '../doctor/store/doctorAuthStore';
import { useProviderAuthStore } from '../store/providerAuthStore';
import type { ProviderRole } from '../config/providerNav';
import {AppRole, fetchWithAuth} from "../utils/apiClient";

interface ProfileGuardProps {
    role: ProviderRole;
    children: React.ReactNode;
}

export function ProfileGuard({ role, children }: ProfileGuardProps) {
    const [isReady, setIsReady] = useState(false);
    const location = useLocation();

    // دریافت توکن‌ها از استورها
    const doctorToken = useDoctorAuthStore((state) => state.token);
    const providerSessions = useProviderAuthStore((state) => state.sessions);
    const providerToken = providerSessions[role]?.token;

    // توابع ذخیره پروفایل (باید در استورهای شما تعریف شده باشند)
    const setDoctorProfile = useDoctorAuthStore((state) => state.setProfile);
    const setProviderProfile = useProviderAuthStore((state) => state.setProfile);

    useEffect(() => {
        let isMounted = true;

        const fetchProfileData = async () => {
            const token = role === 'doctor' ? doctorToken : providerToken;

            // اگر توکنی وجود نداشت، مستقیماً لاگ‌اوت کن
            if (!token) {
                if (role === 'doctor') {
                    useDoctorAuthStore.getState().logout();
                    window.location.href = '/provider/doctor/login';
                } else {
                    useProviderAuthStore.getState().logout(role);
                    window.location.href = `/provider/${role}/login`;
                }
                return;
            }

            try {
                // آدرس‌های API بر اساس نقش کاربر (در صورت نیاز این آدرس‌ها را با بک‌اند خود تطبیق دهید)
                const apiEndpoints: Record<ProviderRole, string> = {
                    doctor: 'http://185.222.163.113:7000/api/doctor/profile',
                    lab: 'http://185.222.163.113:7000/api/owner/lab/profile',
                    pharmacy: 'http://185.222.163.113:7000/api/owner/pharmacy/profile',
                    nurse: 'http://185.222.163.113:7000/api/medical-center/profile',
                };

                // استفاده از fetch wrapper هوشمند که قبلاً ساختیم
                const response = await fetchWithAuth(apiEndpoints[role], {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    }
                }, role as AppRole);

                const data = await response.json();

                if (response.ok && data.status === true) {
                    // ذخیره پروفایل جدید در استور
                    if (role === 'doctor' && setDoctorProfile) {
                        setDoctorProfile(data.data);
                    } else if (setProviderProfile) {
                        setProviderProfile(role, data.data);
                    }
                }
            } catch (error: any) {
                // خطای UNAUTHORIZED توسط fetchWithAuth مدیریت و ریدایرکت می‌شود.
                // در اینجا فقط خطاهای دیگر (مثل قطعی اینترنت) را لاگ می‌کنیم.
                if (error.message !== 'UNAUTHORIZED') {
                    console.error('خطا در دریافت پروفایل:', error);
                }
            } finally {
                if (isMounted) {
                    setIsReady(true);
                }
            }
        };

        fetchProfileData();

        return () => {
            isMounted = false;
        };
    }, [role, doctorToken, providerToken]);
    // نکته حرفه‌ای: اگر می‌خواهید با هر کلیک و تغییر Route پروفایل آپدیت شود،
    // `location.pathname` را به آرایه وابستگی‌های بالا اضافه کنید.
    // اما معمولاً برای جلوگیری از اسپم شدن بک‌اند، فقط در زمان Mount شدن کامپوننت چک می‌کنند.

    // تا زمانی که وضعیت بررسی نشده، کامپوننت‌های داخلی را رندر نکن و لودینگ نشان بده
    if (!isReady) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center gap-3">
                    {/* می‌توانید از کامپوننت Spinner اختصاصی خودتان استفاده کنید */}
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="text-sm font-medium text-gray-600">در حال احراز هویت...</span>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
