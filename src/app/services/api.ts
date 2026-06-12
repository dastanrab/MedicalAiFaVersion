// src/services/api.ts
const API_BASE_URL = 'http://185.222.163.113:7000/api';

// تابع برای دریافت توکن از store
let getAccessToken: () => string | null = () => null;

// تابع برای تنظیم getter توکن
export function setTokenGetter(tokenGetter: () => string | null) {
    getAccessToken = tokenGetter;
}

// تابع کمکی برای ایجاد هدرها
function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const token = getAccessToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// ==================== انواع داده‌ها ====================

export interface ApiResponse<T> {
    data: T;
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface ApiChatRoom {
    patient_id: number;
    patient_name: string;
    room_id: number;
    status: number; // 1 = open, 0 = closed
    chat_name: string;
    last_message: string | null;
    last_message_at: string | null;
    opponent_id: number;
    role: 'doctor' | 'support';
    opponent_name: string;
    phone: string;
}

export interface ApiChatDetails {
    messages: Array<{
        id: number;
        sender: 'user' | 'doctor' | 'system';
        sender_name: string;
        message: string;
        sent_at: string;
        is_sensitive?: boolean;
    }>;
    patient_phone?: string;
    province?: string;
    city?: string;
    appointment_id?: number;
}

// انواع جدید برای نوبت‌ها
export interface ApiAppointmentResponse {
    data: ApiAppointment[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
}

export interface ApiAppointment {
    id: number;
    patient: {
        name: string;
        location: string;
    };
    mobile: string | null;
    doctor: {
        name: string;
        specialty: string;
    };
    datetime: {
        date: string;
        time: string;
    };
    status: {
        text: string;
        color: string;
    };
}

export interface ApiDoctor {
    id: number;
    name: string;
    specialty?: string;
}

// ==================== سرویس‌های چت ====================

export async function fetchChatRooms(page: number = 1, perPage: number = 15): Promise<ApiResponse<ApiChatRoom[]>> {
    const response = await fetch(
        `${API_BASE_URL}/admin/patient-rooms?page=${page}&per_page=${perPage}`,
        {
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }

    return response.json();
}

export async function fetchChatDetails(roomId: number): Promise<ApiChatDetails> {
    const response = await fetch(
        `${API_BASE_URL}/admin/chat/${roomId}/messages`,
        {
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }

    return response.json();
}

export async function updateChatStatus(roomId: number, status: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/chat/${roomId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }
}

export async function markChatViolation(roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/chat/${roomId}/flag-violation`, {
        method: 'POST',
        headers: getHeaders(),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }
}

export async function referToSupport(roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/chat/${roomId}/refer-support`, {
        method: 'POST',
        headers: getHeaders(),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }
}

// ==================== سرویس‌های نوبت‌ها ====================

export async function fetchAppointments(
    page: number = 1,
    perPage: number = 15,
    filters?: {
        patientName?: string;
        patientPhone?: string;
        doctorId?: string;
        status?: string;
        province?: string;
        city?: string;
        dateFrom?: string;
        dateTo?: string;
    }
): Promise<ApiAppointmentResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });

    // اضافه کردن فیلترها اگر وجود دارند
    if (filters?.patientName) {
        params.append('patient_name', filters.patientName);
    }
    if (filters?.patientPhone) {
        params.append('patient_phone', filters.patientPhone);
    }
    if (filters?.doctorId && filters.doctorId !== 'all') {
        params.append('doctor_id', filters.doctorId);
    }
    if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }
    if (filters?.province && filters.province !== 'all') {
        params.append('province', filters.province);
    }
    if (filters?.city && filters.city !== 'all') {
        params.append('city', filters.city);
    }
    if (filters?.dateFrom) {
        params.append('date_from', filters.dateFrom);
    }
    if (filters?.dateTo) {
        params.append('date_to', filters.dateTo);
    }

    const response = await fetch(
        `${API_BASE_URL}/admin/appointments/list?${params.toString()}`,
        {
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }

    return response.json();
}

export async function fetchDoctors(): Promise<ApiDoctor[]> {
    const response = await fetch(
        `${API_BASE_URL}/admin/doctors`,
        {
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }

    return response.json();
}

export async function updateAppointmentStatus(
    appointmentId: number,
    status: string,
    reason?: string
): Promise<void> {
    const body: any = { status };
    if (reason) {
        body.reason = reason;
    }

    const response = await fetch(
        `${API_BASE_URL}/admin/appointments/${appointmentId}/status`,
        {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }
}

export async function cancelAppointmentApi(
    appointmentId: number,
    reason: string
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/admin/appointments/${appointmentId}/cancel`,
        {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ reason }),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }
}

export async function getAppointmentDetails(appointmentId: number): Promise<any> {
    const response = await fetch(
        `${API_BASE_URL}/admin/appointments/${appointmentId}`,
        {
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('دسترسی غیرمجاز. لطفاً مجدداً وارد شوید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
    }

    return response.json();
}
