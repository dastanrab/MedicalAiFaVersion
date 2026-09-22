import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { AppBar } from './AppBar';

interface AppContainerProps {
    children: ReactNode;
    variant?: 'default' | 'transparent';
    showNavbar?: boolean;
    showAppBar?: boolean;
    /** اگر true باشد، محتوای داخلی به‌جای بریده شدن، اسکرول می‌شود */
    scrollable?: boolean;
    /** عرض فریم: phone (پیش‌فرض) | tablet | wide | full */
    size?: 'phone' | 'tablet' | 'wide' | 'full';
    /** اگر true باشد، در حالت phone تحت هر شرایطی Navbar را نمایش می‌دهد */
    forceNavbarOnPhone?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<AppContainerProps['size']>, string> = {
    phone: 'max-w-[550px]',
    tablet: 'max-w-[550px] md:max-w-[820px] lg:max-w-[1000px]',
    wide: 'max-w-[550px] md:max-w-[900px] lg:max-w-[1200px] xl:max-w-[1400px]',
    full: 'max-w-full',
};

export function AppContainer({
                                 children,
                                 variant = 'default',
                                 showNavbar = false,
                                 showAppBar = false,
                                 scrollable = true,
                                 size = 'phone',
                                 forceNavbarOnPhone = true, // به صورت پیش‌فرض فعال شد تا روی phone همیشه نمایش داده شود
                             }: AppContainerProps) {

    // جایگزینی min-h-screen با min-h-[100dvh] برای پشتیبانی صحیح از موبایل
    const outerClass =
        variant === 'transparent'
            ? 'flex min-h-[100dvh] items-center justify-center bg-white'
            : 'flex min-h-[100dvh] items-center justify-center bg-gray-100';

    // جایگزینی h-screen با h-[100dvh] برای جلوگیری از بیرون زدن Navbar از پایین صفحه گوشی
    const frameClass = [
        'relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white',
        SIZE_CLASSES[size],
        variant === 'default' ? 'shadow-lg' : '',
    ].join(' ');

    // شرط نهایی برای نمایش Navbar
    const isNavbarVisible = showNavbar || (forceNavbarOnPhone && size === 'phone');

    return (
        <div className={outerClass}>
            <div className={frameClass}>
                {showAppBar && <AppBar />}
                <div
                    className={
                        scrollable
                            ? 'relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain'
                            : 'relative min-h-0 flex-1 overflow-hidden'
                    }
                >
                    {children}
                </div>
                {isNavbarVisible && <Navbar />}
            </div>
        </div>
    );
}
