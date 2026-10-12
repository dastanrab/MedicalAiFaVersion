import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProviderRole } from '../../config/providerNav';
import { staffBasePath } from '../config/staffPermissions';

/**
 * کارمند صاحب حساب — فعلاً mock و ذخیره در localStorage تا اتصال API.
 * هر صاحب حساب فقط یک کارمند دارد و هر شماره فقط می‌تواند کارمند یک مرکز باشد.
 */
export interface StaffMember {
    id: string;
    role: ProviderRole;
    name: string;
    phone: string;
    active: boolean;
    /** نام مطب / مرکز صاحب حساب برای نمایش در پنل کارمند */
    ownerName: string;
    ownerPhone: string;
    createdAt: string;
}

export interface StaffSession {
    token: string;
    staffId: string;
    name: string;
    phone: string;
    ownerName: string;
}

export interface StaffActivity {
    id: string;
    role: ProviderRole;
    staffId: string;
    staffName: string;
    action: string;
    target?: string;
    at: string;
}

export type StaffInput = Pick<StaffMember, 'name' | 'phone'>;

const MAX_LOGS = 200;

function makeId(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

interface StaffState {
    members: Partial<Record<ProviderRole, StaffMember>>;
    sessions: Partial<Record<ProviderRole, StaffSession>>;
    logs: StaffActivity[];

    /** خطا را به صورت پیام برمی‌گرداند؛ در صورت موفقیت null */
    saveMember: (
        role: ProviderRole,
        input: StaffInput,
        owner: { name: string; phone: string }
    ) => string | null;
    setMemberActive: (role: ProviderRole, active: boolean) => void;
    removeMember: (role: ProviderRole) => void;

    findMemberByPhone: (phone: string) => StaffMember | null;
    login: (role: ProviderRole, member: StaffMember) => void;
    logout: (role: ProviderRole, redirect?: boolean) => void;

    logActivity: (role: ProviderRole, action: string, target?: string) => void;
}

export const useStaffStore = create<StaffState>()(
    persist(
        (set, get) => ({
            members: {},
            sessions: {},
            logs: [],

            saveMember: (role, input, owner) => {
                const phone = input.phone;
                if (owner.phone && phone === owner.phone) {
                    return 'شماره کارمند نمی‌تواند با شماره صاحب حساب یکسان باشد';
                }
                const current = get().members[role];
                const taken = Object.values(get().members).some(
                    (m) => m && m.phone === phone && m.id !== current?.id
                );
                if (taken) {
                    return 'این شماره به‌عنوان کارمند مرکز دیگری ثبت شده است';
                }

                const member: StaffMember = current
                    ? { ...current, name: input.name, phone, ownerName: owner.name, ownerPhone: owner.phone }
                    : {
                          id: makeId('staff'),
                          role,
                          name: input.name,
                          phone,
                          active: true,
                          ownerName: owner.name,
                          ownerPhone: owner.phone,
                          createdAt: new Date().toISOString(),
                      };

                set((state) => {
                    const sessions = { ...state.sessions };
                    // تغییر شماره کارمند، نشست فعلی او را باطل می‌کند
                    if (current && current.phone !== phone) delete sessions[role];
                    return { members: { ...state.members, [role]: member }, sessions };
                });
                return null;
            },

            setMemberActive: (role, active) =>
                set((state) => {
                    const member = state.members[role];
                    if (!member) return state;
                    const sessions = { ...state.sessions };
                    if (!active) delete sessions[role];
                    return { members: { ...state.members, [role]: { ...member, active } }, sessions };
                }),

            removeMember: (role) =>
                set((state) => {
                    const members = { ...state.members };
                    const sessions = { ...state.sessions };
                    delete members[role];
                    delete sessions[role];
                    return { members, sessions };
                }),

            findMemberByPhone: (phone) =>
                Object.values(get().members).find((m) => m?.phone === phone) ?? null,

            login: (role, member) =>
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [role]: {
                            token: makeId(`staff-${role}`),
                            staffId: member.id,
                            name: member.name,
                            phone: member.phone,
                            ownerName: member.ownerName,
                        },
                    },
                })),

            logout: (role, redirect = true) => {
                set((state) => {
                    const sessions = { ...state.sessions };
                    delete sessions[role];
                    return { sessions };
                });
                if (redirect) window.location.href = `${staffBasePath(role)}/login`;
            },

            logActivity: (role, action, target) => {
                const session = get().sessions[role];
                if (!session) return;
                const entry: StaffActivity = {
                    id: makeId('log'),
                    role,
                    staffId: session.staffId,
                    staffName: session.name,
                    action,
                    target,
                    at: new Date().toISOString(),
                };
                set((state) => ({ logs: [entry, ...state.logs].slice(0, MAX_LOGS) }));
            },
        }),
        {
            name: 'provider-staff-storage',
            partialize: (state) => ({
                members: state.members,
                sessions: state.sessions,
                logs: state.logs,
            }),
        }
    )
);

export function useStaffSession(role: ProviderRole) {
    return useStaffStore((s) => s.sessions[role] ?? null);
}

/** ثبت فعالیت کارمند جاری در لاگ — صاحب حساب آن را در صفحه کارمند می‌بیند */
export function useStaffActivityLogger(role: ProviderRole) {
    const logActivity = useStaffStore((s) => s.logActivity);
    return (action: string, target?: string) => logActivity(role, action, target);
}
