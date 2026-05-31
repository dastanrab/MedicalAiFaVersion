export type UserType = 'normal' | 'doctor' | 'pharmacy' | 'lab' | 'nurse';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export const userTypeLabels: Record<UserType, string> = {
    normal: 'کاربر عادی',
    doctor: 'پزشک',
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
    normal: 'bg-slate-100 text-slate-700',
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

export const mockUsers: AdminUserRow[] = [
    { id: 1, firstName: 'سارا', lastName: 'احمدی', type: 'normal', phone: '09121234567', status: 'active', avatar: 'https://i.pravatar.cc/100?img=1', province: 'تهران', city: 'تهران', isVerified: true },
    { id: 2, firstName: 'دکتر رضا', lastName: 'موسوی', type: 'doctor', phone: '09122345678', status: 'active', avatar: 'https://i.pravatar.cc/100?img=12', province: 'اصفهان', city: 'اصفهان', isVerified: true },
    { id: 3, firstName: 'داروخانه', lastName: 'مرکزی', type: 'pharmacy', phone: '09123456789', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=33', province: 'فارس', city: 'شیراز', isVerified: false },
    { id: 4, firstName: 'آزمایشگاه', lastName: 'پارس', type: 'lab', phone: '09124567890', status: 'active', avatar: 'https://i.pravatar.cc/100?img=45', province: 'خراسان رضوی', city: 'مشهد', isVerified: true },
    { id: 5, firstName: 'مریم', lastName: 'کریمی', type: 'normal', phone: '09125678901', status: 'blocked', avatar: 'https://i.pravatar.cc/100?img=5', province: 'تهران', city: 'ری', isVerified: false },
    { id: 6, firstName: 'دکتر نازنین', lastName: 'حسینی', type: 'doctor', phone: '09126789012', status: 'active', avatar: 'https://i.pravatar.cc/100?img=20', province: 'گیلان', city: 'رشت', isVerified: true },
    { id: 7, firstName: 'محمد', lastName: 'رحیمی', type: 'normal', phone: '09127890123', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=15', province: 'آذربایجان شرقی', city: 'تبریز', isVerified: false },
    { id: 8, firstName: 'داروخانه', lastName: 'سلامت', type: 'pharmacy', phone: '09128901234', status: 'active', avatar: 'https://i.pravatar.cc/100?img=60', province: 'خوزستان', city: 'اهواز', isVerified: true },
    { id: 9, firstName: 'علی', lastName: 'نوری', type: 'normal', phone: '09129012345', status: 'active', avatar: 'https://i.pravatar.cc/100?img=8', province: 'اصفهان', city: 'کاشان', isVerified: true },
    { id: 10, firstName: 'دکتر سینا', lastName: 'قاسمی', type: 'doctor', phone: '09120123456', status: 'active', avatar: 'https://i.pravatar.cc/100?img=11', province: 'تهران', city: 'تهران', isVerified: true },
    { id: 11, firstName: 'فاطمه', lastName: 'زارعی', type: 'normal', phone: '09131234567', status: 'blocked', avatar: 'https://i.pravatar.cc/100?img=9', province: 'فارس', city: 'مرودشت', isVerified: false },
    { id: 12, firstName: 'آزمایشگاه', lastName: 'نوین', type: 'lab', phone: '09132345678', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=50', province: 'گیلان', city: 'لاهیجان', isVerified: false },
    { id: 13, firstName: 'حسین', lastName: 'صادقی', type: 'normal', phone: '09133456789', status: 'active', avatar: 'https://i.pravatar.cc/100?img=13', province: 'خراسان رضوی', city: 'نیشابور', isVerified: true },
    { id: 14, firstName: 'داروخانه', lastName: 'شفا', type: 'pharmacy', phone: '09134567890', status: 'active', avatar: 'https://i.pravatar.cc/100?img=53', province: 'تهران', city: 'شهریار', isVerified: true },
    { id: 15, firstName: 'دکتر لیلا', lastName: 'اکبری', type: 'doctor', phone: '09135678901', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=24', province: 'آذربایجان شرقی', city: 'مراغه', isVerified: false },
    { id: 16, firstName: 'زهرا', lastName: 'محمدی', type: 'nurse', phone: '09136789012', status: 'active', avatar: 'https://i.pravatar.cc/100?img=32', province: 'تهران', city: 'تهران', isVerified: true, details: { nursingCode: '85412', gender: 'female', services: 'elderly', experience: '8', serviceFee: '350000' } },
    { id: 17, firstName: 'نرگس', lastName: 'یوسفی', type: 'nurse', phone: '09137890123', status: 'active', avatar: 'https://i.pravatar.cc/100?img=26', province: 'اصفهان', city: 'اصفهان', isVerified: true, details: { nursingCode: '67234', gender: 'female', services: 'injection', experience: '5', serviceFee: '250000' } },
    { id: 18, firstName: 'امیر', lastName: 'کاظمی', type: 'nurse', phone: '09138901234', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=18', province: 'خراسان رضوی', city: 'مشهد', isVerified: false, details: { nursingCode: '49120', gender: 'male', services: 'wound', experience: '3', serviceFee: '200000' } },
];
