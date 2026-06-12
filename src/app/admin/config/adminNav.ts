import {
    LayoutDashboard,
    Users,
    Stethoscope,
    CalendarCheck,
    MessagesSquare,
    CreditCard,
    BarChart3,
    Settings,
    Instagram,
    Send,
    Youtube,
    BadgeCheck,
    Sparkles,
    HeartPulse,
    BookOpen,
    Crown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AdminNavItem {
    icon: LucideIcon;
    label: string;
    path: string;
}

export const adminNavItems: AdminNavItem[] = [
    { icon: LayoutDashboard, label: 'داشبورد', path: '/admin/dashboard' },
    { icon: Users, label: 'کاربران', path: '/admin/users' },
    { icon: BadgeCheck, label: 'تأیید ارائه‌دهندگان', path: '/admin/verifications' },
    { icon: Stethoscope, label: 'پزشکان و ارائه‌دهندگان', path: '/admin/providers' },
    { icon: CalendarCheck, label: 'نوبت‌ها', path: '/admin/appointments' },
    { icon: MessagesSquare, label: 'گفتگوها', path: '/admin/chats' },
    { icon: CreditCard, label: 'پرداخت‌ها', path: '/admin/payments' },
    { icon: Crown, label: 'اشتراک‌ها', path: '/admin/subscriptions' },
    { icon: Sparkles, label: 'تشخیص هوشمند', path: '/admin/ai-sessions' },
    { icon: HeartPulse, label: 'خدمات درمانی', path: '/admin/services' },
    { icon: BookOpen, label: 'محتوای سلامت', path: '/admin/health-content' },
    { icon: BarChart3, label: 'گزارش‌ها', path: '/admin/reports' },
    { icon: Settings, label: 'تنظیمات', path: '/admin/settings' },
];

export interface SocialLink {
    icon: LucideIcon;
    label: string;
    href: string;
    color: string;
}

export const adminSocialLinks: SocialLink[] = [
    {
        icon: Instagram,
        label: 'اینستاگرام',
        href: 'https://instagram.com',
        color: 'hover:text-pink-400',
    },
    {
        icon: Send,
        label: 'تلگرام',
        href: 'https://telegram.org',
        color: 'hover:text-sky-400',
    },
    {
        icon: Youtube,
        label: 'یوتیوب',
        href: 'https://youtube.com',
        color: 'hover:text-red-400',
    },
];
