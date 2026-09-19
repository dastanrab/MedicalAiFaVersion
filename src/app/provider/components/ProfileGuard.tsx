import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router'; // برای تشخیص تغییر مسیرها
import { useDoctorAuthStore } from '../doctor/store/doctorAuthStore';
import { useProviderAuthStore } from '../store/providerAuthStore';
import type { ProviderRole } from '../config/providerNav';
import {AppRole, fetchWithAuth} from "../utils/apiClient";
import { PanelPageSkeleton } from '../../components/PageSkeleton';

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
                    doctor: 'https://api.mediraai.com/api/doctor/profile',
                    lab: 'https://api.mediraai.com/api/owner/lab/profile',
                    pharmacy: 'https://api.mediraai.com/api/owner/pharmacy/profile',
                    nurse: 'https://api.mediraai.com/api/owner/medical-center/profile',
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
            <div className="h-screen w-full overflow-y-auto bg-gray-50/50 p-6">
                <PanelPageSkeleton />
            </div>
        );
    }

    return <>{children}</>;
}
