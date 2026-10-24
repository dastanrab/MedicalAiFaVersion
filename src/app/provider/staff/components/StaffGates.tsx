import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import type { ProviderRole } from '../../config/providerNav';
import { showProviderError } from '../../utils/toast';
import {
    staffBasePath,
    staffHasPermission,
    staffPath,
    type StaffPermission,
} from '../config/staffPermissions';
import { useStaffStore } from '../store/staffStore';

const API_BASE_URL = 'https://api.mediraai.com/api';

/**
 * بررسی اعتبار اولیه نشست کارمند در سمت کلاینت
 */
function useValidStaffSession(role: ProviderRole) {
    const session = useStaffStore((s) => s.sessions[role]);
    const member = useStaffStore((s) => s.members[role]);

    // ورودهای واقعی با سرور (پزشک، آزمایشگاه یا توکن مستقیم)
    const isApiSession = Boolean(session?.token && (!member || role === 'doctor' || role === 'lab'));

    const valid = Boolean(
        session?.token &&
        (isApiSession
            ? Boolean(session.phone)
            : member &&
            member.active &&
            member.id === session.staffId &&
            member.phone === session.phone)
    );
    return { session, valid, isApiSession };
}

export function StaffAuthGate({ role, children }: { role: ProviderRole; children: ReactNode }) {
    const { session, valid, isApiSession } = useValidStaffSession(role);
    const logout = useStaffStore((s) => s.logout);

    // وضعیت استعلام زنده از سرور
    const [isChecking, setIsChecking] = useState<boolean>(Boolean(isApiSession && session?.token));
    const [isServerActive, setIsServerActive] = useState<boolean>(true);

    const checkServerStatus = useCallback(async () => {
        if (!session?.token) {
            setIsChecking(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/staff/auth/check`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${session.token}`,
                },
            });

            const data = await res.json().catch(() => null);

            if (!res.ok || !data?.success) {
                const message = data?.message || 'دسترسی شما غیرفعال شده است یا نشست نامعتبر است.';
                showProviderError(message);
                setIsServerActive(false);
                logout(role, false);
            } else {
                setIsServerActive(true);
            }
        } catch (err) {
            console.error('Error verifying staff access:', err);
            // در خطای موقت اینترنت نشست حفظ می‌شود مگر خطای صریح سرور بازگردد
        } finally {
            setIsChecking(false);
        }
    }, [session?.token, role, logout]);

    useEffect(() => {
        // برای نقش‌های آنلاین دسترسی را از بک‌اند استعلام کن
        if (valid && isApiSession) {
            checkServerStatus();
        } else if (session && !valid) {
            logout(role, false);
        }
    }, [valid, isApiSession, session, checkServerStatus, logout, role]);

    if (!valid || !isServerActive) {
        return <Navigate to={`${staffBasePath(role)}/login`} replace />;
    }

    if (isChecking) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
                <p className="text-xs font-medium text-slate-500">در حال بررسی سطح دسترسی کارمند...</p>
            </div>
        );
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
    // پزشک و آزمایشگاه که با وب‌سرویس لاگین می‌کنند دسترسی کامل به صفحات پنل دارند
    if (role === 'doctor' || role === 'lab') {
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
        if (role === 'doctor' || role === 'lab') return true;
        return staffHasPermission(role, permission);
    };
}
