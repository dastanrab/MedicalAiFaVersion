import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockDoctorProfile } from '../data/mockDoctorData';

export interface DoctorUser {
    id: string;
    name: string;
    email: string;
    specialty: string;
    medicalCode: string;
    rating: number;
    avatar?: string | null;
}

const MOCK_CREDENTIALS = {
    username: 'doctor@test.com',
    password: '123456',
};

interface DoctorAuthState {
    doctor: DoctorUser | null;
    token: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useDoctorAuthStore = create<DoctorAuthState>()(
    persist(
        (set, get) => ({
            doctor: null,
            token: null,

            login: async (username, password) => {
                // TODO: جایگزینی با API واقعی احراز هویت پزشک
                await new Promise((r) => setTimeout(r, 500));

                const normalized = username.trim().toLowerCase();
                if (
                    normalized !== MOCK_CREDENTIALS.username ||
                    password !== MOCK_CREDENTIALS.password
                ) {
                    return false;
                }

                const token = `doctor-token-${Date.now()}`;
                set({
                    token,
                    doctor: {
                        id: mockDoctorProfile.id,
                        name: mockDoctorProfile.name,
                        email: MOCK_CREDENTIALS.username,
                        specialty: mockDoctorProfile.specialty,
                        medicalCode: mockDoctorProfile.medicalCode,
                        rating: mockDoctorProfile.rating,
                    },
                });
                return true;
            },

            logout: () => {
                set({ doctor: null, token: null });
                window.location.href = '/provider/doctor/login';
            },

            isAuthenticated: () => Boolean(get().token),
        }),
        {
            name: 'doctor-auth-storage',
            partialize: (state) => ({ doctor: state.doctor, token: state.token }),
        }
    )
);
