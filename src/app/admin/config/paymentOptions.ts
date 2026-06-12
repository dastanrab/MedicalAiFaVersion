export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export type PaymentMethod = 'online' | 'wallet' | 'card';

export type PaymentServiceType = 'appointment' | 'subscription' | 'lab' | 'consultation';

export const paymentStatusLabels: Record<PaymentStatus, string> = {
    success: 'موفق',
    pending: 'در انتظار',
    failed: 'ناموفق',
    refunded: 'استرداد شده',
};

export const paymentStatusStyles: Record<PaymentStatus, string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    failed: 'bg-red-50 text-red-700 ring-red-600/20',
    refunded: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
    online: 'درگاه آنلاین',
    wallet: 'کیف پول',
    card: 'کارت به کارت',
};

export const paymentServiceLabels: Record<PaymentServiceType, string> = {
    appointment: 'رزرو نوبت',
    subscription: 'اشتراک',
    lab: 'آزمایش',
    consultation: 'مشاوره آنلاین',
};

export const paymentServiceStyles: Record<PaymentServiceType, string> = {
    appointment: 'bg-indigo-50 text-indigo-700',
    subscription: 'bg-violet-50 text-violet-700',
    lab: 'bg-cyan-50 text-cyan-700',
    consultation: 'bg-sky-50 text-sky-700',
};

export interface AdminPaymentRow {
    id: number;
    trackingCode: string;
    patientName: string;
    patientPhone: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    serviceType: PaymentServiceType;
    planId?: string;
    doctorName?: string;
    appointmentId?: number | null;
    province: string;
    city: string;
    paidAt: string;
    gatewayRef?: string | null;
    description?: string | null;
}
