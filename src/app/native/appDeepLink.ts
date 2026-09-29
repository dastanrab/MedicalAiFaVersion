import { Capacitor } from '@capacitor/core';

export const APP_SCHEME = 'medira';
export const APP_PACKAGE = 'ai.medira.app';

/** صفحه در مرورگر اندروید باز است (نه داخل اپ) */
export function isAndroidBrowser(): boolean {
    return !Capacitor.isNativePlatform() && /Android/i.test(navigator.userAgent);
}

/**
 * لینک intent اندروید برای باز کردن اپ روی medira://payment/result
 * اگر اپ نصب نباشد، کاربر در همین صفحه می‌ماند.
 */
export function buildPaymentReturnIntent(search: string): string {
    const query = search.startsWith('?') ? search : search ? `?${search}` : '';
    const fallback = encodeURIComponent(window.location.href);
    return `intent://payment/result${query}#Intent;scheme=${APP_SCHEME};package=${APP_PACKAGE};S.browser_fallback_url=${fallback};end`;
}

/** تبدیل لینک ورودی اپ (medira://payment/result?...) به مسیر داخلی */
export function deepLinkToPath(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== `${APP_SCHEME}:`) return null;
        // در medira://payment/result، «payment» به عنوان host خوانده می‌شود
        const path = `/${parsed.host}${parsed.pathname}`;
        if (path !== '/payment/result') return null;
        return `${path}${parsed.search}`;
    } catch {
        return null;
    }
}
