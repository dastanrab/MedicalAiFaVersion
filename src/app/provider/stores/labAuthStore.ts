// src/provider/stores/labAuthStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LabUser {
    name: string;
    phone?: string;
    avatar?: string | null;
    role?: string;
}

interface LabAuthState {
    token: string | null;
    lab: LabUser | null;
    setAuth: (token: string, lab: LabUser) => void;
    setLab: (lab: LabUser) => void;
    logout: () => void;
}

export const useLabAuthStore = create<LabAuthState>()(
    persist(
        (set) => ({
            token: null,
            lab: null,

            setAuth: (token, lab) => set({ token, lab }),

            setLab: (lab) => set({ lab }),

            logout: () => {
                set({ token: null, lab: null });
                window.location.href = '/provider/lab/login';
            },
        }),
        {
            name: 'lab-auth-storage',
            partialize: (state) => ({
                token: state.token,
                lab: state.lab,
            }),
        }
    )
);
