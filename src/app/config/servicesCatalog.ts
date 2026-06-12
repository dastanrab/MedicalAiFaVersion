import {
    TestTube,
    Pill,
    ScanLine,
    Home as HomeIcon,
    type LucideIcon,
} from 'lucide-react';
import type { ServiceModuleId } from '../admin/config/settingsOptions';

export interface ServiceCatalogItem {
    id: ServiceModuleId;
    title: string;
    desc: string;
    path: string;
    icon: LucideIcon;
    gradient: string;
}

export const servicesCatalog: ServiceCatalogItem[] = [
    {
        id: 'labs',
        title: 'آزمایشگاه',
        desc: 'نمونه‌گیری در منزل',
        path: '/services/labs',
        icon: TestTube,
        gradient: 'from-sky-500 to-blue-600',
    },
    {
        id: 'pharmacy',
        title: 'داروخانه',
        desc: 'تحویل سریع دارو',
        path: '/services/pharmacy',
        icon: Pill,
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'radiology',
        title: 'رادیولوژی',
        desc: 'تصویربرداری تخصصی',
        path: '/services/radiology',
        icon: ScanLine,
        gradient: 'from-violet-500 to-indigo-600',
    },
    {
        id: 'nurseHome',
        title: 'پرستار در منزل',
        desc: 'مراقبت حرفه‌ای',
        path: '/services/nurse-home',
        icon: HomeIcon,
        gradient: 'from-rose-500 to-pink-600',
    },
];
