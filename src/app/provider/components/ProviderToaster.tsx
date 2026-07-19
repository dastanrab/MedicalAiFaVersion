import { Toaster } from 'sonner';

/** Toast سراسری پنل‌های provider — RTL و فونت پروژه */
export function ProviderToaster() {
    return (
        <Toaster
            position="top-center"
            dir="rtl"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
                className: 'font-[YekanBakhFaNum]',
            }}
        />
    );
}
