export type LabRequestStatus =
    | 'new'
    | 'confirmed'
    | 'sampled'
    | 'testing'
    | 'completed'
    | 'ready'
    | 'delivered'
    | 'canceled';

/** وضعیت‌های قابل مدیریت توسط آزمایشگاه */
export const labManageableStatuses: LabRequestStatus[] = ['confirmed', 'testing', 'completed'];

/** وضعیت‌هایی که امکان افزودن نتیجه دارند */
export const labResultEligibleStatuses: LabRequestStatus[] = ['confirmed', 'testing'];

export type PharmacyRequestStatus =
    | 'new'
    | 'reviewing'
    | 'preparing'
    | 'ready'
    | 'delivered'
    | 'canceled';

export type NurseRequestStatus =
    | 'new'
    | 'accepted'
    | 'on_way'
    | 'in_progress'
    | 'completed'
    | 'canceled';

export const labStatusLabels: Record<LabRequestStatus, string> = {
    new: 'جدید',
    confirmed: 'تأیید شده',
    sampled: 'نمونه‌گیری انجام شد',
    testing: 'در حال آزمایش',
    completed: 'تکمیل شده',
    ready: 'نتیجه آماده',
    delivered: 'تحویل داده شد',
    canceled: 'لغو شده',
};

export const labStatusStyles: Record<LabRequestStatus, string> = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    confirmed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    sampled: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    testing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    delivered: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    canceled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const pharmacyStatusLabels: Record<PharmacyRequestStatus, string> = {
    new: 'جدید',
    reviewing: 'در بررسی',
    preparing: 'در حال آماده‌سازی',
    ready: 'آماده تحویل',
    delivered: 'تحویل داده شد',
    canceled: 'لغو شده',
};

export const pharmacyStatusStyles: Record<PharmacyRequestStatus, string> = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    reviewing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    preparing: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    delivered: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    canceled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const nurseStatusLabels: Record<NurseRequestStatus, string> = {
    new: 'جدید',
    accepted: 'پذیرفته شده',
    on_way: 'در راه',
    in_progress: 'در حال انجام',
    completed: 'تکمیل',
    canceled: 'لغو شده',
};

export const nurseStatusStyles: Record<NurseRequestStatus, string> = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    accepted: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    on_way: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    in_progress: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    canceled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export type DoctorAppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'canceled';
export type DoctorAppointmentFilter = 'today' | 'upcoming' | 'completed' | 'canceled';
export type DoctorConsultationStatus = 'active' | 'pending' | 'closed';

export const doctorAppointmentStatusLabels: Record<DoctorAppointmentStatus, string> = {
    scheduled: 'رزرو شده',
    in_progress: 'در حال ویزیت',
    completed: 'انجام شده',
    canceled: 'لغو شده',
};

export const doctorAppointmentStatusStyles: Record<DoctorAppointmentStatus, string> = {
    scheduled: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    in_progress: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    canceled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const doctorConsultationStatusLabels: Record<DoctorConsultationStatus, string> = {
    active: 'فعال',
    pending: 'در انتظار',
    closed: 'بسته شده',
};

export const doctorConsultationStatusStyles: Record<DoctorConsultationStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    closed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};
