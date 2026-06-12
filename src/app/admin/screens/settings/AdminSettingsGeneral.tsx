import { useState } from 'react';
import { Globe, Image, Link2, Save, CheckCircle2 } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { syncAdminSettings } from '../../services/adminApi';
import { Switch } from '../../../components/ui/switch';

export function AdminSettingsGeneral() {
    const general = useSettingsStore((s) => s.general);
    const updateGeneral = useSettingsStore((s) => s.updateGeneral);
    const updateSocialLink = useSettingsStore((s) => s.updateSocialLink);

    const [appName, setAppName] = useState(general.appName);
    const [logoUrl, setLogoUrl] = useState(general.logoUrl ?? '');
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        const patch = {
            appName: appName.trim() || 'مدیرا AI',
            logoUrl: logoUrl.trim() || null,
        };
        updateGeneral(patch);
        const state = useSettingsStore.getState();
        await syncAdminSettings({ general: { ...state.general, ...patch } });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <SettingsPanel title="تنظیمات عمومی" icon={Globe}>
            <div className="space-y-6">
                <Field label="نام اپلیکیشن">
                    <input
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className={inputClass}
                        placeholder="نام نمایشی سامانه"
                    />
                </Field>

                <Field label="آدرس لوگو" hint="URL تصویر لوگو (اختیاری)">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Image className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                className={`${inputClass} pr-10`}
                                placeholder="https://example.com/logo.png"
                                dir="ltr"
                            />
                        </div>
                        {logoUrl && (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                <img
                                    src={logoUrl}
                                    alt="لوگو"
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </Field>

                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-slate-500" />
                        <h3 className="text-sm font-semibold text-slate-700">شبکه‌های اجتماعی</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {general.socialLinks.map((link) => (
                            <div
                                key={link.id}
                                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">
                                        {link.label}
                                    </span>
                                    <Switch
                                        checked={link.enabled}
                                        onCheckedChange={(checked) =>
                                            updateSocialLink(link.id, { enabled: checked })
                                        }
                                    />
                                </div>
                                <input
                                    value={link.href}
                                    onChange={(e) =>
                                        updateSocialLink(link.id, { href: e.target.value })
                                    }
                                    className={inputClass}
                                    placeholder="https://..."
                                    dir="ltr"
                                    disabled={!link.enabled}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <SaveButton onClick={handleSave} saved={saved} />
            </div>
        </SettingsPanel>
    );
}

export function SettingsPanel({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            </div>
            {children}
        </div>
    );
}

export function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
            {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
            {children}
        </div>
    );
}

export const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

export const textareaClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

export const primaryButtonClass =
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-500 to-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-600 hover:to-blue-700 hover:shadow-xl active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

export const primaryButtonSavedClass =
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition';

export function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={saved ? primaryButtonSavedClass : primaryButtonClass}
        >
            {saved ? (
                <>
                    <CheckCircle2 className="h-4 w-4" />
                    ذخیره شد
                </>
            ) : (
                <>
                    <Save className="h-4 w-4" />
                    ذخیره تغییرات
                </>
            )}
        </button>
    );
}
