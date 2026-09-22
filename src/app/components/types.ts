export interface DoctorData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    gender: number;
    specialty_id: number;
    specialty_name: string;
    visit_price: number;
    experience: string;
    address: string;
    rating: string;
    visit_count: number;
    image_url: string;
    is_vip: boolean;
    bio: string;
    lat: number | null;
    lng: number | null;
    appointments: number;
    medical_code: string | null;
    rank: number | null;
    reviews: number;
    recommendation: number;
    city: string | null;
    province: string | null;
    tags: string[];
}

export interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    datetime: string;
    status: string;
    is_my_temp_reservation?: boolean;
    temp_order_id?: number;
    expires_at?: string;
}

export interface UserProfile {
    id: number;
    name: string;
    phone: string;
    national_code?: string;
}

export interface ApiResponse {
    success: boolean;
    data: {
        doctor: DoctorData;
        available_slots: Record<string, TimeSlot[]>;
        stats: {
            total_slots: number;
            available_days: number;
            date_range: { start: string; end: string };
        };
    };
}

export interface OtherPatient {
    fullName: string;
    nationalCode: string;
    phone: string;
}

export type ViewState = 'profile' | 'patient_info' | 'payment';
export type Gateway = 'saman' | 'zarinpal';