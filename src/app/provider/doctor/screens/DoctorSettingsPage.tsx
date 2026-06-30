import { useState } from 'react';
import { PageHeader } from '../../components';
import { mockDoctorProfile } from '../data/mockDoctorData';
import { useDoctorAuthStore } from '../store/doctorAuthStore';

export function DoctorSettingsPage() {
    const doctor = useDoctorAuthStore((s) => s.doctor);
    const [profile, setProfile] = useState({
        name: doctor?.name ?? mockDoctorProfile.name,
        specialty: doctor?.specialty ?? mockDoctorProfile.specialty,
        medicalCode: doctor?.medicalCode ?? mockDoctorProfile.medicalCode,
        clinicAddress: mockDoctorProfile.clinicAddress,
        phone: mockDoctorProfile.phone,
        email: doctor?.email ?? mockDoctorProfile.email,
    });
    const [notifications, setNotifications] = useState({ push: true, sms: true, email: false });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // TODO: ذخیره تنظیمات پزشک از طریق API
        await new Promise((r) => setTimeout(r, 500));
        setSaving(false);
    };

    return (
        <div className="space-y-6">
            <PageHeader title="تنظیمات" description="اطلاعات پزشک و تنظیمات اعلان" />

            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
                <Field label="نام پزشک" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                <Field label="تخصص" value={profile.specialty} onChange={(v) => setProfile({ ...profile, specialty: v })} />
                <Field label="شماره نظام پزشکی" value={profile.medicalCode} onChange={(v) => setProfile({ ...profile, medicalCode: v })} />
                <Field label="تلفن مطب" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                <Field label="ایمیل" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
                <Field label="آدرس مطب" value={profile.clinicAddress} onChange={(v) => setProfile({ ...profile, clinicAddress: v })} full />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">تنظیمات اعلان</p>
                <div className="flex flex-wrap gap-6">
                    <Toggle
                        label="Push"
                        checked={notifications.push}
                        onChange={(v) => setNotifications({ ...notifications, push: v })}
                    />
                    <Toggle
                        label="SMS"
                        checked={notifications.sms}
                        onChange={(v) => setNotifications({ ...notifications, sms: v })}
                    />
                    <Toggle
                        label="Email"
                        checked={notifications.email}
                        onChange={(v) => setNotifications({ ...notifications, email: v })}
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    full,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    full?: boolean;
}) {
    return (
        <label className={`flex flex-col gap-1 ${full ? 'md:col-span-2' : ''}`}>
            <span className="text-xs text-slate-500">{label}</span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
        </label>
    );
}

function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-3">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 rounded"
            />
            <span className="text-sm text-slate-700">{label}</span>
        </label>
    );
}
