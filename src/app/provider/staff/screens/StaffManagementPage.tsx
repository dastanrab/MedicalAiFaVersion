import { useCallback, useEffect, useState } from 'react';
import {
    Check,
    Copy,
    Loader2,
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
import { showProviderError, showProviderSuccess } from '../../utils/toast';
import { isValidIranPhone, normalizePhone } from '../../utils/validation';
import { ConfirmModal } from '../components/StaffUi';
import {
    staffBasePath,
    staffPermissionLabels,
    staffRoleConfig,
} from '../config/staffPermissions';
import { useStaffStore, type StaffMember } from '../store/staffStore';
import {useProviderSession} from "../../store/providerAuthStore";

const API_BASE_URL = 'https://api.mediraai.com/api';

function useOwnerInfo(role: ProviderRole) {
    const doctor = useDoctorAuthStore((s) => s.doctor);
    if (role === 'doctor') {
        return { name: doctor?.name ?? providerDefaultNames.doctor, phone: normalizePhone(doctor?.phone ?? '') };
    }
    return { name: providerDefaultNames[role] ?? '', phone: '' };
}

function formatDate(iso?: string) {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
}

export function StaffManagementPage({ role }: { role: ProviderRole }) {
    const config = staffRoleConfig[role];
    const owner = useOwnerInfo(role);

    // توکن پزشک
    const doctorToken = useDoctorAuthStore((s) => s.token);
    const labSession = useProviderSession('lab');
    const token = labSession?.token || '';
    // توکن احراز هویت مرکز یا کارمند برای درخواست‌های آزمایشگاه (در صورت نیاز از استور مرکز یا لوکال استوریج خوانده می‌شود)
    const authToken = role === 'doctor'
        ? doctorToken
        : token;

    const isRemoteRole = role === 'doctor' || role === 'lab';

    // برای داروخانه (هنوز لوکال)
    const localMember = useStaffStore((s) => s.members[role]);
    const saveLocalMember = useStaffStore((s) => s.saveMember);
    const setLocalMemberActive = useStaffStore((s) => s.setMemberActive);
    const removeLocalMember = useStaffStore((s) => s.removeMember);

    // لیست کارمندان متصل به سرور (برای دکتر و آزمایشگاه)
    const [remoteStaffs, setRemoteStaffs] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState<boolean>(isRemoteRole);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // مدیریت مودال‌ها
    const [formOpen, setFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
    const [deletingMember, setDeletingMember] = useState<StaffMember | null>(null);
    const [copied, setCopied] = useState(false);

    const loginUrl = `${window.location.origin}${staffBasePath(role)}/login`;

    // تعیین اندپوینت پایه بر اساس نقش
    const getEndpoint = useCallback((path = '') => {
        if (role === 'doctor') return `${API_BASE_URL}/doctor/secretaries${path}`;
        if (role === 'lab') return `${API_BASE_URL}/owner/lab/staffs${path}`;
        return '';
    }, [role]);

    // هدرهای مشترک احراز هویت
    const getHeaders = useCallback(() => {
        return {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
        };
    }, [authToken]);

    // دریافت لیست کارمندان از سرور
    const fetchStaffs = useCallback(async () => {
        if (!isRemoteRole) return;

        try {
            setLoading(true);
            const res = await fetch(getEndpoint(), {
                headers: getHeaders(),
            });

            const result = await res.json();
            if (res.ok && result.success && Array.isArray(result.data)) {
                setRemoteStaffs(result.data);
            } else {
                showProviderError(result.message || `خطا در دریافت لیست ${config.title}`);
            }
        } catch (err) {
            console.error('Fetch staff list failed:', err);
            showProviderError('خطا در برقراری ارتباط با سرور.');
        } finally {
            setLoading(false);
        }
    }, [isRemoteRole, getEndpoint, getHeaders, config.title]);

    useEffect(() => {
        if (isRemoteRole) {
            fetchStaffs();
        }
    }, [fetchStaffs, isRemoteRole]);

    // ذخیره یا ویرایش کارمند
    const handleFormSubmit = async (input: { name: string; phone: string; jobTitle?: string }) => {
        if (isRemoteRole) {
            try {
                setSubmitting(true);
                const isEdit = Boolean(editingMember);
                const url = isEdit
                    ? getEndpoint(`/${editingMember!.id}`)
                    : getEndpoint();
                const method = isEdit ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method,
                    headers: getHeaders(),
                    body: JSON.stringify({
                        name: input.name,
                        phone: input.phone,
                        job_title: input.jobTitle,
                    }),
                });

                const result = await res.json();
                if (res.ok && result.success) {
                    showProviderSuccess(result.message || 'عملیات با موفقیت انجام شد');
                    setFormOpen(false);
                    setEditingMember(null);
                    fetchStaffs();
                } else {
                    showProviderError(result.message || 'خطا در ذخیره اطلاعات کارمند');
                }
            } catch (err) {
                console.error('Save staff failed:', err);
                showProviderError('خطایی در ارتباط با سرور رخ داد.');
            } finally {
                setSubmitting(false);
            }
        } else {
            const error = saveLocalMember(role, input, owner!);
            if (error) {
                showProviderError(error);
                return;
            }
            showProviderSuccess(localMember ? 'اطلاعات کارمند به‌روز شد' : 'کارمند اضافه شد');
            setFormOpen(false);
            setEditingMember(null);
        }
    };

    // فعال / غیرفعال‌سازی وضعیت کارمند
    const handleToggleStatus = async (targetMember: StaffMember) => {
        if (isRemoteRole) {
            try {
                setTogglingId(targetMember.id);
                const res = await fetch(getEndpoint(`/${targetMember.id}/toggle-status`), {
                    method: 'PATCH',
                    headers: getHeaders(),
                });
                const result = await res.json();
                if (res.ok && result.success) {
                    setRemoteStaffs((prev) =>
                        prev.map((item) =>
                            item.id === targetMember.id ? { ...item, active: result.data.active } : item
                        )
                    );
                    showProviderSuccess(result.message);
                } else {
                    showProviderError(result.message || 'خطا در تغییر وضعیت دسترسی');
                }
            } catch (err) {
                console.error('Toggle status error:', err);
                showProviderError('خطایی رخ داد.');
            } finally {
                setTogglingId(null);
            }
        } else {
            setLocalMemberActive(role, !targetMember.active);
            showProviderSuccess(targetMember.active ? 'حساب کارمند غیرفعال شد' : 'حساب کارمند فعال شد');
        }
    };

    // حذف دسترسی کارمند
    const handleRemove = async () => {
        if (!deletingMember) return;

        if (isRemoteRole) {
            try {
                const res = await fetch(getEndpoint(`/${deletingMember.id}`), {
                    method: 'DELETE',
                    headers: getHeaders(),
                });
                const result = await res.json();
                if (res.ok && result.success) {
                    setRemoteStaffs((prev) => prev.filter((item) => item.id !== deletingMember.id));
                    showProviderSuccess(result.message);
                } else {
                    showProviderError(result.message || 'خطا در حذف کارمند');
                }
            } catch (err) {
                showProviderError('خطا در ارتباط با سرور');
            }
        } else {
            removeLocalMember(role);
            showProviderSuccess('کارمند حذف شد');
        }
        setDeletingMember(null);
    };

    const copyLoginUrl = async () => {
        try {
            await navigator.clipboard.writeText(loginUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showProviderError('کپی لینک ممکن نشد');
        }
    };

    // لیست نهایی جهت نمایش
    const membersList: StaffMember[] = isRemoteRole
        ? remoteStaffs
        : localMember ? [localMember] : [];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`کارمندان (${config.title})`}
                description={`مدیریت ${config.title}‌ها و کنترل دسترسی آن‌ها به پنل پرسنلی`}
                actions={
                    <button
                        type="button"
                        onClick={() => {
                            setEditingMember(null);
                            setFormOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        افزودن {config.title} جدید
                    </button>
                }
            />

            {loading ? (
                <div className="flex h-36 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
                </div>
            ) : membersList.length > 0 ? (
                <div className="space-y-3">
                    {membersList.map((m) => (
                        <MemberCard
                            key={m.id}
                            member={m}
                            title={m.jobTitle || config.title}
                            disabledToggle={togglingId === m.id}
                            onEdit={() => {
                                setEditingMember(m);
                                setFormOpen(true);
                            }}
                            onToggle={() => handleToggleStatus(m)}
                            onRemove={() => setDeletingMember(m)}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState message={`هنوز هیچ ${config.title}ی ثبت نکرده‌اید.`} />
            )}

            {membersList.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700">لینک اختصاصی ورود پرسنل به پنل</p>
                        <p className="mt-1 truncate text-xs text-slate-500" dir="ltr">{loginUrl}</p>
                    </div>
                    <button
                        type="button"
                        onClick={copyLoginUrl}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'کپی شد' : 'کپی لینک ورود'}
                    </button>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        دسترسی‌های مجاز {config.title}
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
                        بخش‌های بدون دسترسی
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

            {formOpen && (
                <StaffFormModal
                    title={editingMember ? `ویرایش ${config.title}` : `افزودن ${config.title} جدید`}
                    role={role}
                    initial={editingMember ?? undefined}
                    isSubmitting={submitting}
                    onClose={() => {
                        setFormOpen(false);
                        setEditingMember(null);
                    }}
                    onSubmit={handleFormSubmit}
                />
            )}

            {deletingMember && (
                <ConfirmModal
                    title={`حذف ${config.title}`}
                    description={`آیا از حذف دسترسی «${deletingMember.name}» اطمینان دارید؟`}
                    note={`دسترسی این کاربر به پنل ${config.title} و مشاهده درخواست‌ها بلافاصله قطع خواهد شد.`}
                    confirmLabel={`حذف ${config.title}`}
                    onClose={() => setDeletingMember(null)}
                    onConfirm={handleRemove}
                />
            )}
        </div>
    );
}

function MemberCard({
                        member,
                        title,
                        disabledToggle,
                        onEdit,
                        onToggle,
                        onRemove,
                    }: {
    member: StaffMember;
    title: string;
    disabledToggle?: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
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
                    <p className="mt-0.5 text-xs text-slate-400">تاریخ ثبت: {formatDate(member.createdAt)}</p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    disabled={disabledToggle}
                    onClick={onToggle}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
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
                    className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                    <Pencil className="h-4 w-4" />
                    ویرایش
                </button>
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
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
                            role,
                            initial,
                            isSubmitting,
                            onClose,
                            onSubmit,
                        }: {
    title: string;
    role: ProviderRole;
    initial?: StaffMember;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (input: { name: string; phone: string; jobTitle?: string }) => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit = () => {
        const next: Record<string, string> = {};
        if (name.trim().length < 3) next.name = 'نام و نام خانوادگی را کامل وارد کنید';
        if (!isValidIranPhone(phone)) next.phone = 'شماره موبایل معتبر نیست';
        setErrors(next);
        if (Object.keys(next).length) return;
        onSubmit({
            name: name.trim(),
            phone: normalizePhone(phone),
            jobTitle: jobTitle.trim() || undefined
        });
    };

    return (
        <ProviderModal
            open
            onClose={onClose}
            title={title}
            description="پرسنل با این شماره موبایل و دریافت کد یک‌بار مصرف (OTP) وارد پنل اختصاصی کارمندان می‌شود."
            footer={
                <>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={submit}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        ذخیره
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <ProviderFormField label="نام و نام خانوادگی" required error={errors.name}>
                    <input
                        value={name}
                        disabled={isSubmitting}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        placeholder="مثال: مریم محمدی"
                    />
                </ProviderFormField>

                <ProviderFormField label="شماره موبایل" required error={errors.phone}>
                    <input
                        value={phone}
                        disabled={isSubmitting}
                        onChange={(e) => setPhone(normalizePhone(e.target.value))}
                        dir="ltr"
                        placeholder="09123456789"
                        className={inputClass}
                    />
                </ProviderFormField>

                {role === 'lab' && (
                    <ProviderFormField label="عنوان شغلی یا سمت (اختیاری)">
                        <input
                            value={jobTitle}
                            disabled={isSubmitting}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="مثال: نمونه‌گیر آزمایشگاه / پذیرش"
                            className={inputClass}
                        />
                    </ProviderFormField>
                )}

                {initial && initial.phone !== normalizePhone(phone) && (
                    <p className="text-xs text-amber-600">با تغییر شماره موبایل، کارمند باید با شماره جدید وارد پنل شود.</p>
                )}
            </div>
        </ProviderModal>
    );
}
