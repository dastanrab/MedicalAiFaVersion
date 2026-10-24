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

export const staffLabStatusLabels: Record<string, string> = {
    '0': 'درخواست جدید',
    '1': 'در انتظار پرداخت',
    '2': 'در انتظار نمونه‌گیری',
    '3': 'در انتظار اعلام نتیجه',
    '4': 'تکمیل شده',
    '5': 'انجام شده', // بایگانی/تحویل نهایی
    '6': 'لغو شده',
};

export const staffLabStatusStyles: Record<string, string> = {
    '0': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    '1': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    '2': 'bg-violet-50 text-violet-700 ring-violet-600/20',
    '3': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    '4': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    '5': 'bg-slate-100 text-slate-700 ring-slate-600/20',
    '6': 'bg-red-50 text-red-700 ring-red-600/20',
};

/** مرحله بعدی قابل انجام توسط پذیرش برای هر وضعیت */
export const staffLabNextStep: Record<string, { to: string; label: string }> = {
    '0': { to: '1', label: 'تأیید درخواست (ارجاع به پرداخت)' },
    '1': { to: '2', label: 'تأیید پرداخت' },
    '2': { to: '3', label: 'ثبت نمونه‌گیری' },
    '3': { to: '4', label: 'ثبت جواب آزمایش' },
    '4': { to: '5', label: 'تحویل نهایی' },
};

export const labVisitTypeLabels: Record<string, string> = {
    '0': 'مراجعه حضوری',
    '1': 'نمونه‌گیری در منزل',
    'in_person': 'مراجعه حضوری',
    'home': 'نمونه‌گیری در منزل'
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
export const deliveryTypeLabels = { pickup: 'تحویل حضوری', courier: 'ارسال با پیک' } as const;
