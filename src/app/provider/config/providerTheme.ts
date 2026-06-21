import type { ProviderRole } from './providerNav';
import type { LucideIcon } from 'lucide-react';
import { FlaskConical, Pill, HeartPulse } from 'lucide-react';

export const providerRoleLabels: Record<ProviderRole, string> = {
    lab: 'آزمایشگاه',
    pharmacy: 'داروخانه',
    nurse: 'پرستار در منزل',
};

export const providerThemes: Record<
    ProviderRole,
    { accent: string; accentLight: string; sidebar: string; ring: string; badge: string }
> = {
    lab: {
        accent: 'text-amber-600',
        accentLight: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        sidebar: 'from-amber-500/20 to-orange-500/10 ring-amber-500/20',
        ring: 'ring-amber-500/20',
        badge: 'bg-amber-100 text-amber-700',
    },
    pharmacy: {
        accent: 'text-teal-600',
        accentLight: 'bg-teal-50 text-teal-700 ring-teal-600/20',
        sidebar: 'from-teal-500/20 to-emerald-500/10 ring-teal-500/20',
        ring: 'ring-teal-500/20',
        badge: 'bg-teal-100 text-teal-700',
    },
    nurse: {
        accent: 'text-rose-600',
        accentLight: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        sidebar: 'from-rose-500/20 to-pink-500/10 ring-rose-500/20',
        ring: 'ring-rose-500/20',
        badge: 'bg-rose-100 text-rose-700',
    },
};

export interface ProviderLoginTheme {
    icon: LucideIcon;
    brandGradient: string;
    blurPrimary: string;
    blurSecondary: string;
    iconRing: string;
    iconColor: string;
    iconBg: string;
    buttonGradient: string;
    buttonShadow: string;
    focusBorder: string;
    focusRing: string;
    headline: string;
    description: string;
    loginTitle: string;
    loginSubtitle: string;
    footerNote: string;
    loginImage: string;
    imageOverlay: string;
}

export const providerLoginThemes: Record<ProviderRole, ProviderLoginTheme> = {
    lab: {
        icon: FlaskConical,
        brandGradient: 'from-amber-500 via-orange-600 to-slate-900',
        blurPrimary: 'bg-amber-400/30',
        blurSecondary: 'bg-orange-500/20',
        iconRing: 'ring-amber-200',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50',
        buttonGradient: 'from-amber-500 to-orange-600',
        buttonShadow: 'shadow-amber-600/20',
        focusBorder: 'focus:border-amber-500',
        focusRing: 'focus:ring-amber-500/20',
        headline: 'پنل آزمایشگاه',
        description: 'مدیریت درخواست‌ها، نتایج آزمایش و نمونه‌گیری در منزل از یک داشبورد یکپارچه.',
        loginTitle: 'ورود پنل آزمایشگاه',
        loginSubtitle: 'شماره موبایل ثبت‌شده آزمایشگاه را وارد کنید',
        footerNote: 'این بخش مخصوص آزمایشگاه‌های همکار است.',
        loginImage: '/provider/login-lab.jpg',
        imageOverlay: 'bg-gradient-to-br from-amber-900/80 via-orange-900/70 to-slate-900/85',
    },
    pharmacy: {
        icon: Pill,
        brandGradient: 'from-teal-500 via-emerald-600 to-slate-900',
        blurPrimary: 'bg-teal-400/30',
        blurSecondary: 'bg-emerald-500/20',
        iconRing: 'ring-teal-200',
        iconColor: 'text-teal-600',
        iconBg: 'bg-teal-50',
        buttonGradient: 'from-teal-500 to-emerald-600',
        buttonShadow: 'shadow-teal-600/20',
        focusBorder: 'focus:border-teal-500',
        focusRing: 'focus:ring-teal-500/20',
        headline: 'پنل داروخانه',
        description: 'بررسی نسخه، موجودی دارو و ارسال سفارش‌ها با دسترسی امن و سریع.',
        loginTitle: 'ورود پنل داروخانه',
        loginSubtitle: 'شماره موبایل ثبت‌شده داروخانه را وارد کنید',
        footerNote: 'این بخش مخصوص داروخانه‌های همکار است.',
        loginImage: '/provider/login-pharmacy.jpg',
        imageOverlay: 'bg-gradient-to-br from-teal-900/80 via-emerald-900/70 to-slate-900/85',
    },
    nurse: {
        icon: HeartPulse,
        brandGradient: 'from-rose-500 via-pink-600 to-slate-900',
        blurPrimary: 'bg-rose-400/30',
        blurSecondary: 'bg-pink-500/20',
        iconRing: 'ring-rose-200',
        iconColor: 'text-rose-600',
        iconBg: 'bg-rose-50',
        buttonGradient: 'from-rose-500 to-pink-600',
        buttonShadow: 'shadow-rose-600/20',
        focusBorder: 'focus:border-rose-500',
        focusRing: 'focus:ring-rose-500/20',
        headline: 'پنل پرستار در منزل',
        description: 'مدیریت درخواست‌های پرستاری، برنامه زمانی و محدوده خدمت‌رسانی.',
        loginTitle: 'ورود پنل پرستار',
        loginSubtitle: 'شماره موبایل ثبت‌شده پرستار را وارد کنید',
        footerNote: 'این بخش مخصوص پرستاران همکار است.',
        loginImage: '/provider/login-nurse.jpg',
        imageOverlay: 'bg-gradient-to-br from-rose-900/80 via-pink-900/70 to-slate-900/85',
    },
};

export const providerDefaultNames: Record<ProviderRole, string> = {
    lab: 'آزمایشگاه پارس',
    pharmacy: 'داروخانه سلامت',
    nurse: 'زهرا موسوی',
};
