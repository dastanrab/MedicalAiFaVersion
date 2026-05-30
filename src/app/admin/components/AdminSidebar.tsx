import { useNavigate, useLocation } from 'react-router';
import { Activity } from 'lucide-react';
import { adminNavItems, adminSocialLinks } from '../config/adminNav';
import { useAdminAuthStore } from '../store/adminAuthStore';

export function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const admin = useAdminAuthStore((s) => s.admin);

    const isActive = (path: string) => location.pathname === path;

    const fullName = admin ? `${admin.firstName} ${admin.lastName}` : 'مدیر سیستم';
    const initials = admin
        ? `${admin.firstName?.[0] ?? ''}${admin.lastName?.[0] ?? ''}`
        : 'م';

    return (
        <aside className="flex h-full w-72 flex-shrink-0 flex-col bg-slate-900 text-slate-300">
            {/* لوگو */}
            <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                    <Activity className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">مدیرا AI</p>
                    <p className="text-xs text-slate-500">پنل مدیریت</p>
                </div>
            </div>

            {/* پروفایل ادمین */}
            <div className="flex items-center gap-3 px-6 py-5">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-base font-semibold text-white ring-2 ring-white/10">
                    {admin?.avatar ? (
                        <img
                            src={admin.avatar}
                            alt={fullName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{fullName}</p>
                    <p className="truncate text-xs text-slate-500">
                        {admin?.role ?? 'مدیر سیستم'}
                    </p>
                </div>
            </div>

            {/* منو */}
            <nav className="flex-1 overflow-y-auto px-4 py-2">
                <ul className="space-y-1">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <li key={item.path}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                                        active
                                            ? 'bg-gradient-to-l from-indigo-500/20 to-violet-500/10 text-white shadow-sm ring-1 ring-indigo-500/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${
                                            active ? 'text-indigo-400' : ''
                                        }`}
                                    />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* شبکه‌های اجتماعی */}
            <div className="border-t border-white/5 px-6 py-5">
                <p className="mb-3 text-xs text-slate-500">ما را دنبال کنید</p>
                <div className="flex items-center gap-3">
                    {adminSocialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={social.label}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 ${social.color}`}
                            >
                                <Icon className="h-5 w-5" />
                            </a>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
