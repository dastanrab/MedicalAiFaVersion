export type ChatStatus = 'open' | 'closed';

export type CounterpartyType = 'doctor' | 'support';

export type ChatFlag = 'none' | 'violation' | 'referred';

export const chatStatusLabels: Record<ChatStatus, string> = {
    open: 'باز',
    closed: 'بسته',
};

export const chatStatusStyles: Record<ChatStatus, string> = {
    open: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    closed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export const counterpartyTypeLabels: Record<CounterpartyType, string> = {
    doctor: 'پزشک',
    support: 'پشتیبانی',
};

export const counterpartyTypeStyles: Record<CounterpartyType, string> = {
    doctor: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    support: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

/** کلاس یکسان برای chip نوع طرف مقابل در جدول */
export const counterpartyTypeChipClass =
    'inline-flex h-5 w-20 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ring-1 ring-inset';

export const chatFlagLabels: Record<ChatFlag, string> = {
    none: '—',
    violation: 'تخلف',
    referred: 'ارجاع به پشتیبانی',
};

export const chatFlagStyles: Record<Exclude<ChatFlag, 'none'>, string> = {
    violation: 'bg-red-50 text-red-700 ring-red-600/20',
    referred: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export interface AdminChatMessage {
    id: number;
    sender: 'user' | 'counterparty' | 'system';
    senderName: string;
    message: string;
    sentAt: string;
    /** پیام حاوی اطلاعات حساس پزشکی یا شخصی */
    isSensitive?: boolean;
}

export interface AdminChatRow {
    id: number;
    roomId: number;
    patientName: string;
    patientPhone: string;
    counterpartyName: string;
    counterpartyType: CounterpartyType;
    counterpartyId?: number;
    lastMessage: string;
    lastMessageAt: string;
    status: ChatStatus;
    flag: ChatFlag;
    messageCount: number;
    messages: AdminChatMessage[];
    province?: string;
    city?: string;
    appointmentId?: number;
}

/** ماسک شماره موبایل برای نمایش در لیست (حریم خصوصی) */
export function maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) return phone;
    return `${digits.slice(0, 4)}***${digits.slice(-4)}`;
}

/** ماسک متن حساس در پیش‌نمایش */
export function maskSensitiveText(text: string, reveal: boolean): string {
    if (reveal) return text;
    if (text.length <= 8) return '••••••••';
    return `${text.slice(0, 4)}…${text.slice(-2)}`;
}
