import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = 'http://185.222.163.113:7000/api';

export interface DoctorUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: number;           // 0: male, 1: female
    avatar: string | null;
    is_verify: number;        // 0 | 1
    status: number;           // 0 | 1
    role: string;
    province_id: number;
    city_id: number;
    // --- فیلدهای زیر از profile endpoint می‌آن ---
    office_phone?: string;
    image_url?: string | null;
    is_vip?: boolean;
    bio?: string;
    specialty?: string;
    visit_price?: number;
    experience?: string;
    address?: string;
    province?: string;
    city?: string;
    visit_count?: number;
    rating?: number;
    medical_code?: string;
}

// ساختار واقعی ریسپانس login
interface LoginApiResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            avatar: string | null;
            phone: string;
            gender: number;
            is_verify: number;
            status: number;
            province_id: number;
            city_id: number;
        };
        token: string;
    };
}

// --- ساختار profile endpoint هنوز مشخص نیست؛ بعد از دیدن ریسپانس اصلاح کن ---
interface ProfileApiResponse {
    success: boolean;
    data: Partial<DoctorUser>;
}

interface DoctorAuthState {
    doctor: DoctorUser | null;
    token: string | null;
    login: (mobile: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: () => boolean;
    fetchProfile: () => Promise<void>;
}

export const useDoctorAuthStore = create<DoctorAuthState>()(
    persist(
        (set, get) => ({
            doctor: null,
            token: null,

            login: async (mobile, password) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/doctor/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({ mobile, password }),
                    });

                    const data: LoginApiResponse = await response.json();

                    if (!response.ok || !data.success) {
                        return false;
                    }

                    const { user, token } = data.data;

                    set({
                        token,
                        doctor: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            gender: user.gender,
                            avatar: user.avatar,
                            is_verify: user.is_verify,
                            status: user.status,
                            role: user.role,
                            province_id: user.province_id,
                            city_id: user.city_id,},
                    });

                    await get().fetchProfile();
                    return true;
                } catch (error) {
                    console.error('Login failed:', error);
                    return false;
                }
            },

            fetchProfile: async () => {
                const token = get().token;
                if (!token) return;

                try {
                    const response = await fetch(`${API_BASE_URL}/doctor/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    });

                    if (!response.ok) return;

                    // --- ساختار دقیق این endpoint رو بعد از تست جایگزین کن ---
                    const data: ProfileApiResponse = await response.json();
                    if (data.success && data.data) {
                        set((state) => ({
                            doctor: state.doctor
                                ? { ...state.doctor, ...data.data }
                                : null,
                        }));
                    }
                } catch (error) {
                    console.error('Fetch profile failed:', error);
                }
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
