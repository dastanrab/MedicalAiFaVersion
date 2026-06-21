import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Bell, LogOut } from 'lucide-react';
import {
    providerNavByRole,
    providerBasePath,
    providerPath,
    type ProviderRole,
} from '../config/providerNav';
import { providerRoleLabels, providerThemes, providerDefaultNames } from '../config/providerTheme';
import { mockNotifications } from '../data/mockData';
import { useProviderAuthStore } from '../store/providerAuthStore';

interface ProviderSidebarProps {
    role: ProviderRole;
}

export function ProviderSidebar({ role }: ProviderSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = providerNavByRole[role];
    const theme = providerThemes[role];
    const base = providerBasePath(role);

    const session = useProviderAuthStore((s) => s.sessions[role]);
    const profileName = session?.user.name ?? providerDefaultNames[role];

    return (
        <aside className="flex h-full w-72 flex-shrink-0 flex-col bg-slate-900 text-slate-300">
            <div className="flex items-center gap-3 px-6 py-5">
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white ring-2 ring-white/10 ${theme.badge}`}
                >
                    {profileName[0]}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{profileName}</p>
                    <p className="truncate text-xs text-slate-500">{providerRoleLabels[role]}</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-2">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const path = providerPath(role, item.segment);
                        const active =
                            location.pathname === path ||
                            (item.segment === 'requests' &&
                                location.pathname.startsWith(`${base}/requests`));
                        const Icon = item.icon;
                        return (
                            <li key={item.segment}>
                                <button
                                    type="button"
                                    onClick={() => navigate(path)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                                        active
                                            ? `bg-gradient-to-l text-white shadow-sm ring-1 ${theme.sidebar}`
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 ${active ? theme.accent : ''}`} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="border-t border-white/5 px-6 py-4">
                {session?.user.phone && (
                    <p className="text-xs text-slate-500" dir="ltr">
                        {session.user.phone}
                    </p>
                )}
            </div>
        </aside>
    );
}

interface ProviderNavbarProps {
    role: ProviderRole;
}

export function ProviderNavbar({ role }: ProviderNavbarProps) {
    const location = useLocation();
    const navItems = providerNavByRole[role];
    const logout = useProviderAuthStore((s) => s.logout);
    const unread = mockNotifications.filter((n) => !n.read).length;

    const current = navItems.find((item) => {
        const path = providerPath(role, item.segment);
        return (
            location.pathname === path ||
            (item.segment === 'requests' && location.pathname.includes('/requests'))
        );
    });

    return (
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
            <h1 className="text-lg font-semibold text-slate-800">{current?.label ?? 'پنل خدمات‌دهنده'}</h1>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    title="اعلان‌ها"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                >
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
                            {unread}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => logout(role)}
                    title="خروج از حساب"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}

interface ProviderLayoutShellProps {
    role: ProviderRole;
    children: ReactNode;
}

export function ProviderLayoutShell({ role, children }: ProviderLayoutShellProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-[YekanBakhFaNum]" dir="rtl">
            <ProviderSidebar role={role} />
            <div className="flex min-w-0 flex-1 flex-col">
                <ProviderNavbar role={role} />
                <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
