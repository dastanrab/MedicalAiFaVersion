// layouts/MainLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router';
import {
    Home, Calendar, FileText, Users, ClipboardList,
    BarChart2, Settings, HeadphonesIcon, Package,
    Bell, Search, ChevronDown, Brain, Menu, X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

const sidebarItems = [
    { icon: Home, label: 'داشبورد', path: '/dash' },
    { icon: Calendar, label: 'نوبت‌دهی / پذیرش', path: '/dash/appointments' },
    { icon: FileText, label: 'تجویز نسخه', path: '/dash/prescriptions' },
    { icon: Users, label: 'لیست بیماران', path: '/dash/patients' },
    { icon: ClipboardList, label: 'ویزیت‌های من', path: '/dash/my-visits' },
    // { icon: FileText, label: 'نسخ پر استفاده', path: '/dash/common-prescriptions' },
    { icon: BarChart2, label: 'گزارش‌ها', path: '/dash/reports' },
    { icon: Package, label: 'ویزیت آنلاین', path: '/dash/online-visit' },
    { icon: HeadphonesIcon, label: 'پشتیبانی', path: '/dash/support' },
];

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div className="flex h-screen bg-gray-50 font-[YekanBakhFaNum] overflow-hidden" dir="rtl">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'} transition-all duration-300 bg-white border-l border-gray-200 flex flex-col shadow-sm flex-shrink-0`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-blue-700 text-sm leading-tight">مدیرا AI</p>
                        <p className="text-xs text-gray-400">پنل پزشک</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3 overflow-y-auto">
                    {sidebarItems.map((item, i) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <button
                                key={i}
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                            >
                                <item.icon className="w-4 h-4 flex-shrink-0" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="border-t border-gray-100 py-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>تنظیمات مطب</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <HeadphonesIcon className="w-4 h-4" />
                        <span>پشتیبانی آنلاین</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 shadow-sm flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    {/* User */}
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">د</div>
                        <span>دکتر احمدی</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {/* Notif */}
                    <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                    </button>

                    {/* Plan badge */}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors">
                        <Package className="w-3.5 h-3.5" />
                        بسته پیشرفته
                    </button>

                    {/* Search */}
                    <div className="mr-auto relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="جستجوی کد ملی، مشاهده پرونده و تجویز..."
                            className="pr-9 pl-4 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-gray-50"
                        />
                    </div>
                </header>

                {/* Content - اینجا صفحات مختلف نمایش داده می‌شوند */}
                <main className="flex-1 overflow-y-auto p-5">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
