import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    accessToken: string | null;
    user: any | null;
    setTokens: (accessToken: string) => void;
    setUser: (user: any) => void;
    logout: () => void;
    updateAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,

            setTokens: (accessToken) =>
                set({ accessToken }),

            setUser: (user) => set({ user }),

            logout: () => {
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
