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
    logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            token: null,
            admin: null,

            setAuth: (token, admin) => set({ token, admin }),

            setAdmin: (admin) => set({ admin }),

            logout: () => {
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
