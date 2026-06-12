import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminPaymentRow } from '../config/paymentOptions';
import type { PricingPlan } from '../../data/pricingPlans';
import { pricingPlans } from '../../data/pricingPlans';
import { samplePayments } from '../data/samplePayments';
import type { ActivityLogEntry } from '../services/adminApi';

export type AiSessionStatus = 'completed' | 'in_progress' | 'flagged' | 'disabled';
export type ProviderType = 'doctor' | 'pharmacy' | 'lab' | 'nurse';

export interface AdminAiSession {
    id: number;
    userId: number;
    userName: string;
    userPhone: string;
    symptoms: string;
    status: AiSessionStatus;
    resultSummary: string;
    urgency: 'low' | 'medium' | 'high';
    createdAt: string;
    disabled: boolean;
}

export interface AdminProvider {
    id: number;
    userId: number;
    name: string;
    type: ProviderType;
    specialty?: string;
    province: string;
    city: string;
    fee?: number;
    rating: number;
    isActive: boolean;
    isVerified: boolean;
}

export interface ServiceCatalogEntry {
    id: string;
    title: string;
    type: 'lab' | 'pharmacy' | 'nurse' | 'package';
    price: number;
    province: string;
    city: string;
    featured: boolean;
    active: boolean;
}

export interface HealthContentItem {
    id: string;
    module: 'meal-plan' | 'body-measurement' | 'period-tracker';
    title: string;
    content: string;
    updatedAt: string;
}

export interface SubscriptionPlan extends PricingPlan {
    durationDays: number;
    active: boolean;
}

interface AdminDataState {
    payments: AdminPaymentRow[];
    subscriptionPlans: SubscriptionPlan[];
    aiSessions: AdminAiSession[];
    providers: AdminProvider[];
    serviceCatalog: ServiceCatalogEntry[];
    healthContent: HealthContentItem[];
    activityLog: ActivityLogEntry[];
    appointmentNotes: Record<number, string>;

    setPayments: (payments: AdminPaymentRow[]) => void;
    updatePaymentStatus: (id: number, status: AdminPaymentRow['status']) => void;
    updateSubscriptionPlan: (id: string, patch: Partial<SubscriptionPlan>) => void;
    addSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'id'>) => void;
    removeSubscriptionPlan: (id: string) => void;
    updateAiSession: (id: number, patch: Partial<AdminAiSession>) => void;
    updateProvider: (id: number, patch: Partial<AdminProvider>) => void;
    addServiceCatalogEntry: (entry: Omit<ServiceCatalogEntry, 'id'>) => void;
    updateServiceCatalogEntry: (id: string, patch: Partial<ServiceCatalogEntry>) => void;
    removeServiceCatalogEntry: (id: string) => void;
    addHealthContent: (item: Omit<HealthContentItem, 'id' | 'updatedAt'>) => void;
    updateHealthContent: (id: string, patch: Partial<HealthContentItem>) => void;
    removeHealthContent: (id: string) => void;
    addActivity: (entry: Omit<ActivityLogEntry, 'id' | 'at'>) => void;
    setAppointmentNote: (id: number, notes: string) => void;
    getAppointmentNote: (id: number) => string | undefined;
}

const defaultAiSessions: AdminAiSession[] = [
    { id: 1, userId: 101, userName: 'علی رضایی', userPhone: '09123456789', symptoms: 'سردرد، تب', status: 'completed', resultSummary: 'احتمال عفونت ویروسی — مراجعه در صورت تداوم', urgency: 'low', createdAt: '2026-06-10T10:00:00', disabled: false },
    { id: 2, userId: 102, userName: 'مریم احمدی', userPhone: '09351234567', symptoms: 'درد قفسه سینه', status: 'flagged', resultSummary: 'نیاز به ارزیابی فوری — پرچم‌گذاری شده', urgency: 'high', createdAt: '2026-06-11T14:30:00', disabled: false },
    { id: 3, userId: 103, userName: 'حسن کریمی', userPhone: '09198765432', symptoms: 'خستگی مزمن', status: 'in_progress', resultSummary: 'در حال تکمیل پرسشنامه', urgency: 'medium', createdAt: '2026-06-12T09:15:00', disabled: false },
];

const defaultProviders: AdminProvider[] = [
    { id: 1, userId: 201, name: 'دکتر شهاب عباسی', type: 'doctor', specialty: 'قلب و عروق', province: 'خراسان رضوی', city: 'مشهد', fee: 450000, rating: 4.8, isActive: true, isVerified: true },
    { id: 2, userId: 202, name: 'آزمایشگاه پارس', type: 'lab', province: 'تهران', city: 'تهران', rating: 4.5, isActive: true, isVerified: true },
    { id: 3, userId: 203, name: 'داروخانه سلامت', type: 'pharmacy', province: 'فارس', city: 'شیراز', rating: 4.2, isActive: true, isVerified: false },
    { id: 4, userId: 204, name: 'پرستار خانم موسوی', type: 'nurse', province: 'اصفهان', city: 'اصفهان', fee: 350000, rating: 4.9, isActive: true, isVerified: true },
];

const defaultServiceCatalog: ServiceCatalogEntry[] = [
    { id: 's1', title: 'پکیج چکاپ کامل', type: 'package', price: 2800000, province: 'تهران', city: 'تهران', featured: true, active: true },
    { id: 's2', title: 'آزمایشگاه مهر', type: 'lab', price: 0, province: 'خراسان رضوی', city: 'مشهد', featured: true, active: true },
    { id: 's3', title: 'داروخانه شبانه‌روزی نور', type: 'pharmacy', price: 0, province: 'فارس', city: 'شیراز', featured: false, active: true },
    { id: 's4', title: 'پرستاری در منزل — منطقه شمال', type: 'nurse', price: 350000, province: 'تهران', city: 'تهران', featured: true, active: true },
];

const defaultHealthContent: HealthContentItem[] = [
    { id: 'h1', module: 'meal-plan', title: 'برنامه غذایی کم‌کربوهیدرات', content: 'صبحانه: تخم‌مرغ و سبزیجات\nناهار: مرغ گریل و سالاد\nشام: ماهی و سبزیجات بخارپز', updatedAt: '2026-06-01' },
    { id: 'h2', module: 'body-measurement', title: 'راهنمای اندازه‌گیری دور کمر', content: 'در حالت ایستاده و بدون لباس ضخیم، نوار را در باریک‌ترین نقطه دور کمر قرار دهید.', updatedAt: '2026-06-05' },
    { id: 'h3', module: 'period-tracker', title: 'پارامترهای پیش‌فرض چرخه', content: 'طول چرخه: ۲۸ روز\nمدت قاعدگی: ۵ روز\nپنجره باروری: روز ۱۰ تا ۱۶', updatedAt: '2026-06-08' },
];

const defaultPlans: SubscriptionPlan[] = pricingPlans.map((p, i) => ({
    ...p,
    durationDays: i === 0 ? 0 : 30,
    active: true,
}));

let activityCounter = 1000;

export const useAdminDataStore = create<AdminDataState>()(
    persist(
        (set, get) => ({
            payments: samplePayments,
            subscriptionPlans: defaultPlans,
            aiSessions: defaultAiSessions,
            providers: defaultProviders,
            serviceCatalog: defaultServiceCatalog,
            healthContent: defaultHealthContent,
            activityLog: [],
            appointmentNotes: {},

            setPayments: (payments) => set({ payments }),
            updatePaymentStatus: (id, status) =>
                set((s) => ({
                    payments: s.payments.map((p) => (p.id === id ? { ...p, status } : p)),
                })),
            updateSubscriptionPlan: (id, patch) =>
                set((s) => ({
                    subscriptionPlans: s.subscriptionPlans.map((p) =>
                        p.id === id ? { ...p, ...patch } : p
                    ),
                })),
            addSubscriptionPlan: (plan) =>
                set((s) => ({
                    subscriptionPlans: [
                        ...s.subscriptionPlans,
                        { ...plan, id: `plan-${Date.now()}` },
                    ],
                })),
            removeSubscriptionPlan: (id) =>
                set((s) => ({
                    subscriptionPlans: s.subscriptionPlans.filter((p) => p.id !== id),
                })),
            updateAiSession: (id, patch) =>
                set((s) => ({
                    aiSessions: s.aiSessions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
                })),
            updateProvider: (id, patch) =>
                set((s) => ({
                    providers: s.providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
                })),
            addServiceCatalogEntry: (entry) =>
                set((s) => ({
                    serviceCatalog: [...s.serviceCatalog, { ...entry, id: `svc-${Date.now()}` }],
                })),
            updateServiceCatalogEntry: (id, patch) =>
                set((s) => ({
                    serviceCatalog: s.serviceCatalog.map((e) =>
                        e.id === id ? { ...e, ...patch } : e
                    ),
                })),
            removeServiceCatalogEntry: (id) =>
                set((s) => ({
                    serviceCatalog: s.serviceCatalog.filter((e) => e.id !== id),
                })),
            addHealthContent: (item) =>
                set((s) => ({
                    healthContent: [
                        ...s.healthContent,
                        {
                            ...item,
                            id: `hc-${Date.now()}`,
                            updatedAt: new Date().toISOString().slice(0, 10),
                        },
                    ],
                })),
            updateHealthContent: (id, patch) =>
                set((s) => ({
                    healthContent: s.healthContent.map((h) =>
                        h.id === id
                            ? { ...h, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
                            : h
                    ),
                })),
            removeHealthContent: (id) =>
                set((s) => ({
                    healthContent: s.healthContent.filter((h) => h.id !== id),
                })),
            addActivity: (entry) =>
                set((s) => ({
                    activityLog: [
                        {
                            ...entry,
                            id: String(++activityCounter),
                            at: new Date().toISOString(),
                        },
                        ...s.activityLog,
                    ].slice(0, 100),
                })),
            setAppointmentNote: (id, notes) =>
                set((s) => ({
                    appointmentNotes: { ...s.appointmentNotes, [id]: notes },
                })),
            getAppointmentNote: (id) => get().appointmentNotes[id],
        }),
        { name: 'admin-data-storage' }
    )
);
