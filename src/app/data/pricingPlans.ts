export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  popular?: boolean;
  features: string[];
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'پایه',
    price: 'رایگان',
    features: [
      'دسترسی به امکانات پایه',
      'تحلیل سلامت محدود',
      'پشتیبانی استاندارد',
    ],
  },
  {
    id: 'pro',
    name: 'پرو',
    price: '۹۹,۰۰۰ تومان/ماه',
    popular: true,
    features: [
      'تمام امکانات پایه',
      'تحلیل پیشرفته سلامت',
      'مشاوره آنلاین',
      'برنامه غذایی شخصی‌سازی شده',
      'پشتیبانی اولویت‌دار',
    ],
  },
  {
    id: 'premium',
    name: 'ویژه',
    price: '۱۹۹,۰۰۰ تومان/ماه',
    features: [
      'تمام امکانات پرو',
      'مشاوره تخصصی نامحدود',
      'برنامه ورزشی اختصاصی',
      'پیگیری ۲۴/۷',
      'گزارش‌های تخصصی ماهانه',
      'دسترسی به متخصصین',
    ],
  },
];
