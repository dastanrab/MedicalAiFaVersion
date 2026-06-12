import { NavLink, Outlet, Navigate, useLocation } from 'react-router';
import { settingsTabs } from '../../config/settingsOptions';

export function AdminSettingsLayout() {
    const location = useLocation();

    if (location.pathname === '/admin/settings') {
        return <Navigate to="/admin/settings/general" replace />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">تنظیمات سامانه</h2>
                <p className="mt-1 text-sm text-slate-500">
                    پیکربندی عمومی، امنیت، محتوا، خدمات و مدیران
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 lg:w-56 lg:flex-col">
                    {settingsTabs.map((tab) => (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            className={({ isActive }) =>
                                `whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="min-w-0 flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
