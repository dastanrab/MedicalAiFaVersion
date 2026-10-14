import type {
    StaffAppointmentStatus,
    StaffLabStatus,
    StaffNurseStatus,
} from '../data/mockStaffData';

export const staffAppointmentStatusLabels: { booked: string; available: string; done: string; canceled: string } = {
    booked: 'رزرو شده',
    available: 'آزاد',
    done: 'ویزیت شده',
    canceled: 'لغو شده',
};

export const staffAppointmentStatusStyles: { booked: string; available: string; done: string; canceled: string } = {
    booked: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    available: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    done: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    canceled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const staffLabStatusLabels: Record<StaffLabStatus, string> = {
    new: 'جدید',
    confirmed: 'تأیید شده',
    sampled: 'نمونه‌گیری شد',
    testing: 'در حال آزمایش',
    result_uploaded: 'جواب آپلود شد — در انتظار تأیید مسئول فنی',
    canceled: 'لغو شده',
};

export const staffLabStatusStyles: Record<StaffLabStatus, string> = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    confirmed: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    sampled: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    testing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    result_uploaded: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    canceled: 'bg-red-50 text-red-700 ring-red-600/20',
};

/** مرحله بعدی قابل انجام توسط پذیرش برای هر وضعیت درخواست آزمایش */
export const staffLabNextStep: Partial<Record<StaffLabStatus, { to: StaffLabStatus; label: string }>> = {
    new: { to: 'confirmed', label: 'تأیید درخواست' },
    confirmed: { to: 'sampled', label: 'ثبت نمونه‌گیری' },
    sampled: { to: 'testing', label: 'ارسال به بخش آزمایش' },
};

export const staffNurseStatusLabels: Record<StaffNurseStatus, string> = {
    pending_nurse: 'در انتظار تعیین پرستار',
    pending_visit: 'در انتظار ویزیت / اعزام',
    completed: 'تکمیل شده',
    canceled: 'لغو شده',
};

export const staffNurseStatusStyles: Record<StaffNurseStatus, string> = {
    pending_nurse: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    pending_visit: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    canceled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const visitTypeLabels = { in_person: 'حضوری', online: 'آنلاین' } as const;
export const labVisitTypeLabels = { in_person: 'مراجعه حضوری', home: 'نمونه‌گیری در منزل' } as const;
export const deliveryTypeLabels = { pickup: 'تحویل حضوری', courier: 'ارسال با پیک' } as const;
