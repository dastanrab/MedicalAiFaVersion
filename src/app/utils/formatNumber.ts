const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const faFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });

/**
 * Converts API/UI values (number, "100000.00", "۱۰۰,۰۰۰", null, ...) to a number.
 * Returns NaN when the value cannot be parsed.
 */
export function toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (value == null) return NaN;
    const normalized = String(value)
        .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
        .replace(/[,،٬\s]/g, '')
        .replace('٫', '.');
    if (normalized === '') return NaN;
    return Number(normalized);
}

/** Persian digits with thousands separators, e.g. "100000.00" → "۱۰۰٬۰۰۰". */
export function formatFaNumber(value: unknown, fallback = '۰'): string {
    const n = toNumber(value);
    if (!Number.isFinite(n)) return fallback;
    return faFormatter.format(n);
}

/** Price (without currency), e.g. 100000 → "۱۰۰٬۰۰۰". */
export function formatPrice(value: unknown, fallback = '۰'): string {
    return formatFaNumber(value, fallback);
}

/** Price with "تومان" suffix. */
export function formatToman(value: unknown, fallback = '۰'): string {
    return `${formatPrice(value, fallback)} تومان`;
}

/** Value shown inside a price <input>, e.g. "100000.00" → "100,000". Empty when not a number. */
export function formatPriceInput(value: unknown): string {
    if (value === '' || value == null) return '';
    const n = toNumber(value);
    if (!Number.isFinite(n)) return '';
    return Math.trunc(n).toLocaleString('en-US');
}

/** Raw digits typed into a price <input> (accepts Persian/Arabic digits and separators). */
export function parsePriceInput(text: string): string {
    return text
        .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
        .replace(/[^\d]/g, '');
}
