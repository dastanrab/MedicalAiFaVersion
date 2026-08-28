import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Clock,
    MessageSquare,
    FileText,
    Wallet,
    Star,
    Settings,
    Crown,
    Sparkles,
    type LucideIcon,
} from 'lucide-react';

export interface DoctorNavItem {
    label: string;
    segment: string;
    icon: LucideIcon;
}

export const doctorNavItems: DoctorNavItem[] = [
    { label: 'داشبورد', segment: 'dashboard', icon: LayoutDashboard },
    { label: 'نوبت‌ها', segment: 'appointments', icon: CalendarDays },
   // { label: 'بیماران', segment: 'patients', icon: Users },
    { label: 'برنامه زمانی', segment: 'schedule', icon: Clock },
    { label: 'مشاوره‌ها', segment: 'consultations', icon: MessageSquare },
   // { label: 'نسخه‌ها', segment: 'prescriptions', icon: FileText },
    { label: 'پلن‌ها و اشتراک', segment: 'plans', icon: Crown },
    { label: 'معرفی ویژه VIP', segment: 'vip', icon: Sparkles },
    { label: 'گزارش مالی', segment: 'finance', icon: Wallet },
    { label: 'نظرات و امتیاز', segment: 'reviews', icon: Star },
    { label: 'تنظیمات', segment: 'settings', icon: Settings },
];
