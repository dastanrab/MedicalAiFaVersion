import { Outlet, useLocation } from 'react-router';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNavbar } from '../components/AdminNavbar';
import { AdminPageSkeleton } from '../components/AdminPageSkeleton';
import { AdminDashboardSkeleton } from '../components/AdminDashboardSkeleton';
import { AdminChatsSkeleton } from '../components/AdminChatsSkeleton';

interface AdminLayoutProps {
    authLoading?: boolean;
}

export function AdminLayout({ authLoading = false }: AdminLayoutProps) {
    const location = useLocation();
    const isDashboardRoute =
        location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    const isChatsRoute = location.pathname === '/admin/chats';

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
