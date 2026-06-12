import { useLocation } from 'react-router';
import { Bell, LogOut } from 'lucide-react';
import { adminNavItems } from '../config/adminNav';
import { settingsTabs } from '../config/settingsOptions';
import { useAdminAuthStore } from '../store/adminAuthStore';

export function AdminNavbar() {
    const location = useLocation();
    const logout = useAdminAuthStore((s) => s.logout);

    const settingsTab = settingsTabs.find((tab) => location.pathname === tab.path);
    const current = adminNavItems.find((item) => {
        if (item.path === '/admin/settings') {
            return location.pathname.startsWith('/admin/settings');
        }
        return item.path === location.pathname;
    });
    const title = settingsTab
        ? `تنظیمات — ${settingsTab.label}`
        : current?.label ?? 'پنل مدیریت';

    return (
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
            {/* عنوان صفحه (سمت راست در RTL) */}
            <div>
                <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
            </div>

            {/* آیکون‌ها (سمت چپ در RTL) */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    title="اعلان‌ها"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                <button
                    type="button"
                    onClick={logout}
                    title="خروج از حساب"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
