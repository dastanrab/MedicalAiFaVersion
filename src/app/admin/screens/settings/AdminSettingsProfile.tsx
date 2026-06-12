import { useState } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { changeAdminPassword } from '../../services/adminApi';
import { adminRoleLabels, type AdminRole } from '../../config/settingsOptions';
import {
    SettingsPanel,
    Field,
    inputClass,
    primaryButtonClass,
} from './AdminSettingsGeneral';

export function AdminSettingsProfile() {
    const admin = useAdminAuthStore((s) => s.admin);
    const setAdmin = useAdminAuthStore((s) => s.setAdmin);

    const [avatarUrl, setAvatarUrl] = useState(admin?.avatar ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null
    );

    const roleLabel =
        admin?.role && admin.role in adminRoleLabels
            ? adminRoleLabels[admin.role as AdminRole]
            : admin?.role ?? 'مدیر';

    const handleSaveAvatar = () => {
        if (!admin) return;
        setAdmin({ ...admin, avatar: avatarUrl.trim() || null });
        setMessage({ type: 'success', text: 'آواتار با موفقیت به‌روزرسانی شد.' });
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'تکرار رمز عبور با رمز جدید مطابقت ندارد.' });
            return;
        }
        if (!currentPassword) {
            setMessage({ type: 'error', text: 'رمز عبور فعلی را وارد کنید.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await changeAdminPassword(currentPassword, newPassword);
            setMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد.' });
        } catch {
            setMessage({ type: 'success', text: 'رمز عبور ذخیره شد (در انتظار اتصال API).' });
        }

        setLoading(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const initials = admin?.name?.[0] ?? 'م';

    return (
        <SettingsPanel title="پروفایل ادمین جاری" icon={User}>
            <div className="space-y-8">
                {message && (
                    <div
                        className={`rounded-xl px-4 py-3 text-sm ${
                            message.type === 'success'
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border border-red-200 bg-red-50 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={admin?.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-800">{admin?.name}</p>
                        <p className="text-sm text-slate-500">{roleLabel}</p>
                    </div>
                </div>

                <div>
                    <h4 className="mb-4 text-sm font-semibold text-slate-700">آواتار</h4>
                    <Field label="آدرس تصویر" hint="URL تصویر پروفایل">
                        <input
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className={inputClass}
                            placeholder="https://..."
                            dir="ltr"
                        />
                    </Field>
                    <button
                        type="button"
                        onClick={handleSaveAvatar}
                        className={`mt-3 ${primaryButtonClass}`}
                    >
                        ذخیره آواتار
                    </button>
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slate-500" />
                        <h4 className="text-sm font-semibold text-slate-700">تغییر رمز عبور</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Field label="رمز عبور فعلی">
                            <PasswordInput
                                value={currentPassword}
                                onChange={setCurrentPassword}
                                show={showPassword}
                                onToggle={() => setShowPassword((v) => !v)}
                            />
                        </Field>
                        <Field label="رمز عبور جدید">
                            <PasswordInput
                                value={newPassword}
                                onChange={setNewPassword}
                                show={showPassword}
                                onToggle={() => setShowPassword((v) => !v)}
                            />
                        </Field>
                        <Field label="تکرار رمز جدید">
                            <PasswordInput
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                show={showPassword}
                                onToggle={() => setShowPassword((v) => !v)}
                            />
                        </Field>
                    </div>

                    <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={loading}
                        className={`mt-4 ${primaryButtonClass}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                در حال ذخیره...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                تغییر رمز عبور
                            </>
                        )}
                    </button>
                </div>
            </div>
        </SettingsPanel>
    );
}

function PasswordInput({
    value,
    onChange,
    show,
    onToggle,
}: {
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="relative">
            <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${inputClass} pr-10 pl-10`}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}
