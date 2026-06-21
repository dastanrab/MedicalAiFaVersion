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
    type LucideIcon,
} from 'lucide-react';

export type ProviderRole = 'lab' | 'pharmacy' | 'nurse';

export interface ProviderNavItem {
    label: string;
    segment: string;
    icon: LucideIcon;
}

export const labNavItems: ProviderNavItem[] = [
    { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard },
    { label: 'درخواست‌های آزمایش', segment: 'requests', icon: ClipboardList },
    { label: 'کاتالوگ آزمایش‌ها', segment: 'catalog', icon: FlaskConical },
    { label: 'زمان‌بندی نمونه‌گیری', segment: 'schedule', icon: CalendarDays },
    { label: 'نمونه‌گیری در منزل', segment: 'home-sampling', icon: Home },
    { label: 'نتایج آزمایش', segment: 'results', icon: FileText },
    { label: 'گزارش مالی', segment: 'finance', icon: Wallet },
    { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star },
    { label: 'تنظیمات آزمایشگاه', segment: 'settings', icon: Settings },
    { label: 'پشتیبانی', segment: 'support', icon: Headphones },
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
    { label: 'درخواست‌های پرستاری', segment: 'requests', icon: ClipboardList },
    { label: 'برنامه زمانی من', segment: 'schedule', icon: Clock },
    { label: 'محدوده خدمت‌رسانی', segment: 'coverage', icon: Map },
    { label: 'گزارش مالی', segment: 'finance', icon: Wallet },
    { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star },
    { label: 'تنظیمات پروفایل', segment: 'settings', icon: Settings },
    { label: 'پشتیبانی', segment: 'support', icon: Headphones },
];

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
