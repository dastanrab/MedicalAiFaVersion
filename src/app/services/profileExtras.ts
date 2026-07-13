// اطلاعات تکمیلی پروفایل (کد ملی، بیمه و آدرس‌های منتخب)
// تا زمانی که بک‌اند این فیلدها را ذخیره نکند، به‌صورت محلی و به تفکیک کاربر نگهداری می‌شوند.

export type UserAddress = {
    id: string;
    title: string;
    details: string;
    isDefault: boolean;
};

export type ProfileExtras = {
    nationalCode: string;
    insuranceType: string;
    insuranceNumber: string;
    addresses: UserAddress[];
};

export const INSURANCE_TYPES: { value: string; label: string }[] = [
    { value: 'tamin', label: 'تأمین اجتماعی' },
    { value: 'salamat', label: 'بیمه سلامت' },
    { value: 'mosallah', label: 'نیروهای مسلح' },
    { value: 'takmili', label: 'بیمه تکمیلی' },
    { value: 'other', label: 'سایر' },
    { value: 'none', label: 'بدون بیمه' },
];

export function insuranceTypeLabel(value: string): string {
    return INSURANCE_TYPES.find((t) => t.value === value)?.label ?? value;
}

export const EMPTY_PROFILE_EXTRAS: ProfileExtras = {
    nationalCode: '',
    insuranceType: '',
    insuranceNumber: '',
    addresses: [],
};

const STORAGE_PREFIX = 'profile_extras_';

function storageKey(userId: number | string): string {
    return `${STORAGE_PREFIX}${userId}`;
}

export function loadProfileExtras(userId: number | string): ProfileExtras {
    try {
        const raw = localStorage.getItem(storageKey(userId));
        if (!raw) return { ...EMPTY_PROFILE_EXTRAS };
        const parsed = JSON.parse(raw);
        return {
            nationalCode: typeof parsed.nationalCode === 'string' ? parsed.nationalCode : '',
            insuranceType: typeof parsed.insuranceType === 'string' ? parsed.insuranceType : '',
            insuranceNumber: typeof parsed.insuranceNumber === 'string' ? parsed.insuranceNumber : '',
            addresses: Array.isArray(parsed.addresses)
                ? parsed.addresses.filter(
                      (a: unknown): a is UserAddress =>
                          !!a && typeof a === 'object' && typeof (a as UserAddress).details === 'string',
                  )
                : [],
        };
    } catch {
        return { ...EMPTY_PROFILE_EXTRAS };
    }
}

export function saveProfileExtras(userId: number | string, extras: ProfileExtras): void {
    try {
        localStorage.setItem(storageKey(userId), JSON.stringify(extras));
    } catch {
        // localStorage ممکن است در حالت خصوصی در دسترس نباشد
    }
}

export function createAddressId(): string {
    return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
