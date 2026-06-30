import {
    LayoutDashboard,
    ClipboardList,
    FlaskConical,
    CalendarDays,
    Home,
    FileText,
    Wallet,
    Star,
    Settings,
    Headphones,
    Pill,
    Package,
    Truck,
    MapPin,
    Clock,
    Map,
    Users,
    Stethoscope,
    type LucideIcon,
} from 'lucide-react';

export type ProviderRole = 'lab' | 'pharmacy' | 'nurse';
export type NurseAccountType = 'individual' | 'company';

export interface ProviderNavItem {
    label: string;
    segment: string;
    icon: LucideIcon;
    /** فقط برای پنل پرستار — در صورت تعریف، فقط برای این نوع حساب نمایش داده می‌شود */
    nurseAccountTypes?: NurseAccountType[];
}

export const labNavItems: ProviderNavItem[] = [
    { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard },
    { label: 'درخواست‌های آزمایش', segment: 'requests', icon: ClipboardList },
    { label: 'کاتالوگ آزمایش‌ها', segment: 'catalog', icon: FlaskConical },
    { label: 'زمان‌بندی نمونه‌گیری', segment: 'schedule', icon: CalendarDays },
    //{ label: 'نمونه‌گیری در منزل', segment: 'home-sampling', icon: Home },
    { label: 'نتایج آزمایش', segment: 'results', icon: FileText },
    { label: 'گزارش مالی', segment: 'finance', icon: Wallet },
    { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star },
    { label: 'تنظیمات آزمایشگاه', segment: 'settings', icon: Settings },
    //{ label: 'پشتیبانی', segment: 'support', icon: Headphones },
];

export const pharmacyNavItems: ProviderNavItem[] = [
    { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard },
    { label: 'درخواست‌های نسخه', segment: 'requests', icon: Pill },
    { label: 'موجودی داروها', segment: 'inventory', icon: Package },
    { label: 'ارسال / تحویل', segment: 'delivery', icon: Truck },
    { label: 'موقعیت روی نقشه', segment: 'map', icon: MapPin },
    { label: 'گزارش مالی', segment: 'finance', icon: Wallet },
    { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star },
    { label: 'تنظیمات داروخانه', segment: 'settings', icon: Settings },
    { label: 'پشتیبانی', segment: 'support', icon: Headphones },
];

export const nurseNavItems: ProviderNavItem[] = [
    { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard },
    { label: 'تقویم درخواست‌ها', segment: 'calendar', icon: CalendarDays },
    { label: 'لیست درخواست‌ها', segment: 'requests', icon: ClipboardList },
    { label: 'برنامه زمانی من', segment: 'schedule', icon: Clock },
    { label: 'محدوده خدمت‌رسانی', segment: 'coverage', icon: Map },
    { label: 'پرسنل', segment: 'personnel', icon: Users, nurseAccountTypes: ['company'] },
    { label: 'خدمات درمانی', segment: 'services', icon: Stethoscope, nurseAccountTypes: ['company'] },
    { label: 'گزارش مالی', segment: 'finance', icon: Wallet },
    { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star },
    { label: 'تنظیمات پروفایل', segment: 'settings', icon: Settings },
    { label: 'پشتیبانی', segment: 'support', icon: Headphones },
];

export function getNurseNavItems(accountType: NurseAccountType): ProviderNavItem[] {
    return nurseNavItems.filter(
        (item) => !item.nurseAccountTypes || item.nurseAccountTypes.includes(accountType)
    );
}

export const providerNavByRole: Record<ProviderRole, ProviderNavItem[]> = {
    lab: labNavItems,
    pharmacy: pharmacyNavItems,
    nurse: nurseNavItems,
};

export function providerBasePath(role: ProviderRole) {
    return `/provider/${role}`;
}

export function providerPath(role: ProviderRole, segment: string) {
    return `${providerBasePath(role)}/${segment}`;
}
