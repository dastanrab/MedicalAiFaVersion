import {
    toJalaali,
    toGregorian,
    jalaaliMonthLength,
    isLeapJalaaliYear,
} from 'jalaali-js';

export interface JalaliDate {
    jy: number;
    jm: number;
    jd: number;
}

export const PERSIAN_MONTHS = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
] as const;

export const PERSIAN_WEEKDAYS = [
    'شنبه',
    'یکشنبه',
    'دوشنبه',
    'سه‌شنبه',
    'چهارشنبه',
    'پنجشنبه',
    'جمعه',
] as const;

export const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

export function todayJalali(): JalaliDate {
    const now = new Date();
    return toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function formatJalali(d: JalaliDate, separator = '/'): string {
    const jm = String(d.jm).padStart(2, '0');
    const jd = String(d.jd).padStart(2, '0');
    return `${d.jy}${separator}${jm}${separator}${jd}`;
}

export function parseJalaliDate(value: string): JalaliDate | null {
    const match = value.trim().match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (!match) return null;
    const jy = Number(match[1]);
    const jm = Number(match[2]);
    const jd = Number(match[3]);
    if (jm < 1 || jm > 12 || jd < 1 || jd > jalaaliMonthLength(jy, jm)) return null;
    return { jy, jm, jd };
}

export function parseScheduledAt(scheduledAt: string): { date: JalaliDate; time: string } | null {
    const [datePart, timePart] = scheduledAt.split('—').map((s) => s.trim());
    const date = parseJalaliDate(datePart);
    if (!date) return null;
    return { date, time: timePart ?? '' };
}

export function jalaliToKey(d: JalaliDate): string {
    return formatJalali(d);
}

export function isSameJalaliDay(a: JalaliDate, b: JalaliDate): boolean {
    return a.jy === b.jy && a.jm === b.jm && a.jd === b.jd;
}

export function addJalaliMonths(d: JalaliDate, delta: number): JalaliDate {
    let jy = d.jy;
    let jm = d.jm + delta;
    while (jm > 12) {
        jm -= 12;
        jy += 1;
    }
    while (jm < 1) {
        jm += 12;
        jy -= 1;
    }
    const maxDay = jalaaliMonthLength(jy, jm);
    return { jy, jm, jd: Math.min(d.jd, maxDay) };
}

export function getMonthGrid(year: number, month: number): (JalaliDate | null)[][] {
    const daysInMonth = jalaaliMonthLength(year, month);
    const firstGregorian = toGregorian(year, month, 1);
    const firstDate = new Date(firstGregorian.gy, firstGregorian.gm - 1, firstGregorian.gd);
    const jsDay = firstDate.getDay();
    const startOffset = (jsDay + 1) % 7;

    const cells: (JalaliDate | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let jd = 1; jd <= daysInMonth; jd++) {
        cells.push({ jy: year, jm: month, jd });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (JalaliDate | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

export function compareJalaliDates(a: JalaliDate, b: JalaliDate): number {
    if (a.jy !== b.jy) return a.jy - b.jy;
    if (a.jm !== b.jm) return a.jm - b.jm;
    return a.jd - b.jd;
}

export function isJalaliLeapYear(year: number): boolean {
    return isLeapJalaaliYear(year);
}

export function toFaDigits(value: string | number): string {
    return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}
