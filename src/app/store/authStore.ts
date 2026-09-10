import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    accessToken: string | null;
    user: any | null;
    setTokens: (accessToken: string) => void;
    setUser: (user: any) => void;
    logout: () => Promise<void>; // تغییر تایپ به Promise<void> به دلیل استفاده از async
    updateAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        // اضافه کردن `get` برای دسترسی به استیت‌های فعلی داخل اکشن‌ها
        (set, get) => ({
            accessToken: null,
            user: null,

            setTokens: (accessToken) =>
                set({ accessToken }),

            setUser: (user) => set({ user }),

            logout: async () => {
                const token = get().accessToken;

                // اگر توکنی وجود دارد، درخواست لاگ‌اوت را به سرور می‌فرستیم
                if (token) {
                    try {
                        await fetch('http://185.222.163.113:7000/api/logout-all', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` // ارسال توکن برای احراز هویت درخواست
                            }
                        });
                    } catch (error) {
                        // در صورت قطعی اینترنت یا در دسترس نبودن سرور، خطا را لاگ می‌کنیم
                        // اما فرآیند پاک کردن کش محلی را متوقف نمی‌کنیم
                        console.error('Failed to logout from server:', error);
                    }
                }

                // در هر صورت (چه سرور موفقیت‌آمیز جواب دهد چه نه)، اطلاعات کاربر را از کلاینت پاک می‌کنیم
                set({ accessToken: null, user: null });
                window.location.href = '/login';
            },

            updateAccessToken: (accessToken) => set({ accessToken }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                accessToken: state.accessToken,
                user: state.user,
            }),
        }
    )
);
