import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    mockLabCatalog,
    mockLabRequests, // اگر کلا به API وصل شده‌اید می‌توانید این را حذف کرده و مقدار اولیه requests را [] قرار دهید
    mockLabResults,
    type LabRequest,
    type LabRequestResult,
    type LabResult,
    type LabTestCatalogItem,
} from '../data/mockData';
import type { LabRequestStatus } from '../config/statusOptions';

export type LabCatalogInput = Omit<LabTestCatalogItem, 'id'>;
export type LabResultInput = {
    requestId: number;
    status: LabRequestStatus;
    file: File;
    notes?: string;
};

interface LabDataState {
    catalog: LabTestCatalogItem[];
    requests: LabRequest[];
    results: LabResult[];
    nextCatalogId: number;
    nextResultId: number;

    // متد جدید برای جایگذاری کامل ریکوئست‌ها از سمت سرور
    setRequests: (requests: LabRequest[]) => void;

    addCatalogItem: (input: LabCatalogInput) => LabTestCatalogItem;
    updateCatalogItem: (id: number, patch: Partial<LabCatalogInput>) => void;
    toggleCatalogActive: (id: number) => void;

    updateRequestStatus: (id: number, status: LabRequestStatus, label?: string) => void;
    attachRequestResult: (
        requestId: number,
        result: Omit<LabRequestResult, 'uploadedAt'> & { uploadedAt?: string },
        newStatus: LabRequestStatus
    ) => void;

    addResult: (input: LabResultInput) => Promise<LabResult>;
    markResultSent: (id: number) => void;
    getRequestsByDate: (dateKey: string) => LabRequest[];
}

const nowFa = () =>
    new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date());

export const useLabStore = create<LabDataState>()(
    persist(
        (set, get) => ({
            catalog: mockLabCatalog,
            requests: mockLabRequests, // داده‌های پیش‌فرض که بعد از fetch جایگزین می‌شوند
            results: mockLabResults,
            nextCatalogId: Math.max(...mockLabCatalog.map((c) => c.id), 0) + 1,
            nextResultId: Math.max(...mockLabResults.map((r) => r.id), 0) + 1,

            // پیاده‌سازی متد جدید
            setRequests: (requests) => set({ requests }),

            addCatalogItem: (input) => {
                const id = get().nextCatalogId;
                const item: LabTestCatalogItem = { id, ...input };
                set((s) => ({
                    catalog: [...s.catalog, item],
                    nextCatalogId: id + 1,
                }));
                return item;
            },

            updateCatalogItem: (id, patch) =>
                set((s) => ({
                    catalog: s.catalog.map((c) => (c.id === id ? { ...c, ...patch } : c)),
                })),

            toggleCatalogActive: (id) =>
                set((s) => ({
                    catalog: s.catalog.map((c) =>
                        c.id === id ? { ...c, active: !c.active } : c
                    ),
                })),

            updateRequestStatus: (id, status, label) =>
                set((s) => ({
                    requests: s.requests.map((r) =>
                        r.id === id
                            ? {
                                ...r,
                                status,
                                timeline: [
                                    ...r.timeline,
                                    {
                                        at: nowFa(),
                                        label: label ?? `وضعیت: ${status}`,
                                    },
                                ],
                            }
                            : r
                    ),
                })),

            attachRequestResult: (requestId, result, newStatus) =>
                set((s) => ({
                    requests: s.requests.map((r) =>
                        r.id === requestId
                            ? {
                                ...r,
                                status: newStatus,
                                result: {
                                    ...result,
                                    uploadedAt: result.uploadedAt ?? nowFa(),
                                },
                                timeline: [
                                    ...r.timeline,
                                    { at: nowFa(), label: 'نتیجه آزمایش ثبت شد' },
                                ],
                            }
                            : r
                    ),
                })),

            addResult: async (input) => {
                const fileUrl = URL.createObjectURL(input.file);
                const uploadedAt = nowFa();
                const request = get().requests.find((r) => r.id === input.requestId);
                if (!request) throw new Error('درخواست یافت نشد');

                const resultId = get().nextResultId;
                const result: LabResult = {
                    id: resultId,
                    requestId: input.requestId,
                    requestCode: request.code,
                    patientName: request.patientName,
                    uploadedAt,
                    sent: false,
                    fileName: input.file.name,
                    notes: input.notes,
                };

                get().attachRequestResult(
                    input.requestId,
                    {
                        fileName: input.file.name,
                        fileUrl,
                        notes: input.notes,
                        uploadedAt,
                    },
                    input.status
                );

                set((s) => ({
                    results: [result, ...s.results],
                    nextResultId: resultId + 1,
                }));

                return result;
            },

            markResultSent: (id) =>
                set((s) => ({
                    results: s.results.map((r) => (r.id === id ? { ...r, sent: true } : r)),
                })),

            getRequestsByDate: (dateKey) =>
                get().requests.filter((r) => r.scheduledDate === dateKey),
        }),
        { name: 'provider-lab-storage' }
    )
);
