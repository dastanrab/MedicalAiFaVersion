// src/services/nurseApi.ts

import type { NurseRequestStatus } from '../config/statusOptions';
import type { NursePersonnel, NurseService } from '../data/mockData';
import type { NurseRequest } from '../store/nurseStore';

// Import the hook type (assuming it's available)
interface ProviderSession {
    token: string;
    medical_center_id: number;
    // ... other session properties
}
export interface BaseService {
    id: number;
    name: string;
    slug?: string;
}
export interface NurseRequestFilters {
    serviceType?: string;
    patientName?: string;
    patientPhone?: string;
    status?: NurseRequestStatus | 'all';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ListRequestsParams extends NurseRequestFilters {
    page?: number;
    pageSize?: number;
    sortOrder?: 'asc' | 'desc';
}

// ----------- انواع داده‌های API -----------
export interface ApiNurseRequest {
    id: number;
    code: string;
    patient_name: string;
    patient_phone: string;
    service_id: number;
    service_name: string;
    service_price: number;
    scheduled_date: string;
    scheduled_time: string;
    status: NurseRequestStatus;
    notes?: string;
    address?: string;
    medical_center_id: number;
    created_at: string;
    updated_at: string;
}

export interface ApiNursePersonnel {
    id: number;
    name: string;
    mobile: string;
    national_code: string;
    gender: 'male' | 'female';
    status: 0 | 1;
    medical_center_id: number;
    created_at: string;
    updated_at: string;
}

export interface ApiNurseService {
    id: number;
    title: string;
    description?: string;
    price: number;
    duration_minutes: number;
    status: 0 | 1;
    medical_center_id: number;
    created_at: string;
    updated_at: string;
}

// ----------- انواع داده‌های ورودی -----------
export interface NursePersonnelInput {
    name: string;
    mobile: string;
    national_code?: string;
    gender: 'male' | 'female';
    status: 0 | 1;
}

export interface NurseServiceInput {
    title: string;
    description?: string;
    base_price: number;
    duration_minutes: number;
    status: 0 |190
}

export interface NurseRequestInput {
    patient_name: string;
    patient_phone: string;
    service_id: number;
    scheduled_date: string;
    scheduled_time: string;
    address?: string;
    notes?: string;
    status?: NurseRequestStatus;
}

// ----------- توابع کمکی -----------
const BASE_URL = 'http://185.222.163.113:7000/api/owner/medical-center';

// تابع اصلی برای درخواست‌های API
const apiRequest = async <T = any>(
    endpoint: string,
    options: RequestInit = {},
    session: ProviderSession | null
): Promise<{ data: T; message?: string }> => {

    if (!session?.token) {
        throw new Error('لطفا ابتدا وارد شوید. توکن احراز هویت یافت نشد');
    }


    const headers = {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    // اضافه کردن medical_center_id به query params
    const urlParams = new URLSearchParams();

    let url = `${BASE_URL}${endpoint}`;
    if (endpoint.includes('?')) {
        url += `&${urlParams.toString()}`;
    } else {
        url += `?${urlParams.toString()}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { message: errorText || `خطای ${response.status}` };
        }

        // پیام‌های خطای خاص
        if (response.status === 401) {
            throw new Error('احراز هویت نامعتبر است. لطفا مجددا وارد شوید.');
        }
        if (response.status === 409) {
            // خطای تکراری بودن کد ملی
            throw new Error(errorData.message || 'کد ملی تکراری است');
        }if (response.status === 422) {
            // خطای اعتبارسنجی
            if (errorData.errors && errorData.errors.national_code) {
                throw new Error(errorData.errors.national_code[0]);
            }
            throw new Error('داده‌های ورودی نامعتبر است');
        }
        if (response.status === 403) {
            throw new Error('شما دسترسی لازم را ندارید.');
        }


        throw new Error(errorData.message || `خطای ${response.status}`);
    }

    return response.json();
};

// ----------- تبدیل‌های داده‌ای -----------
function transformApiRequest(apiData: ApiNurseRequest): NurseRequest {
    return {
        id: apiData.id,
        code: apiData.code,
        patientName: apiData.patient_name,
        patientPhone: apiData.patient_phone,
        serviceId: apiData.service_id,
        serviceType: apiData.service_name,
        servicePrice: apiData.service_price,
        scheduledDate: apiData.scheduled_date,
        scheduledTime: apiData.scheduled_time,
        status: apiData.status,
        notes: apiData.notes,
        address: apiData.address,
        medicalCenterId: apiData.medical_center_id,
        createdAt: apiData.created_at,
        updatedAt: apiData.updated_at,
    };
}

function transformApiPersonnel(apiData: ApiNursePersonnel): NursePersonnel {
    const nameParts = apiData.name.split(' ');
    return {
        id: apiData.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        gender: apiData.gender,
        phone: apiData.mobile,
        nationalCode: apiData.national_code || '',
        active: apiData.status === 1,
        medicalCenterId: apiData.medical_center_id,
        createdAt: apiData.created_at,
        updatedAt: apiData.updated_at,
    };
}

function transformApiService(apiData: ApiNurseService): NurseService {
    return {
        id: apiData.id,
        key: `service_${apiData.id}`,
        title: apiData.title,
        description: apiData.description,
        price: apiData.price,
        durationMinutes: apiData.duration_minutes,
        active: apiData.status === 1,
        medicalCenterId: apiData.medical_center_id,
        createdAt: apiData.created_at,
        updatedAt: apiData.updated_at,
    };
}

// ----------- درخواست‌های پرستاری -----------
export async function fetchNurseRequests(
    params: ListRequestsParams = {},
    session: ProviderSession | null
): Promise<PaginatedResult<NurseRequest>> {
    const {
        page = 1,
        pageSize = 10,
        sortOrder = 'desc',
        serviceType,
        patientName,
        patientPhone,
        status,
        dateFrom,
        dateTo,
        search,
    } = params;

    let url = `/nurse-requests?page=${page}&per_page=${pageSize}`;

    if (serviceType && serviceType !== 'all') {
        url += `&service_id=${serviceType}`;
    }
    if (patientName?.trim()) {
        url += `&patient_name=${encodeURIComponent(patientName.trim())}`;
    }
    if (patientPhone?.trim()) {
        url += `&patient_phone=${encodeURIComponent(patientPhone.trim())}`;
    }
    if (status && status !== 'all') {
        url += `&status=${status}`;
    }
    if (dateFrom) {
        url += `&date_from=${dateFrom}`;
    }
    if (dateTo) {
        url += `&date_to=${dateTo}`;
    }
    if (search?.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (sortOrder) {
        url += `&sort=${sortOrder === 'asc' ? 'asc' : 'desc'}`;
    }

    try {
        const response = await apiRequest<{ data: ApiNurseRequest[]; meta: any }>(
            url,
            {},
            session
        );

        const items = response.data.data?.map(transformApiRequest) || [];

        return {
            items,
            total: response.data.meta?.total || items.length,
            page: response.data.meta?.current_page || page,
            pageSize: response.data.meta?.per_page || pageSize,
            totalPages: response.data.meta?.last_page || 1,
        };
    } catch (error) {
        console.error('Error fetching nurse requests:', error);
        throw error;
    }
}

export async function fetchNurseRequestsByDate(
    dateKey: string,
    session: ProviderSession | null
): Promise<NurseRequest[]> {
    try {
        const response = await apiRequest<{ data: ApiNurseRequest[] }>(
            `/nurse-requests-by-date?date=${dateKey}`,
            {},
            session
        );
        return (response.data || []).map(transformApiRequest);
    } catch (error) {
        console.error('Error fetching nurse requests by date:', error);
        throw error;
    }
}

// ----------- پرسنل -----------
export async function fetchNursePersonnel(
    session: ProviderSession | null
): Promise<NursePersonnel[]> {
    try {
        const response = await apiRequest<{ data: ApiNursePersonnel[] }>(
            '/staff',
            {},
            session
        );
        return (response.data || []).map(transformApiPersonnel);
    } catch (error) {
        console.error('Error fetching nurse personnel:', error);
        throw error;
    }
}

export async function createNursePersonnel(
    input: NursePersonnelInput,
    session: ProviderSession | null
): Promise<NursePersonnel> {
    try {
        const response = await apiRequest<{ data: ApiNursePersonnel }>('/staff', {
            method: 'POST',
            body: JSON.stringify(input),
        }, session);
        return transformApiPersonnel(response.data);
    } catch (error) {
        console.error('Error creating nurse personnel:', error);
        throw error;
    }
}

export async function updateNursePersonnel(
    id: number,
    patch: Partial<NursePersonnelInput>,
    session: ProviderSession | null
): Promise<NursePersonnel> {
    try {
        const response = await apiRequest<{ data: ApiNursePersonnel }>(`/staff/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patch),
        }, session);
        return transformApiPersonnel(response.data);
    } catch (error) {
        console.error('Error updating nurse personnel:', error);
        throw error;
    }
}

export async function deleteNursePersonnel(
    id: number,
    session: ProviderSession | null
): Promise<void> {
    try {
        await apiRequest(`/staff/${id}`, {
            method: 'DELETE',
        }, session);
    } catch (error) {
        console.error('Error deleting nurse personnel:', error);
        throw error;
    }
}

// ----------- خدمات -----------
export async function fetchAvailableServices(
    session: ProviderSession | null
): Promise<BaseService[]> {
    try {
        // دقت کنید که خروجی این روت در بک‌اند باید شامل فیلدهای id و name باشد
        const response = await apiRequest<{ data: BaseService[] }>(
            '/services/list',
            { method: 'GET' },
            session
        );
        // اگر ساختار ریسپانس بک‌اند شما دیتا را مستقیما برمی‌گرداند یا داخل یک آبجکت دیگر است، اینجا هندل می‌شود
        return response.data || [];
    } catch (error) {
        console.error('Error fetching available services:', error);
        throw error;
    }
}

export async function fetchNurseServices(
    session: ProviderSession | null
): Promise<NurseService[]> {
    try {
        const response = await apiRequest<{ data: ApiNurseService[] }>(
            '/services',
            {},
            session
        );
        return (response.data || []).map(transformApiService);
    } catch (error) {
        console.error('Error fetching nurse services:', error);
        throw error;
    }
}

export async function createNurseService(
    input: NurseServiceInput,
    session: ProviderSession | null
): Promise<NurseService> {
    try {
        const response = await apiRequest<{ data: ApiNurseService }>('/services', {
            method: 'POST',
            body: JSON.stringify(input),
        }, session);
        return transformApiService(response.data);
    } catch (error) {
        console.error('Error creating nurse service:', error);
        throw error;
    }
}

export async function updateNurseService(
    id: number,
    patch: Partial<NurseServiceInput>,
    session: ProviderSession | null
): Promise<NurseService> {
    try {
        const response = await apiRequest<{ data: ApiNurseService }>(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patch),
        }, session);
        return transformApiService(response.data);
    } catch (error) {
        console.error('Error updating nurse service:', error);
        throw error;
    }
}

export async function toggleNurseServiceActive(
    id: number,
    session: ProviderSession | null
): Promise<NurseService> {
    try {
        const response = await apiRequest<{ data: ApiNurseService }>(
            `/services/${id}/toggle`,
            {
                method: 'PATCH',
            },
            session
        );
        return transformApiService(response.data);
    } catch (error) {
        console.error('Error toggling nurse service:', error);
        throw error;
    }
}

// ----------- درخواست‌های خاص -----------
export async function fetchNurseRequest(
    id: number,
    session: ProviderSession | null
): Promise<NurseRequest> {
    try {
        const response = await apiRequest<{ data: ApiNurseRequest }>(
            `/nurse-requests/${id}`,
            {},
            session
        );
        return transformApiRequest(response.data);
    } catch (error) {
        console.error('Error fetching nurse request:', error);
        throw error;
    }
}

export async function createNurseRequest(
    input: NurseRequestInput,
    session: ProviderSession | null
): Promise<NurseRequest> {
    try {
        const response = await apiRequest<{ data: ApiNurseRequest }>('/nurse-requests', {
            method: 'POST',
            body: JSON.stringify(input),
        }, session);
        return transformApiRequest(response.data);
    } catch (error) {
        console.error('Error creating nurse request:', error);
        throw error;
    }
}

export async function updateNurseRequest(
    id: number,
    patch: Partial<NurseRequestInput>,
    session: ProviderSession | null
): Promise<NurseRequest> {
    try {
        const response = await apiRequest<{ data: ApiNurseRequest }>(
            `/nurse-requests/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(patch),
            },
            session
        );
        return transformApiRequest(response.data);
    } catch (error) {
        console.error('Error updating nurse request:', error);
        throw error;
    }
}

export async function updateNurseRequestStatus(
    id: number,
    status: NurseRequestStatus,
    session: ProviderSession | null
): Promise<NurseRequest> {
    try {
        const response = await apiRequest<{ data: ApiNurseRequest }>(
            `/nurse-requests/${id}/status`,
            {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            },
            session
        );
        return transformApiRequest(response.data);
    } catch (error) {
        console.error('Error updating nurse request status:', error);
        throw error;
    }
}

export async function assignPersonnelToRequest(
    requestId: number,
    personnelId: number,
    session: ProviderSession | null
): Promise<NurseRequest> {
    try {
        const response = await apiRequest<{ data: ApiNurseRequest }>(
            `/nurse-requests/${requestId}/assign`,
            {
                method: 'POST',
                body: JSON.stringify({ personnel_id: personnelId }),
            },
            session
        );
        return transformApiRequest(response.data);
    } catch (error) {
        console.error('Error assigning personnel to request:', error);
        throw error;
    }
}
