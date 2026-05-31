export type UserType = 'patient' | 'doctor' | 'pharmacy' | 'lab';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export const userTypeLabels: Record<UserType, string> = {
    patient: 'کاربر عادی',
    doctor: 'دکتر',
    pharmacy: 'داروخانه',
    lab: 'آزمایشگاه',
    nurse: 'پرستار در منزل',
};

export const userStatusLabels: Record<UserStatus, string> = {
    active: 'فعال',
    inactive: 'غیرفعال',
    blocked: 'مسدود',
};

export const userStatusStyles: Record<UserStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    blocked: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const userTypeStyles: Record<UserType, string> = {
    patient: 'bg-slate-100 text-slate-700',
    doctor: 'bg-indigo-50 text-indigo-700',
    pharmacy: 'bg-teal-50 text-teal-700',
    lab: 'bg-amber-50 text-amber-700',
    nurse: 'bg-rose-50 text-rose-700',
};

export interface AdminUserRow {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    type: UserType;
    phone: string;
    status: UserStatus;
    province: string;
    city: string;
    isVerified: boolean;
    /** فیلدهای اختصاصی هر نوع کاربری */
    details?: Record<string, string>;
}

/* ---------------------------------------------------------------------------
 *  اسکیمای فیلدهای اختصاصی هر هویت کاربری
 *  فیلدهای مشترک (نام، نام خانوادگی، موبایل، استان، شهر) در فرم به‌صورت ثابت
 *  نمایش داده می‌شوند و این اسکیما فقط فیلدهای ویژهٔ هر نوع را توصیف می‌کند.
 * ------------------------------------------------------------------------- */

export type UserFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export interface UserField {
    name: string;
    label: string;
    type: UserFieldType;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    ltr?: boolean;
    fullWidth?: boolean;
}

const genderOptions = [
    { value: 'male', label: 'مرد' },
    { value: 'female', label: 'زن' },
];

export const userTypeFields: Record<UserType, UserField[]> = {
    normal: [
        { name: 'nationalCode', label: 'کد ملی', type: 'text', placeholder: '۱۰ رقم', ltr: true, required: true },
        { name: 'birthDate', label: 'تاریخ تولد', type: 'date' },
        { name: 'gender', label: 'جنسیت', type: 'select', options: genderOptions },
        { name: 'insuranceNumber', label: 'شماره بیمه', type: 'text', ltr: true },
    ],
    doctor: [
        { name: 'medicalCode', label: 'شماره نظام پزشکی', type: 'text', placeholder: 'مثال: ۱۲۳۴۵۶', ltr: true, required: true },
        {
            name: 'specialty',
            label: 'تخصص',
            type: 'select',
            required: true,
            options: [
                { value: 'general', label: 'پزشک عمومی' },
                { value: 'cardiology', label: 'قلب و عروق' },
                { value: 'dermatology', label: 'پوست و مو' },
                { value: 'pediatrics', label: 'اطفال' },
                { value: 'gynecology', label: 'زنان و زایمان' },
                { value: 'orthopedics', label: 'ارتوپدی' },
                { value: 'neurology', label: 'مغز و اعصاب' },
                { value: 'psychiatry', label: 'روانپزشکی' },
                { value: 'dentistry', label: 'دندانپزشکی' },
                { value: 'other', label: 'سایر' },
            ],
        },
        {
            name: 'degree',
            label: 'مدرک تحصیلی',
            type: 'select',
            options: [
                { value: 'gp', label: 'دکترای عمومی' },
                { value: 'specialist', label: 'متخصص' },
                { value: 'subspecialist', label: 'فوق تخصص' },
            ],
        },
        { name: 'experience', label: 'سابقه کار (سال)', type: 'number', ltr: true },
        { name: 'visitFee', label: 'تعرفه ویزیت (تومان)', type: 'number', ltr: true },
        { name: 'clinicAddress', label: 'آدرس مطب', type: 'textarea', fullWidth: true },
    ],
    lab: [
        { name: 'labName', label: 'نام آزمایشگاه', type: 'text', required: true },
        { name: 'licenseNumber', label: 'شماره مجوز بهره‌برداری', type: 'text', ltr: true, required: true },
        { name: 'technicalManager', label: 'مسئول فنی', type: 'text' },
        { name: 'workHours', label: 'ساعات کاری', type: 'text', placeholder: 'مثال: ۸ تا ۲۰' },
        { name: 'address', label: 'آدرس', type: 'textarea', fullWidth: true },
    ],
    pharmacy: [
        { name: 'pharmacyName', label: 'نام داروخانه', type: 'text', required: true },
        { name: 'licenseNumber', label: 'شماره پروانه تأسیس', type: 'text', ltr: true, required: true },
        { name: 'pharmacist', label: 'مسئول فنی (داروساز)', type: 'text' },
        {
            name: 'shift',
            label: 'نوع شیفت',
            type: 'select',
            options: [
                { value: 'day', label: 'روزانه' },
                { value: 'night', label: 'شبانه‌روزی' },
            ],
        },
        { name: 'workHours', label: 'ساعات کاری', type: 'text', placeholder: 'مثال: ۸ تا ۲۲' },
        { name: 'address', label: 'آدرس', type: 'textarea', fullWidth: true },
    ],
    nurse: [
        { name: 'nursingCode', label: 'شماره نظام پرستاری', type: 'text', ltr: true, required: true },
        { name: 'gender', label: 'جنسیت', type: 'select', options: genderOptions },
        {
            name: 'services',
            label: 'خدمات قابل ارائه',
            type: 'select',
            required: true,
            options: [
                { value: 'injection', label: 'تزریقات و سرم‌تراپی' },
                { value: 'wound', label: 'پانسمان و مراقبت از زخم' },
                { value: 'elderly', label: 'مراقبت از سالمند' },
                { value: 'baby', label: 'مراقبت از نوزاد' },
                { value: 'physio', label: 'فیزیوتراپی' },
                { value: 'general', label: 'مراقبت عمومی' },
            ],
        },
        { name: 'experience', label: 'سابقه کار (سال)', type: 'number', ltr: true },
        { name: 'serviceFee', label: 'تعرفه هر مراجعه (تومان)', type: 'number', ltr: true },
        {
            name: 'coverage',
            label: 'محدوده خدمت‌رسانی',
            type: 'text',
            placeholder: 'مثال: مناطق شمالی تهران',
            fullWidth: true,
        },
    ],
};

