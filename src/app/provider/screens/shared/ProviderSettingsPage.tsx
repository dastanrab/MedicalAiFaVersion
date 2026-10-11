import { useState, useEffect } from 'react';
import { PageHeader } from '../../components';
import {
    mockPharmacyProfile,
    mockNurseProfile,
} from '../../data/mockData';
import type { ProviderRole } from '../../config/providerNav';
import { useProviderSession } from "../../store/providerAuthStore";
import { formatPriceInput, parsePriceInput } from '../../../utils/formatNumber';

interface ProviderSettingsPageProps {
    role: ProviderRole;
}

export function ProviderSettingsPage({ role }: ProviderSettingsPageProps) {
    const labSession = useProviderSession('lab');

    // استیت‌های آزمایشگاه
    const [lab, setLab] = useState({
        name: '',
        license_number: '',
        technical_manager: '',
        work_hours: '',
        address: '',
        status: 0,
        min_order_amount: 0,
        home_acceptance: 0, // فیلد جدید
        in_person_acceptance: 0, // فیلد جدید
    });

    // استیت‌های مربوط به تصویر
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // سایر استیت‌ها
    const [pharmacy, setPharmacy] = useState(mockPharmacyProfile);
    const [nurse, setNurse] = useState(mockNurseProfile);

    // مدیریت پیش‌نمایش تصویر انتخابی
    useEffect(() => {
        if (!imageFile) return;
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    useEffect(() => {
        if (role === 'lab') {
            fetchLabProfile();
        }
    }, [role]);

    const fetchLabProfile = async () => {
        try {
            const token = labSession?.token; // استفاده از توکن استور
            const res = await fetch('https://api.mediraai.com/api/owner/lab/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
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
                    status: Number(json.data.status ?? 0),
                    min_order_amount: Number(json.data.min_order_amount ?? 0),
                    home_acceptance: Number(json.data.home_acceptance ?? 0),
                    in_person_acceptance: Number(json.data.in_person_acceptance ?? 0),
                });
                if (json.data.image_url) {
                    setImagePreview(json.data.image_url);
                }
            }
        } catch (error) {
            console.error('Error fetching lab profile:', error);
        }
    };

    const handleSaveLab = async () => {
        setIsLoading(true);
        try {
            const token = labSession?.token;

            // استفاده از FormData برای ارسال فایل و فیلدها
            const formData = new FormData();

            // چون متد در بک‌اند PUT است اما فایل می‌فرستیم، از متد تقلبی لاراول استفاده می‌کنیم
            formData.append('_method', 'PUT');

            formData.append('name', lab.name);
            formData.append('license_number', lab.license_number);
            formData.append('technical_manager', lab.technical_manager);
            formData.append('work_hours', lab.work_hours);
            formData.append('address', lab.address);
            formData.append('status', String(lab.status));
            formData.append('min_order_amount', String(lab.min_order_amount));
            formData.append('home_acceptance', String(lab.home_acceptance));
            formData.append('in_person_acceptance', String(lab.in_person_acceptance));

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch('https://api.mediraai.com/api/owner/lab/profile', {
                method: 'POST', // برای FormData همیشه POST استفاده کنید
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    // Content-Type نباید ست شود، مرورگر خودش آن را با Boundary تنظیم می‌کند
                },
                body: formData
            });

            const json = await res.json();
            if (json.status) {
                alert('تنظیمات با موفقیت ذخیره شد');
                setImageFile(null); // ریست کردن فایل انتخابی
                fetchLabProfile(); // بروزرسانی اطلاعات
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

                    <Field
                        label="حداقل مبلغ سفارش (تومان)"
                        value={formatPriceInput(lab.min_order_amount)}
                        onChange={(v) => setLab({ ...lab, min_order_amount: Number(parsePriceInput(v)) || 0 })}
                    />

                    {/* بخش آپلود تصویر */}
                    <div className="md:col-span-2 space-y-2">
                        <span className="text-xs text-slate-500">تصویر آزمایشگاه</span>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                            />
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 flex flex-wrap gap-8 mt-2">
                        <Toggle
                            label="فعالیت آزمایشگاه"
                            checked={lab.status === 1}
                            onChange={(v) => setLab({ ...lab, status: v ? 1 : 0 })}
                        />
                        <Toggle
                            label="پذیرش در منزل"
                            checked={lab.home_acceptance === 1}
                            onChange={(v) => setLab({ ...lab, home_acceptance: v ? 1 : 0 })}
                        />
                        <Toggle
                            label="پذیرش حضوری"
                            checked={lab.in_person_acceptance === 1}
                            onChange={(v) => setLab({ ...lab, in_person_acceptance: v ? 1 : 0 })}
                        />
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
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-700">{label}</span>
        </label>
    );
}
