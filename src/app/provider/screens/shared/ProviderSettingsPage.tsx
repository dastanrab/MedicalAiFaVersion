import { useState } from 'react';
import { PageHeader } from '../../components';
import {
    mockLabProfile,
    mockPharmacyProfile,
    mockNurseProfile,
    nurseServiceLabels,
} from '../../data/mockData';
import type { ProviderRole } from '../../config/providerNav';

interface ProviderSettingsPageProps {
    role: ProviderRole;
}

export function ProviderSettingsPage({ role }: ProviderSettingsPageProps) {
    const [lab, setLab] = useState(mockLabProfile);
    const [pharmacy, setPharmacy] = useState(mockPharmacyProfile);
    const [nurse, setNurse] = useState(mockNurseProfile);

    const title =
        role === 'lab'
            ? 'تنظیمات آزمایشگاه'
            : role === 'pharmacy'
              ? 'تنظیمات داروخانه'
              : 'تنظیمات پروفایل';

    return (
        <div className="space-y-6">
            <PageHeader title={title} description="ویرایش اطلاعات و تنظیمات اعلان" />

            {role === 'lab' && (
                <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
                    <Field label="نام آزمایشگاه" value={lab.labName} onChange={(v) => setLab({ ...lab, labName: v })} />
                    <Field label="شماره مجوز" value={lab.licenseNumber} onChange={(v) => setLab({ ...lab, licenseNumber: v })} />
                    <Field label="مسئول فنی" value={lab.technicalManager} onChange={(v) => setLab({ ...lab, technicalManager: v })} />
                    <Field label="ساعات کاری" value={lab.workHours} onChange={(v) => setLab({ ...lab, workHours: v })} />
                    <Field label="آدرس" value={lab.address} onChange={(v) => setLab({ ...lab, address: v })} full />
                    <Toggle label="فعال" checked={lab.isActive} onChange={(v) => setLab({ ...lab, isActive: v })} />
                    <Toggle label="نمونه‌گیری در منزل" checked={lab.homeSamplingEnabled} onChange={(v) => setLab({ ...lab, homeSamplingEnabled: v })} />
                    <Field label="حداقل مبلغ سفارش (تومان)" value={String(lab.minOrderAmount)} onChange={(v) => setLab({ ...lab, minOrderAmount: Number(v) || 0 })} />
                </div>
            )}

            {role === 'pharmacy' && (
                <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
                    <Field label="نام داروخانه" value={pharmacy.pharmacyName} onChange={(v) => setPharmacy({ ...pharmacy, pharmacyName: v })} />
                    <Field label="شماره پروانه" value={pharmacy.licenseNumber} onChange={(v) => setPharmacy({ ...pharmacy, licenseNumber: v })} />
                    <Field label="مسئول فنی" value={pharmacy.pharmacist} onChange={(v) => setPharmacy({ ...pharmacy, pharmacist: v })} />
                    <Field label="ساعات کاری" value={pharmacy.workHours} onChange={(v) => setPharmacy({ ...pharmacy, workHours: v })} />
                    <Field label="آدرس" value={pharmacy.address} onChange={(v) => setPharmacy({ ...pharmacy, address: v })} full />
                    <Toggle label="فعال" checked={pharmacy.isActive} onChange={(v) => setPharmacy({ ...pharmacy, isActive: v })} />
                    <Toggle label="ارسال با پیک" checked={pharmacy.deliveryEnabled} onChange={(v) => setPharmacy({ ...pharmacy, deliveryEnabled: v })} />
                    <Field label="شعاع تحویل (km)" value={String(pharmacy.deliveryRadius)} onChange={(v) => setPharmacy({ ...pharmacy, deliveryRadius: Number(v) || 0 })} />
                    <Field label="هزینه ارسال (تومان)" value={String(pharmacy.deliveryFee)} onChange={(v) => setPharmacy({ ...pharmacy, deliveryFee: Number(v) || 0 })} />
                </div>
            )}

            {role === 'nurse' && (
                <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
                    <Field label="نام" value={nurse.firstName} onChange={(v) => setNurse({ ...nurse, firstName: v })} />
                    <Field label="نام خانوادگی" value={nurse.lastName} onChange={(v) => setNurse({ ...nurse, lastName: v })} />
                    <Field label="شماره نظام پرستاری" value={nurse.nursingCode} onChange={(v) => setNurse({ ...nurse, nursingCode: v })} />
                    <Field label="تعرفه (تومان)" value={String(nurse.serviceFee)} onChange={(v) => setNurse({ ...nurse, serviceFee: Number(v) || 0 })} />
                    <Field label="محدوده خدمت" value={nurse.coverage} onChange={(v) => setNurse({ ...nurse, coverage: v })} full />
                    <Field label="معرفی" value={nurse.bio} onChange={(v) => setNurse({ ...nurse, bio: v })} full />
                    <Toggle label="آماده دریافت درخواست" checked={nurse.isAvailable} onChange={(v) => setNurse({ ...nurse, isAvailable: v })} />
                    <div className="md:col-span-2">
                        <p className="mb-2 text-sm font-medium text-slate-700">خدمات قابل ارائه</p>
                        <div className="flex flex-wrap gap-2">
                            {nurse.services.map((s) => (
                                <span key={s} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                                    {nurseServiceLabels[s] ?? s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">تنظیمات اعلان</p>
                <div className="flex flex-wrap gap-6">
                    <Toggle label="Push" checked onChange={() => {}} />
                    <Toggle label="SMS" checked onChange={() => {}} />
                </div>
            </div>

            <button type="button" className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                ذخیره تغییرات
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
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
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
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded" />
            <span className="text-sm text-slate-700">{label}</span>
        </label>
    );
}
