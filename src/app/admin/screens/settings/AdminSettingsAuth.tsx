import { useState } from 'react';
import { Shield, Clock, KeyRound } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import {
    SettingsPanel,
    Field,
    inputClass,
    SaveButton,
} from './AdminSettingsGeneral';

export function AdminSettingsAuth() {
    const auth = useSettingsStore((s) => s.auth);
    const updateAuth = useSettingsStore((s) => s.updateAuth);

    const [form, setForm] = useState({ ...auth });
    const [saved, setSaved] = useState(false);

    const set = (key: keyof typeof form, value: number) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = () => {
        updateAuth({
            otpLength: Math.min(8, Math.max(4, form.otpLength)),
            otpExpiryMinutes: Math.max(1, form.otpExpiryMinutes),
            resendCooldownSeconds: Math.max(30, form.resendCooldownSeconds),
            accessTokenExpiryHours: Math.max(1, form.accessTokenExpiryHours),
            refreshTokenExpiryDays: Math.max(1, form.refreshTokenExpiryDays),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <SettingsPanel title="احراز هویت و امنیت" icon={Shield}>
            <div className="space-y-6">
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    تنظیمات OTP در صفحه ورود کاربر اعمال می‌شود. مدت اعتبار توکن برای API
                    backend در نظر گرفته می‌شود.
                </div>

                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-slate-500" />
                        <h4 className="text-sm font-semibold text-slate-700">قوانین OTP</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Field label="طول کد OTP (رقم)">
                            <input
                                type="number"
                                min={4}
                                max={8}
                                value={form.otpLength}
                                onChange={(e) => set('otpLength', Number(e.target.value))}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="مدت اعتبار OTP (دقیقه)">
                            <input
                                type="number"
                                min={1}
                                value={form.otpExpiryMinutes}
                                onChange={(e) => set('otpExpiryMinutes', Number(e.target.value))}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="فاصله ارسال مجدد (ثانیه)">
                            <input
                                type="number"
                                min={30}
                                value={form.resendCooldownSeconds}
                                onChange={(e) =>
                                    set('resendCooldownSeconds', Number(e.target.value))
                                }
                                className={inputClass}
                            />
                        </Field>
                    </div>
                </div>

                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <h4 className="text-sm font-semibold text-slate-700">اعتبار توکن</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Access Token (ساعت)">
                            <input
                                type="number"
                                min={1}
                                value={form.accessTokenExpiryHours}
                                onChange={(e) =>
                                    set('accessTokenExpiryHours', Number(e.target.value))
                                }
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Refresh Token (روز)">
                            <input
                                type="number"
                                min={1}
                                value={form.refreshTokenExpiryDays}
                                onChange={(e) =>
                                    set('refreshTokenExpiryDays', Number(e.target.value))
                                }
                                className={inputClass}
                            />
                        </Field>
                    </div>
                </div>

                <SaveButton onClick={handleSave} saved={saved} />
            </div>
        </SettingsPanel>
    );
}
