import {
    appointmentStatusLabels,
    type AdminAppointmentRow,
    type AppointmentStatus,
} from '../config/appointmentOptions';
import {
    paymentServiceLabels,
    paymentStatusLabels,
    type AdminPaymentRow,
    type PaymentServiceType,
    type PaymentStatus,
} from '../config/paymentOptions';
import { userTypeLabels, type AdminUserRow, type UserType } from '../config/userOptions';

export interface UserDashboardStats {
    total: number;
    verified: number;
    unverified: number;
    blocked: number;
    byRole: { role: UserType; label: string; count: number }[];
    byProvince: { province: string; count: number }[];
}

export interface AppointmentDashboardStats {
    total: number;
    today: number;
    booked: number;
    done: number;
    canceled: number;
    noShow: number;
    byStatus: { status: AppointmentStatus; label: string; count: number }[];
    upcoming: AdminAppointmentRow[];
}

export interface PaymentDashboardStats {
    total: number;
    successAmount: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
    refundedCount: number;
    byStatus: { status: PaymentStatus; label: string; count: number }[];
    byService: { service: PaymentServiceType; label: string; count: number; amount: number }[];
    dailyRevenue: { day: string; amount: number; count: number }[];
    recent: AdminPaymentRow[];
}

function countByKey<T>(
    items: T[],
    getKey: (item: T) => string
): { key: string; count: number }[] {
    const map = new Map<string, number>();
    for (const item of items) {
        const key = getKey(item);
        map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);
}

export function computeUserStats(users: AdminUserRow[]): UserDashboardStats {
    const roles: UserType[] = ['patient', 'doctor', 'pharmacy', 'lab'];
    const roleCounts = new Map<UserType, number>();
    for (const role of roles) roleCounts.set(role, 0);
    for (const user of users) {
        roleCounts.set(user.type, (roleCounts.get(user.type) ?? 0) + 1);
    }

    const byProvince = countByKey(users, (u) => u.province || 'نامشخص').slice(0, 6);

    return {
        total: users.length,
        verified: users.filter((u) => u.isVerified).length,
        unverified: users.filter((u) => !u.isVerified).length,
        blocked: users.filter((u) => u.status === 'blocked').length,
        byRole: roles
            .map((role) => ({
                role,
                label: userTypeLabels[role],
                count: roleCounts.get(role) ?? 0,
            }))
            .filter((item) => item.count > 0),
        byProvince: byProvince.map(({ key, count }) => ({ province: key, count })),
    };
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function computeAppointmentStats(
    appointments: AdminAppointmentRow[],
    now = new Date()
): AppointmentDashboardStats {
    const statuses: AppointmentStatus[] = ['booked', 'done', 'canceled', 'no-show'];
    const statusCounts = new Map<AppointmentStatus, number>();
    for (const status of statuses) statusCounts.set(status, 0);

    let today = 0;
    for (const appt of appointments) {
        statusCounts.set(appt.status, (statusCounts.get(appt.status) ?? 0) + 1);
        if (isSameDay(new Date(appt.scheduledAt), now)) today++;
    }

    const upcoming = [...appointments]
        .filter((a) => new Date(a.scheduledAt) >= now && a.status === 'booked')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5);

    return {
        total: appointments.length,
        today,
        booked: statusCounts.get('booked') ?? 0,
        done: statusCounts.get('done') ?? 0,
        canceled: statusCounts.get('canceled') ?? 0,
        noShow: statusCounts.get('no-show') ?? 0,
        byStatus: statuses.map((status) => ({
            status,
            label: appointmentStatusLabels[status],
            count: statusCounts.get(status) ?? 0,
        })),
        upcoming,
    };
}

export function computePaymentStats(payments: AdminPaymentRow[]): PaymentDashboardStats {
    const statuses: PaymentStatus[] = ['success', 'pending', 'failed', 'refunded'];
    const services: PaymentServiceType[] = ['appointment', 'subscription', 'lab', 'consultation'];

    const statusCounts = new Map<PaymentStatus, number>();
    for (const status of statuses) statusCounts.set(status, 0);

    const serviceMap = new Map<
        PaymentServiceType,
        { count: number; amount: number }
    >();
    for (const service of services) {
        serviceMap.set(service, { count: 0, amount: 0 });
    }

    let successAmount = 0;
    let successCount = 0;

    const dayMap = new Map<string, { amount: number; count: number }>();

    for (const payment of payments) {
        statusCounts.set(payment.status, (statusCounts.get(payment.status) ?? 0) + 1);

        if (payment.status === 'success') {
            successAmount += payment.amount;
            successCount++;
        }

        const serviceEntry = serviceMap.get(payment.serviceType)!;
        serviceEntry.count++;
        if (payment.status === 'success') {
            serviceEntry.amount += payment.amount;
        }

        const day = new Intl.DateTimeFormat('fa-IR', {
            month: 'short',
            day: 'numeric',
        }).format(new Date(payment.paidAt));
        const dayEntry = dayMap.get(day) ?? { amount: 0, count: 0 };
        if (payment.status === 'success') {
            dayEntry.amount += payment.amount;
        }
        dayEntry.count++;
        dayMap.set(day, dayEntry);
    }

    const dailyRevenue = Array.from(dayMap.entries())
        .map(([day, data]) => ({ day, ...data }))
        .slice(-7);

    const recent = [...payments]
        .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
        .slice(0, 5);

    return {
        total: payments.length,
        successAmount,
        successCount,
        pendingCount: statusCounts.get('pending') ?? 0,
        failedCount: statusCounts.get('failed') ?? 0,
        refundedCount: statusCounts.get('refunded') ?? 0,
        byStatus: statuses.map((status) => ({
            status,
            label: paymentStatusLabels[status],
            count: statusCounts.get(status) ?? 0,
        })),
        byService: services.map((service) => ({
            service,
            label: paymentServiceLabels[service],
            count: serviceMap.get(service)!.count,
            amount: serviceMap.get(service)!.amount,
        })),
        dailyRevenue,
        recent,
    };
}

export function formatFaNumber(value: number) {
    return value.toLocaleString('fa-IR');
}

export function formatFaDateTime(iso: string) {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}
