// stores/useUserStore.ts
import { create } from "zustand";
import { useAuthStore } from "./authStore";

interface User {
    id: number;
    name: string;
    email: string;
    is_verify: boolean;
    [key: string]: any;
}

interface UserState {
    user: User | null;
    isVerified: boolean | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: (force?: boolean) => Promise<void>;
    clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isVerified: null,
    isLoading: false,
    error: null,

    fetchProfile: async (force = false) => {
        const { user, isLoading } = get();

        if (!force && (user || isLoading)) return;

        const { accessToken, logout } = useAuthStore.getState();
        if (!accessToken) return;

        set({ isLoading: true, error: null });

        try {
            const response = await fetch(
                "http://185.222.163.113:7000/api/user/profile",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    set({ user: null, isVerified: null });
                    return;
                }
                throw new Error("خطا در دریافت اطلاعات");
            }

            const data = await response.json();

            if (data.success) {
                const user: User = data.data.user;

                set({
                    user,
                    isVerified: user.is_verify,
                });
            }
        } catch (error: any) {
            console.error("Profile fetch error:", error);
            set({ error: error.message, user: null });
        } finally {
            set({ isLoading: false });
        }
    },

    clearUser: () =>
        set({
            user: null,
            isVerified: null,
            error: null,
            isLoading: false,
        }),
}));
