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
                             }: AppContainerProps) {
    const outerClass =
        variant === 'transparent'
            ? 'flex min-h-screen items-center justify-center bg-white'
            : 'flex min-h-screen items-center justify-center bg-gray-100';

    const frameClass = [
        'relative flex h-screen w-full flex-col overflow-hidden bg-white',
        SIZE_CLASSES[size],
        variant === 'default' ? 'shadow-lg' : '',
    ].join(' ');

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
                {showNavbar && <Navbar />}
            </div>
        </div>
    );
}