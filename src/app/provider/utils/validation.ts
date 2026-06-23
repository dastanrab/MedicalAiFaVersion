const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toEnglishDigits(value: string): string {
    return value.replace(/[۰-۹]/g, (ch) => String(PERSIAN_DIGITS.indexOf(ch)));
}

export function normalizePhone(value: string): string {
    return toEnglishDigits(value).replace(/\D/g, '').slice(0, 11);
}

export function isValidIranPhone(phone: string): boolean {
    const normalized = normalizePhone(phone);
    return /^09\d{9}$/.test(normalized);
}

export function isValidNationalCode(code: string): boolean {
    const normalized = toEnglishDigits(code).replace(/\D/g, '');
    if (!/^\d{10}$/.test(normalized)) return false;
    if (/^(\d)\1{9}$/.test(normalized)) return false;

    const check = Number(normalized[9]);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += Number(normalized[i]) * (10 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? check === remainder : check === 11 - remainder;
}

export function isNonEmpty(value: string): boolean {
    return value.trim().length > 0;
}

export function isPositiveNumber(value: string | number): boolean {
    const n = typeof value === 'number' ? value : Number(toEnglishDigits(String(value)).replace(/,/g, ''));
    return Number.isFinite(n) && n > 0;
}

export const ALLOWED_RESULT_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];

export const ALLOWED_RESULT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

export const MAX_RESULT_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateResultFile(file: File): string | null {
    if (!file) return 'انتخاب فایل الزامی است';
    if (file.size > MAX_RESULT_FILE_SIZE_BYTES) {
        return 'حجم فایل نباید بیشتر از ۵ مگابایت باشد';
    }
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const typeOk =
        ALLOWED_RESULT_MIME_TYPES.includes(file.type) ||
        ALLOWED_RESULT_EXTENSIONS.includes(ext);
    if (!typeOk) {
        return 'فقط فایل‌های PDF و تصویر (JPG, PNG) مجاز هستند';
    }
    return null;
}
