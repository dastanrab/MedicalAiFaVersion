// توابع تبدیل تاریخ شمسی (جلالی) با Intl

export function toGregorianString(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getPersianParts(date: Date): { day: number; month: number; year: number } {
    try {
        const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
        const parts = formatter.formatToParts(date);
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
        const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
        const year = parseInt(parts.find(p => p.type === 'year')?.value || '1403', 10);
        return { day, month, year };
    } catch {
        // Fallback تقریبی
        return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() - 621 };
    }
}

export function getPersianMonthKey(date: Date): string {
    const { year, month } = getPersianParts(date);
    return `${year}-${month}`;
}

export function getPersianMonthDisplay(date: Date): string {
    try {
        return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
            month: 'long',
            year: 'numeric',
        }).format(date);
    } catch {
        const { year, month } = getPersianParts(date);
        return `ماه ${month} - ${year}`;
    }
}

export function formatPersianDate(date: Date): string {
    try {
        return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    } catch {
        const { day, month, year } = getPersianParts(date);
        return `${day} ${month} ${year}`;
    }
}

export function findFirstDayOfPersianMonth(date: Date): Date {
    const key = getPersianMonthKey(date);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    while (getPersianMonthKey(d) === key) {
        d.setDate(d.getDate() - 1);
    }
    d.setDate(d.getDate() + 1);
    return d;
}

export function shiftPersianMonth(start: Date, delta: number): Date {
    const d = new Date(start);
    d.setDate(d.getDate() + delta * 30); // تقریب برای تغییر ماه
    return findFirstDayOfPersianMonth(d);
}