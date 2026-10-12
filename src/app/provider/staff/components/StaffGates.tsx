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

/** نشست کارمند معتبر است اگر کارمند هنوز وجود داشته باشد، فعال باشد و شماره‌اش تغییر نکرده باشد */
function useValidStaffSession(role: ProviderRole) {
    const session = useStaffStore((s) => s.sessions[role]);
    const member = useStaffStore((s) => s.members[role]);
    const valid = Boolean(
        session?.token &&
            member &&
            member.active &&
            member.id === session.staffId &&
            member.phone === session.phone
    );
    return { session, valid };
}

export function StaffAuthGate({ role, children }: { role: ProviderRole; children: ReactNode }) {
    const { session, valid } = useValidStaffSession(role);
    const logout = useStaffStore((s) => s.logout);

    useEffect(() => {
        // صاحب حساب کارمند را حذف یا غیرفعال کرده — نشست باطل شود
        if (session && !valid) logout(role, false);
    }, [session, valid, role, logout]);

    if (!valid) {
        return <Navigate to={`${staffBasePath(role)}/login`} replace />;
    }
    return children;
}

export function StaffPublicRoute({ role, children }: { role: ProviderRole; children: ReactNode }) {
    const { valid } = useValidStaffSession(role);
    if (valid) {
        return <Navigate to={staffPath(role, 'dashboard')} replace />;
    }
    return children;
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
    if (!staffHasPermission(role, permission)) {
        return <Navigate to={staffPath(role, 'dashboard')} replace />;
    }
    return children;
}

/** برای پنهان کردن دکمه‌ها و اکشن‌هایی که کارمند مجوزشان را ندارد */
export function useStaffCan(role: ProviderRole) {
    return (permission: StaffPermission) => staffHasPermission(role, permission);
}
