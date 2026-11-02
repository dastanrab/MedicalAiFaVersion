import { gregorianToJalali, jalaliToGregorian, formatJalaliDate } from "../components/JalaliCalendarModal";

export interface JalaliDate {
    jy: number;
    jm: number;
    jd: number;
}

export function parseGregorianString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function dateToJalaliKey(date: Date): string {
    const j = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return formatJalaliDate(j);
}

export { gregorianToJalali, jalaliToGregorian, formatJalaliDate };