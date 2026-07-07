import { Outlet, useLocation } from 'react-router';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNavbar } from '../components/AdminNavbar';
import { AdminPageSkeleton } from '../components/AdminPageSkeleton';
import { AdminDashboardSkeleton } from '../components/AdminDashboardSkeleton';
import { AdminChatsSkeleton } from '../components/AdminChatsSkeleton';
import { AdminSettingsSkeleton } from '../components/AdminSettingsSkeleton';
import { AdminUsersSkeleton } from '../components/AdminUsersSkeleton';
import {setAdminTokenGetter} from "../services/adminApi";
import {useAdminAuthStore} from "../store/adminAuthStore";

interface AdminLayoutProps {
    authLoading?: boolean;
}

export function AdminLayout({ authLoading = false }: AdminLayoutProps) {
    const location = useLocation();
    const isDashboardRoute =
        location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    const isChatsRoute = location.pathname === '/admin/chats';
    const isSettingsRoute = location.pathname.startsWith('/admin/settings');
    const isUsersRoute = location.pathname === '/admin/users';
    setAdminTokenGetter(() => useAdminAuthStore.getState().token);
    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-100" dir="rtl">
            <AdminSidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <AdminNavbar />

                <main className="min-h-0 flex-1 overflow-y-auto p-6">
                    {authLoading ? (
                        isDashboardRoute ? (
                            <AdminDashboardSkeleton />
                        ) : isChatsRoute ? (
                            <AdminChatsSkeleton />
                        ) : isSettingsRoute ? (
                            <AdminSettingsSkeleton />
                        ) : isUsersRoute ? (
                            <AdminUsersSkeleton />
                        ) : (
                            <AdminPageSkeleton />
                        )
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>
        </div>
    );
}
