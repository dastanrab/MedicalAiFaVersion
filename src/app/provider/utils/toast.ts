import { toast } from 'sonner';

/** نمایش خطای ورود / عملیات در صفحات لاگین provider */
export function showProviderError(message: string) {
    toast.error(message, {
        id: 'provider-login-error',
    });
}

/** پیام موفقیت اختیاری برای صفحات لاگین provider */
export function showProviderSuccess(message: string) {
    toast.success(message, {
        id: 'provider-login-success',
    });
}
