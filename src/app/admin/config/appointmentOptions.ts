export type AppointmentStatus = 'booked' | 'done' | 'canceled' | 'no-show';

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
    booked: 'رزرو شده',
    done: 'انجام شده',
    canceled: 'لغو شده',
    'no-show': 'عدم حضور',
};

export const appointmentStatusStyles: Record<AppointmentStatus, string> = {
    booked: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    done: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    canceled: 'bg-red-50 text-red-700 ring-red-600/20',
    'no-show': 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

/** API numeric status → frontend */
export const statusMapApiToFront: Record<number, AppointmentStatus> = {
    1: 'booked',
    2: 'done',
    3: 'canceled',
    4: 'no-show',
};

/** Frontend → API numeric status */
export const statusMapFrontToApi: Record<AppointmentStatus, number> = {
    booked: 1,
    done: 2,
    canceled: 3,
    'no-show': 4,
};

const statusAliases: Record<string, AppointmentStatus> = {
    booked: 'booked',
    reserved: 'booked',
    confirmed: 'booked',
    pending: 'booked',
    done: 'done',
    completed: 'done',
    finished: 'done',
    canceled: 'canceled',
    cancelled: 'canceled',
    'no-show': 'no-show',
    no_show: 'no-show',
    noshow: 'no-show',
};

export function normalizeAppointmentStatus(raw: unknown): AppointmentStatus {
    if (typeof raw === 'number' && statusMapApiToFront[raw]) {
        return statusMapApiToFront[raw];
    }
    if (typeof raw === 'string') {
        const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
        if (statusAliases[key]) return statusAliases[key];
        const asNum = Number(raw);
        if (!Number.isNaN(asNum) && statusMapApiToFront[asNum]) {
            return statusMapApiToFront[asNum];
        }
    }
    return 'booked';
}

export interface AdminAppointmentRow {
    id: number;
    patientName: string;
    patientPhone: string;
    doctorId: number;
    doctorName: string;
    doctorSpecialty?: string;
    province: string;
    city: string;
    scheduledAt: string;
    status: AppointmentStatus;
    roomId?: number | null;
    cancelReason?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface DoctorOption {
    id: number;
    name: string;
}
