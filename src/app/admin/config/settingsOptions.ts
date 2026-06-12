import { Instagram, Send, Youtube, type LucideIcon } from 'lucide-react';

export type SocialPlatform = 'instagram' | 'telegram' | 'youtube';
export type AdminRole = 'super_admin' | 'operator';
export type ServiceModuleId = 'labs' | 'pharmacy' | 'radiology' | 'nurseHome';

export interface SocialLinkSetting {
    id: string;
    platform: SocialPlatform;
    label: string;
    href: string;
    enabled: boolean;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface AdminAccount {
    id: string;
    name: string;
    phone: string;
    role: AdminRole;
    avatar?: string | null;
    createdAt: string;
}

export interface AppSettings {
    general: {
        appName: string;
        logoUrl: string | null;
        socialLinks: SocialLinkSetting[];
    };
    auth: {
        otpLength: number;
        otpExpiryMinutes: number;
        resendCooldownSeconds: number;
        accessTokenExpiryHours: number;
        refreshTokenExpiryDays: number;
    };
    content: {
        welcomeText: string;
        aboutText: string;
        faq: FaqItem[];
    };
    services: Record<ServiceModuleId, boolean>;
    admins: AdminAccount[];
}

export const socialPlatformIcons: Record<SocialPlatform, LucideIcon> = {
    instagram: Instagram,
    telegram: Send,
    youtube: Youtube,
};

export const socialPlatformColors: Record<SocialPlatform, string> = {
    instagram: 'hover:text-pink-400',
    telegram: 'hover:text-sky-400',
    youtube: 'hover:text-red-400',
};

export const adminRoleLabels: Record<AdminRole, string> = {
    super_admin: 'مدیر ارشد',
    operator: 'اپراتور',
};

export const adminRoleStyles: Record<AdminRole, string> = {
    super_admin: 'bg-violet-100 text-violet-700',
    operator: 'bg-sky-100 text-sky-700',
};

export const serviceModuleLabels: Record<ServiceModuleId, string> = {
    labs: 'آزمایشگاه',
    pharmacy: 'داروخانه',
    radiology: 'رادیولوژی',
    nurseHome: 'پرستار در منزل',
};

export const serviceModulePaths: Record<ServiceModuleId, string> = {
    labs: '/services/labs',
    pharmacy: '/services/pharmacy',
    radiology: '/services/radiology',
    nurseHome: '/services/nurse-home',
};

export const settingsTabs = [
    { id: 'general', label: 'عمومی', path: '/admin/settings/general' },
    { id: 'auth', label: 'احراز و امنیت', path: '/admin/settings/auth' },
    { id: 'content', label: 'محتوا', path: '/admin/settings/content' },
    { id: 'services', label: 'خدمات', path: '/admin/settings/services' },
    { id: 'admins', label: 'مدیران', path: '/admin/settings/admins' },
    { id: 'profile', label: 'پروفایل من', path: '/admin/settings/profile' },
] as const;

export const defaultSettings: AppSettings = {
    general: {
        appName: 'مدیرا AI',
        logoUrl: null,
        socialLinks: [
            {
                id: 'instagram',
                platform: 'instagram',
                label: 'اینستاگرام',
                href: 'https://instagram.com',
                enabled: true,
            },
            {
                id: 'telegram',
                platform: 'telegram',
                label: 'تلگرام',
                href: 'https://telegram.org',
                enabled: true,
            },
            {
                id: 'youtube',
                platform: 'youtube',
                label: 'یوتیوب',
                href: 'https://youtube.com',
                enabled: true,
            },
        ],
    },
    auth: {
        otpLength: 4,
        otpExpiryMinutes: 2,
        resendCooldownSeconds: 60,
        accessTokenExpiryHours: 24,
        refreshTokenExpiryDays: 30,
    },
    content: {
        welcomeText: 'به سامانه سلامت هوشمند مدیرا خوش آمدید.',
        aboutText:
            'مدیرا AI پلتفرمی برای تشخیص اولیه، مشاوره پزشکی و دسترسی به خدمات درمانی در منزل است.',
        faq: [
            {
                id: '1',
                question: 'چگونه با پزشک مشاوره بگیرم؟',
                answer: 'از بخش پزشکان، پزشک مورد نظر را انتخاب کرده و نوبت آنلاین رزرو کنید.',
            },
            {
                id: '2',
                question: 'آیا اطلاعات پزشکی من محرمانه است؟',
                answer: 'بله. تمام اطلاعات با رمزنگاری ذخیره و فقط برای ارائه خدمات استفاده می‌شود.',
            },
            {
                id: '3',
                question: 'خدمات آزمایش در منزل چگونه کار می‌کند؟',
                answer: 'از بخش خدمات، آزمایشگاه را انتخاب کرده و زمان نمونه‌گیری را رزرو کنید.',
            },
        ],
    },
    services: {
        labs: true,
        pharmacy: true,
        radiology: true,
        nurseHome: true,
    },
    admins: [
        {
            id: '1',
            name: 'علی محمدی',
            phone: '09120000001',
            role: 'super_admin',
            createdAt: '1403/01/15',
        },
        {
            id: '2',
            name: 'سارا احمدی',
            phone: '09120000002',
            role: 'operator',
            createdAt: '1403/03/20',
        },
    ],
};
