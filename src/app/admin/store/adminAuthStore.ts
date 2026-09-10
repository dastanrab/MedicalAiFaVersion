import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
    name: string;
    avatar?: string | null;
    role?: string;
}

interface AdminAuthState {
    token: string | null;
    admin: AdminUser | null;
    setAuth: (token: string, admin: AdminUser) => void;
    setAdmin: (admin: AdminUser) => void;
    logout: () => Promise<void>; // نوع بازگشتی به Promise<void> تغییر یافت
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        // متد get برای دسترسی به استیت فعلی اضافه شد
        (set, get) => ({
            token: null,
            admin: null,

            setAuth: (token, admin) => set({ token, admin }),

            setAdmin: (admin) => set({ admin }),

            logout: async () => {
                // ۱. دریافت توکن فعلی ادمین
                const currentToken = get().token;

                // ۲. ارسال درخواست خروج به سرور در صورت وجود توکن
                if (currentToken) {
                    try {
                        await fetch('http://185.222.163.113:7000/api/logout-all', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${currentToken}`,
                                'Accept': 'application/json',
                                // اگر سرور انتظار Content-Type خاصی دارد، می‌توانید اضافه کنید
                                // 'Content-Type': 'application/json',
                            },
                        });
                    } catch (error) {
                        // ثبت خطای شبکه یا سرور در کنسول (جهت دیباگ)
                        console.error('Admin logout API failed:', error);
                    }
                }

                // ۳. پاک‌سازی استیت کلاینت و هدایت به صفحه ورود (بدون توجه به موفقیت یا شکست API)
                set({ token: null, admin: null });
                window.location.href = '/admin/login';
            },
        }),
        {
            name: 'admin-auth-storage',
            partialize: (state) => ({
                token: state.token,
                admin: state.admin,
            }),
        }
    )
);
