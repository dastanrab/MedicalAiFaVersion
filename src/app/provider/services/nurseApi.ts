import type { NurseRequestStatus } from '../config/statusOptions';
import type { NursePersonnel, NurseService } from '../data/mockData';
import { useNurseStore, type NursePersonnelInput, type NurseServiceInput } from '../store/nurseStore';
import type { NurseRequest } from '../store/nurseStore';
import { compareJalaliDates, parseJalaliDate } from '../utils/jalali';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

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

function getStore() {
    return useNurseStore.getState();
}

function filterRequests(requests: NurseRequest[], filters: NurseRequestFilters): NurseRequest[] {
    return requests.filter((r) => {
        if (filters.status && filters.status !== 'all' && r.status !== filters.status) return false;
        if (filters.serviceType && filters.serviceType !== 'all' && r.serviceKey !== filters.serviceType) {
            return false;
        }
        if (filters.patientName?.trim() && !r.patientName.includes(filters.patientName.trim())) {
            return false;
        }
        if (filters.patientPhone?.trim()) {
            const q = filters.patientPhone.replace(/\D/g, '');
            if (!r.patientPhone.includes(q)) return false;
        }
        if (filters.search?.trim()) {
            const q = filters.search.trim();
            if (
                !r.patientName.includes(q) &&
                !r.code.includes(q) &&
                !r.serviceType.includes(q) &&
                !r.patientPhone.includes(q)
            ) {
                return false;
            }
        }
        const reqDate = parseJalaliDate(r.scheduledDate);
        if (filters.dateFrom) {
            const from = parseJalaliDate(filters.dateFrom);
            if (from && reqDate && compareJalaliDates(reqDate, from) < 0) return false;
        }
        if (filters.dateTo) {
            const to = parseJalaliDate(filters.dateTo);
            if (to && reqDate && compareJalaliDates(reqDate, to) > 0) return false;
        }
        return true;
    });
}

function sortByDate(requests: NurseRequest[], order: 'asc' | 'desc'): NurseRequest[] {
    return [...requests].sort((a, b) => {
        const da = parseJalaliDate(a.scheduledDate);
        const db = parseJalaliDate(b.scheduledDate);
        if (!da || !db) return 0;
        const cmp = compareJalaliDates(da, db);
        return order === 'asc' ? cmp : -cmp;
    });
}

export async function fetchNurseRequests(
    params: ListRequestsParams = {}
): Promise<PaginatedResult<NurseRequest>> {
    await delay();
    const { page = 1, pageSize = 10, sortOrder = 'desc', ...filters } = params;
    const filtered = sortByDate(filterRequests(getStore().requests, filters), sortOrder);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
        items: filtered.slice(start, start + pageSize),
        total,
        page: safePage,
        pageSize,
        totalPages,
    };
}

export async function fetchNurseRequestsByDate(dateKey: string): Promise<NurseRequest[]> {
    await delay(150);
    return getStore().requests.filter((r) => r.scheduledDate === dateKey);
}

export async function fetchNursePersonnel(): Promise<NursePersonnel[]> {
    await delay();
    return getStore().personnel;
}

export async function createNursePersonnel(input: NursePersonnelInput): Promise<NursePersonnel> {
    await delay();
    return getStore().addPersonnel(input);
}

export async function updateNursePersonnel(
    id: number,
    patch: Partial<NursePersonnelInput>
): Promise<NursePersonnel> {
    await delay();
    getStore().updatePersonnel(id, patch);
    const item = getStore().personnel.find((p) => p.id === id);
    if (!item) throw new Error('پرسنل یافت نشد');
    return item;
}

export async function fetchNurseServices(): Promise<NurseService[]> {
    await delay();
    return getStore().services;
}

export async function createNurseService(input: NurseServiceInput): Promise<NurseService> {
    await delay();
    return getStore().addService(input);
}

export async function updateNurseService(
    id: number,
    patch: Partial<NurseServiceInput>
): Promise<NurseService> {
    await delay();
    getStore().updateService(id, patch);
    const item = getStore().services.find((s) => s.id === id);
    if (!item) throw new Error('خدمت یافت نشد');
    return item;
}

export async function toggleNurseServiceActive(id: number): Promise<NurseService> {
    await delay(150);
    getStore().toggleServiceActive(id);
    const item = getStore().services.find((s) => s.id === id);
    if (!item) throw new Error('خدمت یافت نشد');
    return item;
}
