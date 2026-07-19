/** Unified user-facing order / request history (fulfillment-focused). */

export type UserRequestServiceType =
  | 'consultation'
  | 'lab'
  | 'pharmacy'
  | 'radiology'
  | 'nurse';

/** Normalized status shown to the patient across all service types. */
export type UserRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type UserRequestStatusGroup = 'all' | 'active' | 'completed' | 'cancelled';

export interface UserRequestOrder {
  id: number;
  code: string;
  title: string;
  serviceType: UserRequestServiceType;
  status: UserRequestStatus;
  providerName: string;
  /** Short summary of items / services requested */
  summary?: string;
  address?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt?: string;
  amount?: number;
  /** Extra detail lines for the detail sheet */
  details?: { label: string; value: string }[];
}

export const serviceTypeLabels: Record<UserRequestServiceType, string> = {
  consultation: 'نوبت پزشک',
  lab: 'آزمایشگاه',
  pharmacy: 'داروخانه',
  radiology: 'رادیولوژی',
  nurse: 'پرستاری',
};

export const requestStatusLabels: Record<UserRequestStatus, string> = {
  pending: 'در انتظار بررسی',
  confirmed: 'تأیید شده',
  in_progress: 'در حال انجام',
  ready: 'آماده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

export const requestStatusStyles: Record<UserRequestStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 ring-blue-200',
  in_progress: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  ready: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-slate-100 text-slate-700 ring-slate-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

export const statusGroupLabels: Record<UserRequestStatusGroup, string> = {
  all: 'همه',
  active: 'فعال',
  completed: 'تکمیل',
  cancelled: 'لغو',
};

const ACTIVE_STATUSES: UserRequestStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'ready',
];

export function matchesStatusGroup(
  status: UserRequestStatus,
  group: UserRequestStatusGroup
): boolean {
  if (group === 'all') return true;
  if (group === 'active') return ACTIVE_STATUSES.includes(status);
  if (group === 'completed') return status === 'completed';
  return status === 'cancelled';
}

export function formatOrderPrice(amount: number): string {
  return amount.toLocaleString('fa-IR');
}

export const mockUserRequestOrders: UserRequestOrder[] = [
  {
    id: 1,
    code: 'REQ-250128-041',
    title: 'نوبت مشاوره آنلاین',
    serviceType: 'consultation',
    status: 'confirmed',
    providerName: 'دکتر سارا محمدی',
    summary: 'تخصص داخلی — مشاوره ویدیویی',
    scheduledAt: '۱۴۰۴/۱۲/۲۹ — ۱۶:۳۰',
    createdAt: '۱۴۰۴/۱۲/۲۸ — ۱۰:۱۵',
    updatedAt: '۱۴۰۴/۱۲/۲۸ — ۱۰:۱۸',
    amount: 350_000,
    details: [
      { label: 'نوع نوبت', value: 'آنلاین' },
      { label: 'مدت جلسه', value: '۲۰ دقیقه' },
    ],
  },
  {
    id: 2,
    code: 'REQ-250127-018',
    title: 'آزمایش خون کامل + قند ناشتا',
    serviceType: 'lab',
    status: 'in_progress',
    providerName: 'آزمایشگاه پارس',
    summary: 'CBC · FBS · نمونه‌گیری در محل',
    address: 'مشهد، بلوار وکیل‌آباد، پلاک ۱۲',
    scheduledAt: '۱۴۰۴/۱۲/۲۸ — ۰۹:۰۰',
    createdAt: '۱۴۰۴/۱۲/۲۷ — ۰۹:۱۵',
    updatedAt: '۱۴۰۴/۱۲/۲۸ — ۰۹:۴۵',
    amount: 800_000,
    details: [
      { label: 'نوع مراجعه', value: 'نمونه‌گیری در محل' },
      { label: 'تعداد آزمایش', value: '۲ مورد' },
    ],
  },
  {
    id: 3,
    code: 'REQ-250126-009',
    title: 'درخواست نسخه دارو',
    serviceType: 'pharmacy',
    status: 'ready',
    providerName: 'داروخانه سلامت',
    summary: '۳ قلم دارو — آماده تحویل',
    address: 'تهران، خیابان ولیعصر',
    createdAt: '۱۴۰۴/۱۲/۲۶ — ۱۸:۴۰',
    updatedAt: '۱۴۰۴/۱۲/۲۸ — ۱۲:۰۰',
    amount: 400_000,
    details: [
      { label: 'وضعیت آماده‌سازی', value: 'آماده تحویل' },
      { label: 'نحوه دریافت', value: 'مراجعه حضوری' },
    ],
  },
  {
    id: 4,
    code: 'REQ-250125-003',
    title: 'ویزیت پرستاری در منزل',
    serviceType: 'nurse',
    status: 'pending',
    providerName: 'مرکز خدمات پرستاری مهر',
    summary: 'تزریق سرم · بررسی علائم حیاتی',
    address: 'مشهد، احمدآباد، خیابان امامت ۱۰',
    scheduledAt: '۱۴۰۴/۱۲/۲۹ — ۱۱:۰۰',
    createdAt: '۱۴۰۴/۱۲/۲۸ — ۱۱:۰۰',
    amount: 550_000,
    details: [
      { label: 'اولویت', value: 'عادی' },
      { label: 'ترجیح جنسیت', value: 'خانم' },
    ],
  },
  {
    id: 5,
    code: 'REQ-250124-012',
    title: 'تصویربرداری سونوگرافی شکم',
    serviceType: 'radiology',
    status: 'confirmed',
    providerName: 'مرکز تصویربرداری نیکان',
    summary: 'سونوگرافی شکم و لگن',
    scheduledAt: '۱۴۰۴/۱۲/۳۰ — ۰۸:۳۰',
    createdAt: '۱۴۰۴/۱۲/۲۴ — ۱۵:۲۰',
    updatedAt: '۱۴۰۴/۱۲/۲۴ — ۱۶:۰۰',
    amount: 1_200_000,
    details: [
      { label: 'نوع تصویربرداری', value: 'سونوگرافی' },
      { label: 'نیاز به آمادگی', value: 'ناشتایی ۸ ساعته' },
    ],
  },
  {
    id: 6,
    code: 'REQ-250120-022',
    title: 'نوبت ویزیت حضوری',
    serviceType: 'consultation',
    status: 'completed',
    providerName: 'دکتر علی رضایی',
    summary: 'تخصص قلب و عروق',
    scheduledAt: '۱۴۰۴/۱۲/۲۲ — ۱۰:۰۰',
    createdAt: '۱۴۰۴/۱۲/۲۰ — ۱۴:۰۰',
    updatedAt: '۱۴۰۴/۱۲/۲۲ — ۱۰:۴۵',
    amount: 280_000,
    details: [
      { label: 'نوع نوبت', value: 'حضوری' },
      { label: 'نتیجه', value: 'ویزیت انجام شد' },
    ],
  },
  {
    id: 7,
    code: 'REQ-250118-007',
    title: 'آزمایش تیروئید',
    serviceType: 'lab',
    status: 'completed',
    providerName: 'آزمایشگاه مهر',
    summary: 'TSH · T3 · T4',
    createdAt: '۱۴۰۴/۱۲/۱۸ — ۰۸:۴۵',
    updatedAt: '۱۴۰۴/۱۲/۲۰ — ۱۱:۳۰',
    amount: 320_000,
    details: [
      { label: 'نتیجه', value: 'آماده و تحویل شده' },
      { label: 'نوع مراجعه', value: 'حضوری' },
    ],
  },
  {
    id: 8,
    code: 'REQ-250115-004',
    title: 'درخواست دارو — نسخه قبلی',
    serviceType: 'pharmacy',
    status: 'cancelled',
    providerName: 'داروخانه مرکزی',
    summary: 'لغو به درخواست کاربر',
    createdAt: '۱۴۰۴/۱۲/۱۵ — ۱۹:۱۰',
    updatedAt: '۱۴۰۴/۱۲/۱۵ — ۲۰:۰۰',
    amount: 180_000,
    details: [
      { label: 'دلیل لغو', value: 'انصراف کاربر' },
    ],
  },
  {
    id: 9,
    code: 'REQ-250112-001',
    title: 'مراقبت پرستاری شبانه',
    serviceType: 'nurse',
    status: 'completed',
    providerName: 'مرکز خدمات پرستاری آریا',
    summary: 'مراقبت شبانه بیمار بستری در منزل',
    address: 'تهران، سعادت‌آباد',
    scheduledAt: '۱۴۰۴/۱۲/۱۳ — ۲۰:۰۰',
    createdAt: '۱۴۰۴/۱۲/۱۲ — ۰۹:۳۰',
    updatedAt: '۱۴۰۴/۱۲/۱۴ — ۰۸:۰۰',
    amount: 1_800_000,
    details: [
      { label: 'مدت خدمت', value: '۱۲ ساعت' },
      { label: 'وضعیت', value: 'انجام و تأیید شده' },
    ],
  },
];
