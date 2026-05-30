import { Outlet } from 'react-router';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNavbar } from '../components/AdminNavbar';

export function AdminLayout() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-100" dir="rtl">
            {/* سایدبار سمت راست */}
            <AdminSidebar />

            {/* بخش اصلی */}
            <div className="flex min-w-0 flex-1 flex-col">
                <AdminNavbar />

                {/* کانتینر محتوا */}
                <main className="min-h-0 flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
