import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Clock,
    Star,
    ClipboardList,
    FileUp,
    Pill,
    Package,
    Truck,
    UserCheck,
    Stethoscope,
    type LucideIcon,
} from 'lucide-react';
import type { ProviderRole } from '../../config/providerNav';

/**
 * دسترسی‌های کارمند (منشی / پذیرش).
 * دسترسی‌ها توسط سیستم تعیین می‌شوند و صاحب حساب امکان تغییر آن‌ها را ندارد.
 * گزارش مالی، پلن و اشتراک، VIP، تنظیمات و اطلاعات محرمانه بیمار هرگز در اختیار کارمند نیست.
 */
export type StaffPermission =
    | 'dashboard.view'
    | 'reviews.view'
    // پزشک
    | 'appointments.view'
    | 'appointments.create'
    | 'appointments.reschedule'
    | 'appointments.cancel'
    | 'appointments.checkin'
    | 'patients.contact'
    | 'schedule.view'
    // آزمایشگاه
    | 'lab.requests.view'
    | 'lab.requests.status'
    | 'lab.schedule.view'
    | 'lab.results.upload'
    // داروخانه
    | 'pharmacy.requests.view'
    | 'pharmacy.requests.status'
    | 'pharmacy.inventory.view'
    | 'pharmacy.inventory.stock'
    | 'pharmacy.delivery.manage'
    // پرستار در منزل
    | 'nurse.requests.view'
    | 'nurse.requests.assign'
    | 'nurse.personnel.view'
    | 'nurse.services.view';

export const staffPermissionLabels: Record<StaffPermission, string> = {
    'dashboard.view': 'مشاهده داشبورد کارهای روزانه',
    'reviews.view': 'مشاهده نظرات و امتیاز (فقط خواندنی)',
    'appointments.view': 'مشاهده لیست نوبت‌ها',
    'appointments.create': 'ثبت نوبت حضوری',
    'appointments.reschedule': 'جابه‌جایی زمان نوبت',
    'appointments.cancel': 'لغو نوبت',
    'appointments.checkin': 'ثبت حضور بیمار در مطب',
    'patients.contact': 'مشاهده نام و شماره تماس بیماران',
    'schedule.view': 'مشاهده برنامه زمانی (فقط خواندنی)',
    'lab.requests.view': 'مشاهده درخواست‌های آزمایش',
    'lab.requests.status': 'تأیید درخواست و تغییر وضعیت نمونه',
    'lab.schedule.view': 'مشاهده زمان‌بندی نمونه‌گیری',
    'lab.results.upload': 'آپلود فایل جواب (انتشار با مسئول فنی)',
    'pharmacy.requests.view': 'مشاهده درخواست‌های نسخه',
    'pharmacy.requests.status': 'تغییر وضعیت آماده‌سازی نسخه',
    'pharmacy.inventory.view': 'مشاهده موجودی داروها',
    'pharmacy.inventory.stock': 'به‌روزرسانی تعداد موجودی',
    'pharmacy.delivery.manage': 'مدیریت ارسال و تحویل',
    'nurse.requests.view': 'مشاهده درخواست‌های پرستاری',
    'nurse.requests.assign': 'تعیین پرستار برای درخواست',
    'nurse.personnel.view': 'مشاهده لیست پرسنل (فقط خواندنی)',
    'nurse.services.view': 'مشاهده خدمات درمانی (فقط خواندنی)',
};

export interface StaffRoleConfig {
    /** عنوان شغلی کارمند در این پنل */
    title: string;
    permissions: StaffPermission[];
    /** مواردی که کارمند به آن دسترسی ندارد — برای نمایش به صاحب حساب */
    restrictions: string[];
}

const commonRestrictions = [
    'گزارش مالی و درآمد',
    'پلن‌ها، اشتراک و معرفی ویژه VIP',
    'تنظیمات حساب و پروفایل',
    'اطلاعات محرمانه بیمار',
];

export const staffRoleConfig: Record<ProviderRole, StaffRoleConfig> = {
    doctor: {
        title: 'منشی مطب',
        permissions: [
            'dashboard.view',
            'appointments.view',
            'appointments.create',
            'appointments.reschedule',
            'appointments.cancel',
            'appointments.checkin',
            'patients.contact',
            'schedule.view',
            'reviews.view',
        ],
        restrictions: [
            ...commonRestrictions,
            'پرونده پزشکی، نتایج هوش مصنوعی و نسخه‌ها',
            'مشاوره‌ها و گفتگو با بیمار',
            'ویرایش برنامه زمانی',
        ],
    },
    lab: {
        title: 'پذیرش آزمایشگاه',
        permissions: [
            'dashboard.view',
            'lab.requests.view',
            'lab.requests.status',
            'lab.schedule.view',
            'lab.results.upload',
            'reviews.view',
        ],
        restrictions: [
            ...commonRestrictions,
            'مشاهده محتوای جواب آزمایش و انتشار آن برای بیمار',
            'کاتالوگ و قیمت آزمایش‌ها',
            'قوانین نوبت‌دهی',
        ],
    },
    pharmacy: {
        title: 'کارمند داروخانه',
        permissions: [
            'dashboard.view',
            'pharmacy.requests.view',
            'pharmacy.requests.status',
            'pharmacy.inventory.view',
            'pharmacy.inventory.stock',
            'pharmacy.delivery.manage',
            'reviews.view',
        ],
        restrictions: [
            ...commonRestrictions,
            'تشخیص و توضیحات پزشک در نسخه',
            'تغییر قیمت داروها',
            'موقعیت روی نقشه',
        ],
    },
    nurse: {
        title: 'اپراتور مرکز پرستاری',
        permissions: [
            'dashboard.view',
            'nurse.requests.view',
            'nurse.requests.assign',
            'nurse.personnel.view',
            'nurse.services.view',
            'reviews.view',
        ],
        restrictions: [
            ...commonRestrictions,
            'گزارش ویزیت و شرح حال بیمار',
            'افزودن یا ویرایش پرسنل و خدمات',
            'محدوده خدمت‌رسانی',
        ],
    },
};

export interface StaffNavItem {
    label: string;
    segment: string;
    icon: LucideIcon;
    permission: StaffPermission;
}

export const staffNavByRole: Record<ProviderRole, StaffNavItem[]> = {
    doctor: [
        { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
        { label: 'نوبت‌ها', segment: 'appointments', icon: CalendarDays, permission: 'appointments.view' },
        { label: 'بیماران', segment: 'patients', icon: Users, permission: 'patients.contact' },
        { label: 'برنامه زمانی', segment: 'schedule', icon: Clock, permission: 'schedule.view' },
        { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star, permission: 'reviews.view' },
    ],
    lab: [
        { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
        { label: 'درخواست‌های آزمایش', segment: 'requests', icon: ClipboardList, permission: 'lab.requests.view' },
        { label: 'زمان‌بندی نمونه‌گیری', segment: 'schedule', icon: CalendarDays, permission: 'lab.schedule.view' },
        { label: 'آپلود جواب', segment: 'results', icon: FileUp, permission: 'lab.results.upload' },
        { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star, permission: 'reviews.view' },
    ],
    pharmacy: [
        { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
        { label: 'درخواست‌های نسخه', segment: 'requests', icon: Pill, permission: 'pharmacy.requests.view' },
        { label: 'موجودی داروها', segment: 'inventory', icon: Package, permission: 'pharmacy.inventory.view' },
        { label: 'ارسال / تحویل', segment: 'delivery', icon: Truck, permission: 'pharmacy.delivery.manage' },
        { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star, permission: 'reviews.view' },
    ],
    nurse: [
        { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
        { label: 'لیست درخواست‌ها', segment: 'requests', icon: ClipboardList, permission: 'nurse.requests.view' },
        { label: 'پرسنل', segment: 'personnel', icon: UserCheck, permission: 'nurse.personnel.view' },
        { label: 'خدمات درمانی', segment: 'services', icon: Stethoscope, permission: 'nurse.services.view' },
        { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star, permission: 'reviews.view' },
    ],
};

export function getStaffNavItems(role: ProviderRole): StaffNavItem[] {
    const allowed = staffRoleConfig[role].permissions;
    return staffNavByRole[role].filter((item) => allowed.includes(item.permission));
}

export function staffHasPermission(role: ProviderRole, permission: StaffPermission): boolean {
    return staffRoleConfig[role].permissions.includes(permission);
}

export function staffBasePath(role: ProviderRole) {
    return `/provider/${role}/staff`;
}

export function staffPath(role: ProviderRole, segment: string) {
    return `${staffBasePath(role)}/${segment}`;
}
