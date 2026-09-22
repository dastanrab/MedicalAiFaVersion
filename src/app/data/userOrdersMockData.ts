/** Unified user-facing order / request history (fulfillment-focused). */

export type UserRequestServiceType =
  | 'consultation'
  | 'lab'
  | 'pharmacy'
  | 'radiology'
  | 'nurse'
    | 'chat';

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
  order_id:number;
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
  rawStatus: string | number; // <--- این خط اضافه شود

}

export const serviceTypeLabels: Record<UserRequestServiceType, string> = {
  consultation: 'نوبت پزشک',
  lab: 'آزمایشگاه',
  pharmacy: 'داروخانه',
  radiology: 'رادیولوژی',
  nurse: 'پرستاری',
  chat: 'مشاوره متنی', // <-- اضافه شد
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


