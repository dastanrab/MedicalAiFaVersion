import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import type { ProviderRole } from '../../config/providerNav';
import {
    staffBasePath,
    staffHasPermission,
    staffPath,
    type StaffPermission,
} from '../config/staffPermissions';
import { useStaffStore } from '../store/staffStore';

/**
 * نشست کارمند معتبر است اگر:
 * ۱) نشست دارای توکن باشد (لاگین API واقعی یا ماک)
 * ۲) برای حالت ماک، کارمند در لیست اعضا فعال باشد
 * ۳) برای حالت API (مثل منشی پزشک)، وجود توکن و شماره تماس برای احراز هویت کلاینت کافی است
 */
function useValidStaffSession(role: ProviderRole) {
    const session = useStaffStore((s) => s.sessions[role]);
    const member = useStaffStore((s) => s.members[role]);

    // اگر توکن دارد و عضو لوکال ثبت نشده (ورود واقعی از سرور) یا نقش doctor است
    const isApiSession = Boolean(session?.token && (!member || role === 'doctor'));

    const valid = Boolean(
        session?.token &&
        (isApiSession
            ? Boolean(session.phone)
            : member &&
            member.active &&
            member.id === session.staffId &&
            member.phone === session.phone)
    );
    return { session, valid };
}

export function StaffAuthGate({ role, children }: { role: ProviderRole; children: ReactNode }) {
    const { session, valid } = useValidStaffSession(role);
    const logout = useStaffStore((s) => s.logout);

    useEffect(() => {
        // فقط در حالتی که نشست ماک دستی نامعتبر شده باشد خارج شود (نه نشست‌های توکن‌دار)
        if (session && !valid) {
            logout(role, false);
        }
    }, [session, valid, role, logout]);

    if (!valid) {
        return <Navigate to={`${staffBasePath(role)}/login`} replace />;
    }
    return <>{children}</>;
}

export function StaffPublicRoute({ role, children }: { role: ProviderRole; children: ReactNode }) {
    const { valid } = useValidStaffSession(role);
    if (valid) {
        return <Navigate to={staffPath(role, 'dashboard')} replace />;
    }
    return <>{children}</>;
}

export function StaffPermissionGate({
    role,
    permission,
    children,
}: {
    role: ProviderRole;
    permission: StaffPermission;
    children: ReactNode;
}) {
    // برای نقش پزشک که مستقیم با API لاگین کرده، تمام صفحات مجاز منشی باز هستند
    if (role === 'doctor') {
        return <>{children}</>;
    }

    if (!staffHasPermission(role, permission)) {
        return <Navigate to={staffPath(role, 'dashboard')} replace />;
    }
    return <>{children}</>;
}

/** برای پنهان کردن دکمه‌ها و اکشن‌هایی که کارمند مجوزشان را ندارد */
export function useStaffCan(role: ProviderRole) {
    return (permission: StaffPermission) => {
        if (role === 'doctor') return true;
        return staffHasPermission(role, permission);
    };
}
