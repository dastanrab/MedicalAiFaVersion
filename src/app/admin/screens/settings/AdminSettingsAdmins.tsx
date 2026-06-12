import { useState } from 'react';
import {
    UserCog,
    Plus,
    Trash2,
    Shield,
    X,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import {
    adminRoleLabels,
    adminRoleStyles,
    type AdminRole,
} from '../../config/settingsOptions';
import { SettingsPanel, Field, inputClass } from './AdminSettingsGeneral';

export function AdminSettingsAdmins() {
    const admins = useSettingsStore((s) => s.admins);
    const addAdmin = useSettingsStore((s) => s.addAdmin);
    const updateAdmin = useSettingsStore((s) => s.updateAdmin);
    const removeAdmin = useSettingsStore((s) => s.removeAdmin);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', role: 'operator' as AdminRole });

    const handleAdd = () => {
        if (!form.name.trim() || !form.phone.trim()) return;
        addAdmin(form);
        setForm({ name: '', phone: '', role: 'operator' });
        setShowModal(false);
    };

    return (
        <>
            <SettingsPanel title="مدیریت ادمین‌ها" icon={UserCog}>
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        {admins.length.toLocaleString('fa-IR')} مدیر ثبت‌شده
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                    >
                        <Plus className="h-4 w-4" />
                        افزودن مدیر
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-right">
                                <th className="px-4 py-3 font-medium text-slate-600">نام</th>
                                <th className="px-4 py-3 font-medium text-slate-600">موبایل</th>
                                <th className="px-4 py-3 font-medium text-slate-600">نقش</th>
                                <th className="px-4 py-3 font-medium text-slate-600">تاریخ</th>
                                <th className="px-4 py-3 font-medium text-slate-600">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin) => (
                                <tr
                                    key={admin.id}
                                    className="border-b border-slate-100 last:border-0"
                                >
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        {admin.name}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600" dir="ltr">
                                        {admin.phone}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={admin.role}
                                            onChange={(e) =>
                                                updateAdmin(admin.id, {
                                                    role: e.target.value as AdminRole,
                                                })
                                            }
                                            className={`rounded-lg px-2.5 py-1 text-xs font-medium outline-none ${adminRoleStyles[admin.role]}`}
                                        >
                                            <option value="super_admin">
                                                {adminRoleLabels.super_admin}
                                            </option>
                                            <option value="operator">
                                                {adminRoleLabels.operator}
                                            </option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{admin.createdAt}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => removeAdmin(admin.id)}
                                            disabled={admins.length <= 1}
                                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                            title="حذف"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs text-violet-800">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        مدیر ارشد دسترسی کامل دارد. اپراتور فقط بخش‌های عملیاتی (کاربران،
                        نوبت‌ها، گفتگو) را مدیریت می‌کند.
                    </span>
                </div>
            </SettingsPanel>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">افزودن مدیر</h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <Field label="نام و نام خانوادگی">
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="شماره موبایل (نام کاربری)">
                                <input
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className={inputClass}
                                    dir="ltr"
                                />
                            </Field>
                            <Field label="نقش">
                                <select
                                    value={form.role}
                                    onChange={(e) =>
                                        setForm({ ...form, role: e.target.value as AdminRole })
                                    }
                                    className={inputClass}
                                >
                                    <option value="super_admin">
                                        {adminRoleLabels.super_admin}
                                    </option>
                                    <option value="operator">{adminRoleLabels.operator}</option>
                                </select>
                            </Field>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={!form.name.trim() || !form.phone.trim()}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" />
                                افزودن
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
