import { useState, useEffect } from 'react';
import { PageHeader } from '../../components';
import {
    mockPharmacyProfile,
    mockNurseProfile,
    nurseServiceLabels,
} from '../../data/mockData';
import type { ProviderRole } from '../../config/providerNav';
import {useProviderSession} from "../../store/providerAuthStore";

interface ProviderSettingsPageProps {
    role: ProviderRole;
}

export function ProviderSettingsPage({ role }: ProviderSettingsPageProps) {
    const labSession = useProviderSession('lab');

    // استیت‌های آزمایشگاه بر اساس فیلدهای بک‌اند تنظیم شده‌اند
    const [lab, setLab] = useState({
        name: '',
        license_number: '',
        technical_manager: '',
        work_hours: '',
        address: '',
        status: 0,
        min_order_amount: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    // سایر استیت‌ها
    const [pharmacy, setPharmacy] = useState(mockPharmacyProfile);
    const [nurse, setNurse] = useState(mockNurseProfile);

    // واکشی اطلاعات آزمایشگاه در صورت نقش lab
    useEffect(() => {
        if (role === 'lab') {
            fetchLabProfile();
        }
    }, [role]);

    const fetchLabProfile = async () => {
        try {
            const token = localStorage.getItem('labSession');
            const res = await fetch('http://185.222.163.113:7000/api/owner/lab/profile', {
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                }
            });
            const json = await res.json();
            if (json.status && json.data) {
                setLab({
                    name: json.data.name || '',
                    license_number: json.data.license_number || '',
                    technical_manager: json.data.technical_manager || '',
                    work_hours: json.data.work_hours || '',
                    address: json.data.address || '',
                    status: json.data.status || 0,
                    min_order_amount: json.data.min_order_amount || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching lab profile:', error);
        }
    };

    const handleSaveLab = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://185.222.163.113:7000/api/owner/lab/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(lab)
            });
            const json = await res.json();
            if (json.status) {
                alert('تنظیمات با موفقیت ذخیره شد');
            } else {
                alert('خطا در ذخیره تنظیمات: ' + (json.message || ''));
            }
        } catch (error) {
            console.error('Error saving lab profile:', error);
            alert('خطای ارتباط با سرور');
        } finally {
            setIsLoading(false);
        }
    };

    const title =
        role === 'lab' ? 'تنظیمات آزمایشگاه'
            : role === 'pharmacy' ? 'تنظیمات داروخانه'
                : 'تنظیمات پروفایل';

    const saveButtonClass =
        role === 'lab'
            ? 'from-amber-700 via-amber-600 to-amber-500 shadow-amber-600/25 hover:shadow-amber-600/35'
            : role === 'pharmacy'
                ? 'from-teal-700 via-teal-600 to-teal-500 shadow-teal-600/25 hover:shadow-teal-600/35'
                : 'from-rose-700 via-rose-600 to-rose-500 shadow-rose-600/25 hover:shadow-rose-600/35';

    return (
        <div className="space-y-6">
            <PageHeader title={title} description="ویرایش اطلاعات و تنظیمات اعلان" />

            {role === 'lab' && (
                <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
                    <Field label="نام آزمایشگاه" value={lab.name} onChange={(v) => setLab({ ...lab, name: v })} />
                    <Field label="شماره مجوز" value={lab.license_number} onChange={(v) => setLab({ ...lab, license_number: v })} />
                    <Field label="مسئول فنی" value={lab.technical_manager} onChange={(v) => setLab({ ...lab, technical_manager: v })} />
                    <Field label="ساعات کاری" value={lab.work_hours} onChange={(v) => setLab({ ...lab, work_hours: v })} />
                    <Field label="آدرس" value={lab.address} onChange={(v) => setLab({ ...lab, address: v })} full />
                    <Toggle label="فعال" checked={lab.status === 1} onChange={(v) => setLab({ ...lab, status: v ? 1 : 0 })} />
                    <Field label="حداقل مبلغ سفارش (تومان)" value={String(lab.min_order_amount)} onChange={(v) => setLab({ ...lab, min_order_amount: Number(v) || 0 })} />
                </div>
            )}

            {/* بخش Pharmacy و Nurse تغییر نکرده‌اند و برای حفظ اختصار پنهان شده‌اند */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">تنظیمات اعلان</p>
                <div className="flex flex-wrap gap-6">
                    <Toggle label="Push" checked onChange={() => {}} />
                    <Toggle label="SMS" checked onChange={() => {}} />
                </div>
            </div>

            <button
                type="button"
                onClick={role === 'lab' ? handleSaveLab : undefined}
                disabled={isLoading}
                className={`inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-[300px] bg-gradient-to-l px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 ${saveButtonClass}`}
            >
                {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
        </div>
    );
}

function Field({
                   label, value, onChange, full,
               }: {
    label: string; value: string; onChange: (v: string) => void; full?: boolean;
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
                    label, checked, onChange,
                }: {
    label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded" />
            <span className="text-sm text-slate-700">{label}</span>
        </label>
    );
}
