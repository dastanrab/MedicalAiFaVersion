import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProviderRole, NurseAccountType } from '../config/providerNav';

export interface ProviderUser {
    phone: string;
    name: string;
    avatar?: string | null;
    /** نوع حساب پرستار: مستقل یا شرکت */
    nurseAccountType?: NurseAccountType;
}

export interface ProviderSession {
    token: string;
    user: ProviderUser;
}

interface ProviderAuthState {
    sessions: Partial<Record<ProviderRole, ProviderSession>>;
    setAuth: (role: ProviderRole, token: string, user: ProviderUser) => void;
    logout: (role: ProviderRole) => void;
    getSession: (role: ProviderRole) => ProviderSession | null;
}

export const useProviderAuthStore = create<ProviderAuthState>()(
    persist(
        (set, get) => ({
            sessions: {},

            setAuth: (role, token, user) =>
                set((state) => ({
                    sessions: { ...state.sessions, [role]: { token, user } },
                })),

            logout: (role) => {
                set((state) => {
                    const next = { ...state.sessions };
                    delete next[role];
                    return { sessions: next };
                });
                window.location.href = `/provider/${role}/login`;
            },

            getSession: (role) => get().sessions[role] ?? null,
        }),
        {
            name: 'provider-auth-storage',
            partialize: (state) => ({ sessions: state.sessions }),
        }
    )
);

export function useProviderSession(role: ProviderRole) {
    return useProviderAuthStore((s) => s.sessions[role] ?? null);
}

export function useNurseAccountType(): NurseAccountType {
    return useProviderAuthStore(
        (s) => s.sessions.nurse?.user.nurseAccountType ?? 'individual'
    );
}

export function useIsProviderAuthenticated(role: ProviderRole) {
    return useProviderAuthStore((s) => Boolean(s.sessions[role]?.token));
}
