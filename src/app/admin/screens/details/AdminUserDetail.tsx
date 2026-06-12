import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, BadgeCheck, Loader2, Save, ShieldBan, ShieldCheck } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAdminDataStore } from '../../store/adminDataStore';
import { fetchAdminUser, updateAdminUser, verifyAdminUser } from '../../services/adminApi';
import {
    userTypeLabels,
    userStatusLabels,
    userStatusStyles,
    userTypeFields,
    type AdminUserRow,
    type UserStatus,
} from '../../config/userOptions';

export function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useAdminAuthStore((s) => s.token);
    const addActivity = useAdminDataStore((s) => s.addActivity);
    const [user, setUser] = useState<AdminUserRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', province: '', city: '', status: 'active' as UserStatus });

    const load = useCallback(async () => {
        if (!id || !token) return;
        setLoading(true);
        try {
            const data = await fetchAdminUser(Number(id));
            if (data) {
                setUser(data);
                setForm({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    province: data.province,
                    city: data.city,
                    status: data.status,
                });
            }
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const updated = await updateAdminUser(user.id, {
                name: `${form.firstName} ${form.lastName}`,
                phone: form.phone,
                province: form.province,
                city: form.city,
                status: form.status === 'active' ? 1 : form.status === 'blocked' ? 0 : 2,
            });
            setUser(updated);
            addActivity({ type: 'user', message: `ویرایش کاربر ${form.firstName} ${form.lastName}`, link: `/admin/users/${user.id}` });
        } catch {
            setUser({ ...user, ...form });
        } finally {
            setSaving(false);
        }
    };

    const handleVerify = async (approved: boolean) => {
        if (!user) return;
        await verifyAdminUser(user.id, approved);
        setUser({ ...user, isVerified: approved });
        addActivity({ type: 'verification', message: approved ? `تأیید ${user.firstName}` : `رد ${user.firstName}` });
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
    }

    if (!user) {
        return (
            <div className="text-center">
                <p className="text-slate-500">کاربر یافت نشد</p>
                <Link to="/admin/users" className="mt-4 inline-block text-indigo-600">بازگشت</Link>
            </div>
        );
    }

    const fields = userTypeFields[user.type] ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => navigate('/admin/users')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                    <ArrowRight className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">{user.firstName} {user.lastName}</h2>
                    <p className="text-sm text-slate-500">{userTypeLabels[user.type]} — #{user.id}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="font-semibold text-slate-800">ویرایش اطلاعات</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="نام" className="h-11 rounded-xl border px-3 text-sm" />
                        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="نام خانوادگی" className="h-11 rounded-xl border px-3 text-sm" />
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="موبایل" dir="ltr" className="h-11 rounded-xl border px-3 text-sm" />
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })} className="h-11 rounded-xl border px-3 text-sm">
                            {Object.entries(userStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="استان" className="h-11 rounded-xl border px-3 text-sm" />
                        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="شهر" className="h-11 rounded-xl border px-3 text-sm" />
                    </div>
                    {fields.length > 0 && user.details && (
                        <div className="mt-4 border-t pt-4">
                            <h4 className="mb-3 text-sm font-medium text-slate-700">فیلدهای اختصاصی</h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {fields.map((f) => (
                                    <div key={f.name} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                        <span className="text-slate-500">{f.label}: </span>
                                        <span>{user.details?.[f.name] ?? '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button type="button" onClick={handleSave} disabled={saving} className="mt-4 flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm text-white">
                        <Save className="h-4 w-4" /> {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="font-semibold text-slate-800">وضعیت</h3>
                        <div className="mt-3 flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset ${userStatusStyles[user.status]}`}>{userStatusLabels[user.status]}</span>
                            {user.isVerified && <BadgeCheck className="h-5 w-5 text-sky-500" />}
                        </div>
                        {!user.isVerified && ['doctor', 'pharmacy', 'lab', 'nurse'].includes(user.type) && (
                            <div className="mt-4 flex gap-2">
                                <button type="button" onClick={() => handleVerify(true)} className="flex-1 rounded-xl bg-emerald-50 py-2 text-xs text-emerald-700">تأیید احراز</button>
                                <button type="button" onClick={() => handleVerify(false)} className="flex-1 rounded-xl bg-red-50 py-2 text-xs text-red-700">رد</button>
                            </div>
                        )}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-3 font-semibold text-slate-800">تاریخچه</h3>
                        <p className="text-xs text-slate-500">نوبت‌ها و پرداخت‌ها پس از اتصال API جزئیات نمایش داده می‌شوند.</p>
                        <Link to="/admin/appointments" className="mt-2 block text-xs text-indigo-600">مشاهده نوبت‌ها</Link>
                        <Link to="/admin/payments" className="mt-1 block text-xs text-indigo-600">مشاهده پرداخت‌ها</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
