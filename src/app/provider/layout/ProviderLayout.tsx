import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Bell, LogOut, Menu, X, MoreHorizontal } from 'lucide-react';
import {
    providerNavByRole,
    providerBasePath,
    getNurseNavItems,
    type ProviderRole,
    type ProviderNavItem,
} from '../config/providerNav';
import { providerRoleLabels, providerThemes, providerDefaultNames } from '../config/providerTheme';
import { mockNotifications } from '../data/mockData';
import { useProviderAuthStore, useNurseAccountType } from '../store/providerAuthStore';
import { useDoctorAuthStore } from '../doctor/store/doctorAuthStore';
import { DEFAULT_PROVIDER_SUBSCRIPTION, useProviderPlanStore } from '../store/providerPlanStore';
import { getProviderPlans } from '../data/providerPlans';
import { getStaffNavItems, staffBasePath, staffRoleConfig } from '../staff/config/staffPermissions';
import { useStaffStore } from '../staff/store/staffStore';

export type ProviderPanelMode = 'owner' | 'staff';

function useNavItems(role: ProviderRole, mode: ProviderPanelMode): ProviderNavItem[] {
    const nurseAccountType = useNurseAccountType();
    if (mode === 'staff') return getStaffNavItems(role);
    if (role === 'nurse') return getNurseNavItems(nurseAccountType);
    return providerNavByRole[role];
}

function panelBasePath(role: ProviderRole, mode: ProviderPanelMode) {
    return mode === 'staff' ? staffBasePath(role) : providerBasePath(role);
}

interface ProviderSidebarProps {
    role: ProviderRole;
    mode?: ProviderPanelMode;
    isOpen?: boolean;
    onClose?: () => void;
}

export function ProviderSidebar({ role, mode = 'owner', isOpen = false, onClose }: ProviderSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = useNavItems(role, mode);
    const theme = providerThemes[role];
    const base = panelBasePath(role, mode);

    const session = useProviderAuthStore((s) => s.sessions[role]);
    const staffSession = useStaffStore((s) => s.sessions[role]);
    const doctor = useDoctorAuthStore((s) => s.doctor);
    const subscription =
        useProviderPlanStore((s) => s.subscriptions[role]) ?? DEFAULT_PROVIDER_SUBSCRIPTION;
    const currentPlanName =
        mode === 'staff' ? undefined : getProviderPlans(role).find((p) => p.id === subscription.planId)?.name;
    const profileName =
        mode === 'staff'
            ? (staffSession?.name ?? staffRoleConfig[role].title)
            : role === 'doctor'
                ? (doctor?.name ?? providerDefaultNames[role])
                : (session?.user.name ?? providerDefaultNames[role]);
    const subtitle =
        mode === 'staff'
            ? `${staffRoleConfig[role].title} · ${staffSession?.ownerName ?? providerRoleLabels[role]}`
            : providerRoleLabels[role];

    const handleNavigate = (path: string) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <>
            {/* Backdrop تاریک برای موبایل */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
                />
            )}

            <aside
                className={`fixed inset-y-0 right-0 z-50 flex h-full w-72 flex-col bg-slate-900 text-slate-300 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-72 lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header منو و دکمه بستن در موبایل */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white ring-2 ring-white/10 ${theme.badge}`}
                        >
                            {profileName[0]}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{profileName}</p>
                            <p className="truncate text-xs text-slate-400">
                                {subtitle}
                                {currentPlanName && (
                                    <span className="mr-1 text-slate-300">· پلن {currentPlanName}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    {/* دکمه بستن در موبایل */}
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-3">
                    <ul className="space-y-1.5">
                        {navItems.map((item) => {
                            const path = `${base}/${item.segment}`;
                            const active =
                                location.pathname === path ||
                                (item.segment !== 'dashboard' && location.pathname.startsWith(`${base}/${item.segment}`));
                            const Icon = item.icon;
                            return (
                                <li key={item.segment}>
                                    <button
                                        type="button"
                                        onClick={() => handleNavigate(path)}
                                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                            active
                                                ? `bg-gradient-to-l text-white shadow-sm ring-1 ${theme.sidebar}`
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white active:scale-[0.98]'
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
                    {mode === 'staff' && staffSession?.phone && (
                        <p className="text-xs text-slate-500" dir="ltr">
                            {staffSession.phone}
                        </p>
                    )}
                    {mode === 'owner' && role === 'doctor' && doctor?.email && (
                        <p className="text-xs text-slate-500" dir="ltr">
                            {doctor.email}
                        </p>
                    )}
                    {mode === 'owner' && role !== 'doctor' && session?.user.phone && (
                        <p className="text-xs text-slate-500" dir="ltr">
                            {session.user.phone}
                        </p>
                    )}
                </div>
            </aside>
        </>
    );
}

interface ProviderNavbarProps {
    role: ProviderRole;
    mode?: ProviderPanelMode;
    onToggleSidebar: () => void;
}

export function ProviderNavbar({ role, mode = 'owner', onToggleSidebar }: ProviderNavbarProps) {
    const location = useLocation();
    const navItems = useNavItems(role, mode);
    const base = panelBasePath(role, mode);
    const logoutProvider = useProviderAuthStore((s) => s.logout);
    const logoutDoctor = useDoctorAuthStore((s) => s.logout);
    const logoutStaff = useStaffStore((s) => s.logout);
    const unread = mockNotifications.filter((n) => !n.read).length;

    const logout = () => {
        if (mode === 'staff') {
            logoutStaff(role);
        } else if (role === 'doctor') {
            logoutDoctor().then();
        } else {
            logoutProvider(role);
        }
    };

    const current = navItems.find((item) => {
        const path = `${base}/${item.segment}`;
        return location.pathname === path || (item.segment !== 'dashboard' && location.pathname.startsWith(path));
    });

    return (
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
            <div className="flex items-center gap-3">
                {/* دکمه منو همبرگری مخصوص موبایل */}
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 lg:hidden"
                    title="منو"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                    {current?.label ?? 'پنل کارمند'}
                </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
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
                    onClick={() => logout()}
                    title="خروج از حساب"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}

/** کامپوننت Bottom Navigation اختصاصی منشی روی موبایل */
function StaffBottomNav({ role, onOpenMore }: { role: ProviderRole; onOpenMore: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const base = staffBasePath(role);
    const allItems = getStaffNavItems(role);

    // سه تب اصلی را نمایش می‌دهیم و بقیه با زدن دکمه «بیشتر» باز می‌شوند
    const primaryItems = allItems.slice(0, 3);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 shadow-lg lg:hidden">
            {primaryItems.map((item) => {
                const path = `${base}/${item.segment}`;
                const active = location.pathname === path || (item.segment !== 'dashboard' && location.pathname.startsWith(path));
                const Icon = item.icon;
                return (
                    <button
                        key={item.segment}
                        type="button"
                        onClick={() => navigate(path)}
                        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                            active ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
                        <span className="text-[11px] mt-1 truncate max-w-[65px]">{item.label}</span>
                    </button>
                );
            })}

            <button
                type="button"
                onClick={onOpenMore}
                className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-slate-800 transition-colors"
            >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[11px] mt-1">بیشتر</span>
            </button>
        </nav>
    );
}

interface ProviderLayoutShellProps {
    role: ProviderRole;
    mode?: ProviderPanelMode;
    children: ReactNode;
}

export function ProviderLayoutShell({ role, mode = 'owner', children }: ProviderLayoutShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-[YekanBakhFaNum]" dir="rtl">
            <ProviderSidebar
                role={role}
                mode={mode}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <ProviderNavbar
                    role={role}
                    mode={mode}
                    onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                />
                <main className={`min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 ${mode === 'staff' ? 'pb-20 lg:pb-6' : ''}`}>
                    {children}
                </main>
            </div>

            {/* نوار پایینی در حالت staff و صفحه موبایل */}
            {mode === 'staff' && (
                <StaffBottomNav role={role} onOpenMore={() => setSidebarOpen(true)} />
            )}
        </div>
    );
}
