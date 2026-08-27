import type { ProviderRole } from '../config/providerNav';

export type ProviderPlanId = 'starter' | 'professional' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

export interface ProviderPlan {
    id: ProviderPlanId;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    popular?: boolean;
    features: string[];
}

export interface ProviderPlanDiscountCode {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    maxDiscount?: number;
    description: string;
}

const SHARED_PRICES: Record<ProviderPlanId, { monthly: number; yearly: number }> = {
    starter: { monthly: 0, yearly: 0 },
    professional: { monthly: 890_000, yearly: 8_900_000 },
    enterprise: { monthly: 1_890_000, yearly: 18_900_000 },
};

const FEATURES: Record<ProviderRole, Record<ProviderPlanId, string[]>> = {
    doctor: {
        starter: [
            'پروفایل پزشک در اپلیکیشن',
            'تا ۲۰ نوبت در ماه',
            'مشاوره متنی محدود',
            'گزارش مالی پایه',
            'پشتیبانی استاندارد',
        ],
        professional: [
            'تمام امکانات پلن پایه',
            'نوبت و مشاوره نامحدود',
            'مشاوره تصویری',
            'نمایش ویژه در نتایج جستجو',
            'یادآوری خودکار نوبت برای بیمار',
            'پشتیبانی اولویت‌دار',
        ],
        enterprise: [
            'تمام امکانات پلن حرفه‌ای',
            'چند مطب / کلینیک',
            'دستیار پزشک و مدیریت تیم',
            'گزارش‌های تحلیلی پیشرفته',
            'مدیر اختصاصی حساب',
            'API و یکپارچه‌سازی',
        ],
    },
    lab: {
        starter: [
            'پروفایل آزمایشگاه',
            'تا ۵۰ درخواست در ماه',
            'کاتالوگ محدود آزمایش‌ها',
            'ارسال نتایج از پنل',
            'پشتیبانی استاندارد',
        ],
        professional: [
            'تمام امکانات پلن پایه',
            'درخواست نامحدود',
            'کاتالوگ کامل آزمایش‌ها',
            'اولویت نمایش در جستجوی بیمار',
            'گزارش مالی و خروجی اکسل',
            'پشتیبانی اولویت‌دار',
        ],
        enterprise: [
            'تمام امکانات پلن حرفه‌ای',
            'چند شعبه آزمایشگاه',
            'مدیریت تیم و نمونه‌گیری',
            'گزارش‌های مدیریتی پیشرفته',
            'مدیر اختصاصی حساب',
            'API و یکپارچه‌سازی',
        ],
    },
    pharmacy: {
        starter: [
            'پروفایل داروخانه',
            'تا ۴۰ نسخه در ماه',
            'مدیریت موجودی پایه',
            'گزارش مالی ساده',
            'پشتیبانی استاندارد',
        ],
        professional: [
            'تمام امکانات پلن پایه',
            'نسخه نامحدود',
            'پیگیری ارسال و تحویل',
            'نمایش ویژه در نقشه و جستجو',
            'هشدار کمبود موجودی',
            'پشتیبانی اولویت‌دار',
        ],
        enterprise: [
            'تمام امکانات پلن حرفه‌ای',
            'چند شعبه داروخانه',
            'گزارش‌های فروش پیشرفته',
            'مدیر اختصاصی حساب',
            'اولویت تخصیص سفارش',
            'API و یکپارچه‌سازی',
        ],
    },
    nurse: {
        starter: [
            'پروفایل پرستار / مرکز',
            'تا ۳۰ درخواست در ماه',
            'تقویم خدمات پایه',
            'گزارش مالی ساده',
            'پشتیبانی استاندارد',
        ],
        professional: [
            'تمام امکانات پلن پایه',
            'درخواست نامحدود',
            'مدیریت محدوده خدمت‌رسانی',
            'نمایش ویژه در جستجو',
            'یادآوری نوبت و شیفت',
            'پشتیبانی اولویت‌دار',
        ],
        enterprise: [
            'تمام امکانات پلن حرفه‌ای',
            'مدیریت پرسنل و چند نیرو',
            'گزارش‌های عملکرد تیم',
            'مدیر اختصاصی حساب',
            'اولویت تخصیص درخواست',
            'API و یکپارچه‌سازی',
        ],
    },
};

const DESCRIPTIONS: Record<ProviderPlanId, string> = {
    starter: 'شروع رایگان برای فعالیت در پنل',
    professional: 'مناسب ارائه‌دهندگان فعال با حجم کاری متوسط و بالا',
    enterprise: 'برای مجموعه‌های چندشعبه و نیاز به امکانات سازمانی',
};

export function getProviderPlans(role: ProviderRole): ProviderPlan[] {
    const names: Record<ProviderPlanId, string> = {
        starter: 'پایه',
        professional: 'حرفه‌ای',
        enterprise: 'سازمانی',
    };

    return (['starter', 'professional', 'enterprise'] as const).map((id) => ({
        id,
        name: names[id],
        description: DESCRIPTIONS[id],
        monthlyPrice: SHARED_PRICES[id].monthly,
        yearlyPrice: SHARED_PRICES[id].yearly,
        popular: id === 'professional',
        features: FEATURES[role][id],
    }));
}

export function getProviderPlan(role: ProviderRole, planId: string): ProviderPlan | undefined {
    return getProviderPlans(role).find((plan) => plan.id === planId);
}

export function getPlanPrice(plan: ProviderPlan, cycle: BillingCycle): number {
    return cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
}

export function getYearlySavingsPercent(plan: ProviderPlan): number {
    if (plan.monthlyPrice <= 0) return 0;
    const fullYear = plan.monthlyPrice * 12;
    if (fullYear <= 0) return 0;
    return Math.round((1 - plan.yearlyPrice / fullYear) * 100);
}

export function cycleDurationMs(cycle: BillingCycle): number {
    return cycle === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
}

export function cycleLabel(cycle: BillingCycle): string {
    return cycle === 'yearly' ? 'سالانه' : 'ماهانه';
}

export const providerPlanDiscounts: ProviderPlanDiscountCode[] = [
    {
        code: 'PROVIDER10',
        type: 'percent',
        value: 10,
        description: '۱۰٪ تخفیف اشتراک پروایدر',
    },
    {
        code: 'YEAR20',
        type: 'percent',
        value: 20,
        maxDiscount: 4_000_000,
        description: '۲۰٪ تخفیف ویژه (سقف ۴ میلیون تومان)',
    },
    {
        code: 'WELCOME50',
        type: 'fixed',
        value: 50_000,
        description: '۵۰ هزار تومان تخفیف خوش‌آمدگویی',
    },
];

export function findProviderPlanDiscount(raw: string): ProviderPlanDiscountCode | null {
    const code = raw.trim().toUpperCase();
    if (!code) return null;
    return providerPlanDiscounts.find((item) => item.code === code) ?? null;
}

export function calcProviderPlanDiscount(amount: number, discount: ProviderPlanDiscountCode): number {
    if (amount <= 0) return 0;
    if (discount.type === 'fixed') return Math.min(discount.value, amount);
    const percentAmount = Math.floor((amount * discount.value) / 100);
    if (discount.maxDiscount != null) {
        return Math.min(percentAmount, discount.maxDiscount, amount);
    }
    return Math.min(percentAmount, amount);
}

export const providerPayButtonClass: Record<ProviderRole, string> = {
    lab: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    pharmacy: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20',
    nurse: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
    doctor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
};

export const providerPlanAccent: Record<
    ProviderRole,
    { ring: string; badge: string; text: string; soft: string; popular: string }
> = {
    lab: {
        ring: 'ring-amber-500',
        badge: 'bg-amber-500',
        text: 'text-amber-700',
        soft: 'bg-amber-50 text-amber-800 ring-amber-100',
        popular: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
    },
    pharmacy: {
        ring: 'ring-teal-500',
        badge: 'bg-teal-600',
        text: 'text-teal-700',
        soft: 'bg-teal-50 text-teal-800 ring-teal-100',
        popular: 'border-teal-200 bg-gradient-to-br from-teal-50 to-white',
    },
    nurse: {
        ring: 'ring-rose-500',
        badge: 'bg-rose-600',
        text: 'text-rose-700',
        soft: 'bg-rose-50 text-rose-800 ring-rose-100',
        popular: 'border-rose-200 bg-gradient-to-br from-rose-50 to-white',
    },
    doctor: {
        ring: 'ring-blue-500',
        badge: 'bg-blue-600',
        text: 'text-blue-700',
        soft: 'bg-blue-50 text-blue-800 ring-blue-100',
        popular: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
    },
};
