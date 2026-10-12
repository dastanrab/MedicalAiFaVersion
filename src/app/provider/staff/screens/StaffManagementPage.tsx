import { useState } from 'react';
import {
    Check,
    Copy,
    History,
    Pencil,
    Plus,
    ShieldCheck,
    ShieldX,
    Trash2,
    UserCog,
} from 'lucide-react';
import {
    EmptyState,
    PageHeader,
    ProviderFormField,
    ProviderModal,
    StatusBadge,
    inputClass,
} from '../../components';
import type { ProviderRole } from '../../config/providerNav';
import { providerDefaultNames } from '../../config/providerTheme';
import { useDoctorAuthStore } from '../../doctor/store/doctorAuthStore';
import { useProviderAuthStore } from '../../store/providerAuthStore';
import { showProviderError, showProviderSuccess } from '../../utils/toast';
import { isValidIranPhone, normalizePhone } from '../../utils/validation';
import { ConfirmModal } from '../components/StaffUi';
import {
    staffBasePath,
    staffPermissionLabels,
    staffRoleConfig,
} from '../config/staffPermissions';
import { useStaffStore, type StaffMember } from '../store/staffStore';

/** اطلاعات صاحب حساب جاری برای ثبت روی رکورد کارمند */
function useOwnerInfo(role: ProviderRole) {
    const doctor = useDoctorAuthStore((s) => s.doctor);
    const session = useProviderAuthStore((s) => s.sessions[role]);
    if (role === 'doctor') {
        return { name: doctor?.name ?? providerDefaultNames.doctor, phone: normalizePhone(doctor?.phone ?? '') };
    }
    return { name: session?.user.name ?? providerDefaultNames[role], phone: normalizePhone(session?.user.phone ?? '') };
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
}

export function StaffManagementPage({ role }: { role: ProviderRole }) {
    const config = staffRoleConfig[role];
    const owner = useOwnerInfo(role);
    const member = useStaffStore((s) => s.members[role]);
    const logs = useStaffStore((s) => s.logs);
    const saveMember = useStaffStore((s) => s.saveMember);
    const setMemberActive = useStaffStore((s) => s.setMemberActive);
    const removeMember = useStaffStore((s) => s.removeMember);

    const [formOpen, setFormOpen] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [copied, setCopied] = useState(false);

    const loginUrl = `${window.location.origin}${staffBasePath(role)}/login`;
    const memberLogs = member ? logs.filter((l) => l.role === role && l.staffId === member.id).slice(0, 20) : [];

    const copyLoginUrl = async () => {
        try {
            await navigator.clipboard.writeText(loginUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showProviderError('کپی لینک ممکن نشد');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={`کارمند (${config.title})`}
                description="هر حساب می‌تواند یک کارمند با دسترسی محدود داشته باشد"
                actions={
                    !member && (
                        <button
                            type="button"
                            onClick={() => setFormOpen(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                            <Plus className="h-4 w-4" />
                            افزودن {config.title}
                        </button>
                    )
                }
            />

            {member ? (
                <MemberCard
                    member={member}
                    title={config.title}
                    onEdit={() => setFormOpen(true)}
                    onToggle={() => {
                        setMemberActive(role, !member.active);
                        showProviderSuccess(member.active ? 'حساب کارمند غیرفعال شد' : 'حساب کارمند فعال شد');
                    }}
                    onRemove={() => setConfirmRemove(true)}
                />
            ) : (
                <EmptyState message={`هنوز ${config.title} ثبت نکرده‌اید.`} />
            )}

            {member && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700">لینک ورود کارمند</p>
                        <p className="mt-1 truncate text-xs text-slate-500" dir="ltr">{loginUrl}</p>
                    </div>
                    <button
                        type="button"
                        onClick={copyLoginUrl}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'کپی شد' : 'کپی لینک'}
                    </button>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        دسترسی‌های {config.title}
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        {config.permissions.map((p) => (
                            <li key={p} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                {staffPermissionLabels[p]}
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                        <ShieldX className="h-5 w-5 text-red-500" />
                        بدون دسترسی
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        {config.restrictions.map((r) => (
                            <li key={r} className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <p className="text-xs text-slate-400">سطح دسترسی کارمند توسط سیستم تعیین می‌شود و قابل تغییر نیست.</p>

            {member && (
                <section className="rounded-2xl border border-slate-200 bg-white">
                    <header className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                        <History className="h-5 w-5 text-slate-500" />
                        <h3 className="font-semibold text-slate-800">فعالیت‌های اخیر کارمند</h3>
                    </header>
                    {memberLogs.length === 0 ? (
                        <p className="px-5 py-6 text-center text-sm text-slate-400">هنوز فعالیتی ثبت نشده است.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">عملیات</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">جزئیات</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">زمان</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberLogs.map((l) => (
                                        <tr key={l.id} className="border-t border-slate-100">
                                            <td className="px-4 py-3 font-medium text-slate-700">{l.action}</td>
                                            <td className="px-4 py-3 text-slate-500">{l.target ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-400">{formatDate(l.at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {formOpen && (
                <StaffFormModal
                    title={member ? `ویرایش ${config.title}` : `افزودن ${config.title}`}
                    initial={member}
                    onClose={() => setFormOpen(false)}
                    onSubmit={(input) => {
                        const error = saveMember(role, input, owner);
                        if (error) {
                            showProviderError(error);
                            return;
                        }
                        showProviderSuccess(member ? 'اطلاعات کارمند به‌روز شد' : 'کارمند اضافه شد');
                        setFormOpen(false);
                    }}
                />
            )}

            {confirmRemove && member && (
                <ConfirmModal
                    title="حذف کارمند"
                    description={`${member.name} از حساب شما حذف شود؟`}
                    note="دسترسی کارمند بلافاصله قطع می‌شود."
                    confirmLabel="حذف کارمند"
                    onClose={() => setConfirmRemove(false)}
                    onConfirm={() => {
                        removeMember(role);
                        showProviderSuccess('کارمند حذف شد');
                        setConfirmRemove(false);
                    }}
                />
            )}
        </div>
    );
}

function MemberCard({
    member,
    title,
    onEdit,
    onToggle,
    onRemove,
}: {
    member: StaffMember;
    title: string;
    onEdit: () => void;
    onToggle: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserCog className="h-6 w-6" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">{member.name}</p>
                        <StatusBadge
                            label={member.active ? 'فعال' : 'غیرفعال'}
                            className={
                                member.active
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                    : 'bg-slate-100 text-slate-600 ring-slate-500/20'
                            }
                        />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        {title} · <span dir="ltr">{member.phone}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">ثبت: {formatDate(member.createdAt)}</p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                    <span
                        className={`relative h-5 w-9 rounded-full transition ${member.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                        <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${member.active ? 'right-0.5' : 'right-[18px]'}`}
                        />
                    </span>
                    {member.active ? 'غیرفعال کردن' : 'فعال کردن'}
                </button>
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                    <Pencil className="h-4 w-4" />
                    ویرایش
                </button>
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                    حذف
                </button>
            </div>
        </div>
    );
}

function StaffFormModal({
    title,
    initial,
    onClose,
    onSubmit,
}: {
    title: string;
    initial?: StaffMember;
    onClose: () => void;
    onSubmit: (input: { name: string; phone: string }) => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit = () => {
        const next: Record<string, string> = {};
        if (name.trim().length < 3) next.name = 'نام و نام خانوادگی را وارد کنید';
        if (!isValidIranPhone(phone)) next.phone = 'شماره موبایل معتبر نیست';
        setErrors(next);
        if (Object.keys(next).length) return;
        onSubmit({ name: name.trim(), phone: normalizePhone(phone) });
    };

    return (
        <ProviderModal
            open
            onClose={onClose}
            title={title}
            description="کارمند با همین شماره موبایل و کد یک‌بار مصرف وارد پنل می‌شود."
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                        ذخیره
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <ProviderFormField label="نام و نام خانوادگی" required error={errors.name}>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </ProviderFormField>
                <ProviderFormField label="شماره موبایل" required error={errors.phone}>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(normalizePhone(e.target.value))}
                        dir="ltr"
                        placeholder="09123456789"
                        className={inputClass}
                    />
                </ProviderFormField>
                {initial && initial.phone !== normalizePhone(phone) && (
                    <p className="text-xs text-amber-600">با تغییر شماره، کارمند از پنل خارج می‌شود و باید دوباره وارد شود.</p>
                )}
            </div>
        </ProviderModal>
    );
}
