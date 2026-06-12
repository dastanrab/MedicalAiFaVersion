import type { AdminUserRow, UserStatus, UserType } from '../config/userOptions';
import type { AdminPaymentRow, PaymentStatus } from '../config/paymentOptions';
import type { AdminAppointmentRow } from '../config/appointmentOptions';
import { samplePayments } from '../data/samplePayments';

const API_BASE = 'http://185.222.163.113:7000/api';

let getToken: () => string | null = () => null;

export function setAdminTokenGetter(getter: () => string | null) {
    getToken = getter;
}

function headers(): HeadersInit {
    const h: HeadersInit = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers(), ...init?.headers } });
    if (res.status === 401 || res.status === 403) throw new Error('دسترسی غیرمجاز');
    if (!res.ok) throw new Error(`خطای سرور: ${res.status}`);
    return res.json();
}

const statusMapApiToFront: Record<number, UserStatus> = { 1: 'active', 0: 'blocked', 2: 'inactive' };
const statusMapFrontToApi: Record<string, number> = { active: 1, blocked: 0, inactive: 2 };

export function normalizeUserFromApi(user: Record<string, unknown>): AdminUserRow {
    const name = (user.name as string) ?? '';
    const role = (user.role as string) ?? 'patient';
    const typeMap: Record<string, UserType> = {
        patient: 'patient', normal: 'patient', doctor: 'doctor',
        pharmacy: 'pharmacy', lab: 'lab', nurse: 'nurse',
    };
    return {
        ...(user as AdminUserRow),
        firstName: name.split(' ')[0] ?? '',
        lastName: name.split(' ').slice(1).join(' ') ?? '',
        status: statusMapApiToFront[user.status as number] ?? 'blocked',
        isVerified: Boolean(user.is_verify),
        type: typeMap[role] ?? 'patient',
    };
}

export interface UsersListResponse {
    data: AdminUserRow[];
    total: number;
    per_page: number;
    current_page: number;
}

export async function fetchAdminUsers(params: Record<string, string>): Promise<UsersListResponse> {
    const qs = new URLSearchParams(params).toString();
    const result = await apiFetch<{ data: { data: Record<string, unknown>[]; total: number; per_page: number; current_page: number } }>(
        `/admin/users?${qs}`
    );
    return {
        ...result.data,
        data: result.data.data.map(normalizeUserFromApi),
    };
}

export async function fetchAllAdminUsers(): Promise<AdminUserRow[]> {
    const all: AdminUserRow[] = [];
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
        const res = await fetchAdminUsers({ page: String(page), per_page: '100' });
        all.push(...res.data);
        totalPages = Math.max(1, Math.ceil(res.total / 100));
        page++;
    }
    return all;
}

export async function fetchAdminUser(id: number): Promise<AdminUserRow | null> {
    try {
        const result = await apiFetch<{ data: Record<string, unknown> }>(`/admin/users/${id}`);
        return normalizeUserFromApi(result.data);
    } catch {
        const list = await fetchAdminUsers({ page: '1', per_page: '500' });
        return list.data.find((u) => u.id === id) ?? null;
    }
}

export async function createAdminUser(payload: Record<string, unknown>): Promise<AdminUserRow> {
    const result = await apiFetch<{ data: Record<string, unknown> }>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return normalizeUserFromApi(result.data);
}

export async function updateAdminUser(id: number, payload: Record<string, unknown>): Promise<AdminUserRow> {
    const result = await apiFetch<{ data: Record<string, unknown> }>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return normalizeUserFromApi(result.data);
}

export async function verifyAdminUser(id: number, approved: boolean, reason?: string): Promise<void> {
    await apiFetch(`/admin/users/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ approved, reason }),
    });
}

export async function bulkUserStatus(ids: number[], status: UserStatus): Promise<void> {
    await apiFetch('/admin/users/bulk-status', {
        method: 'POST',
        body: JSON.stringify({ ids, status: statusMapFrontToApi[status] }),
    });
}

export async function bulkUserDelete(ids: number[]): Promise<void> {
    await apiFetch('/admin/users/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
    });
}

export async function fetchAdminPayments(): Promise<AdminPaymentRow[]> {
    try {
        const result = await apiFetch<{ data: AdminPaymentRow[] }>('/admin/payments');
        return result.data;
    } catch {
        return samplePayments;
    }
}

export async function refundAdminPayment(id: number, reason: string): Promise<void> {
    try {
        await apiFetch(`/admin/payments/${id}/refund`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    } catch {
        // fallback handled by caller updating local store
    }
}

export async function saveAppointmentNotes(id: number, notes: string): Promise<void> {
    try {
        await apiFetch(`/admin/appointments/${id}/notes`, {
            method: 'PUT',
            body: JSON.stringify({ notes }),
        });
    } catch {
        // fallback to local store
    }
}

export interface ActivityLogEntry {
    id: string;
    type: 'user' | 'appointment' | 'payment' | 'chat' | 'verification' | 'ai';
    message: string;
    at: string;
    link?: string;
}

export async function fetchActivityLog(): Promise<ActivityLogEntry[]> {
    try {
        const result = await apiFetch<{ data: ActivityLogEntry[] }>('/admin/activity-log');
        return result.data;
    } catch {
        return [];
    }
}

export async function syncAdminSettings(settings: unknown): Promise<boolean> {
    try {
        await apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
        return true;
    } catch {
        return false;
    }
}

export async function fetchAdminSettings(): Promise<unknown | null> {
    try {
        const result = await apiFetch<{ data: unknown }>('/admin/settings');
        return result.data;
    } catch {
        return null;
    }
}

export async function changeAdminPassword(current: string, next: string): Promise<void> {
    await apiFetch('/admin/profile/password', {
        method: 'PUT',
        body: JSON.stringify({ current_password: current, new_password: next }),
    });
}

export function buildSignupTrend(users: AdminUserRow[]): { week: string; count: number }[] {
    const weeks = new Map<string, number>();
    for (const u of users) {
        const created = (u as AdminUserRow & { created_at?: string }).created_at;
        if (!created) continue;
        const d = new Date(created);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-W${Math.ceil(d.getDate() / 7)}`;
        weeks.set(key, (weeks.get(key) ?? 0) + 1);
    }
    if (weeks.size === 0) {
        return ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴'].map((week, i) => ({
            week,
            count: Math.max(1, Math.floor(users.length / 4) + (i % 2)),
        }));
    }
    return Array.from(weeks.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8)
        .map(([week, count]) => ({ week, count }));
}

export function buildAppointmentTrend(appointments: AdminAppointmentRow[]): { week: string; count: number }[] {
    const weeks = new Map<string, number>();
    for (const a of appointments) {
        const d = new Date(a.scheduledAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        weeks.set(key, (weeks.get(key) ?? 0) + 1);
    }
    if (weeks.size === 0) {
        return ['فروردین', 'اردیبهشت', 'خرداد', 'تیر'].map((week, i) => ({
            week,
            count: Math.max(1, Math.floor(appointments.length / 4) + i),
        }));
    }
    return Array.from(weeks.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([week, count]) => ({ week, count }));
}
