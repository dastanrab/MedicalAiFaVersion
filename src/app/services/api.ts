// src/services/api.ts
const API_BASE_URL = 'http://185.222.163.113:7000/api';

// تابع برای دریافت توکن از store
let getAccessToken: () => string | null = () => null;

// تابع برای تنظیم getter توکن
export function setTokenGetter(tokenGetter: () => string | null) {
    getAccessToken = tokenGetter;
}

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
    phone:string;
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

export async function fetchChatRooms(page: number = 1, perPage: number = 15): Promise<ApiResponse<ApiChatRoom[]>> {
    const response = await fetch(
        `${API_BASE_URL}/admin/patient-rooms?page=${page}&per_page=${perPage}`,
        {
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            // توکن منقضی شده یا نامعتبر
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
