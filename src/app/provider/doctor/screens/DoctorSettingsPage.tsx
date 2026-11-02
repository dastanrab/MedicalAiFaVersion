import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components';
import { PanelPageSkeleton } from '../../../components/PageSkeleton';
import { useDoctorAuthStore } from '../store/doctorAuthStore';
import { Camera, User, MessageSquare } from 'lucide-react';
import { ProvinceCitySelector } from '../../../components/ProvinceCitySelector';
import { formatPriceInput, parsePriceInput } from '../../../utils/formatNumber';

const BASE_URL = 'https://api.mediraai.com/api';

export function DoctorSettingsPage() {
    const token = useDoctorAuthStore((state) => state.token);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState({
        name: '',
        specialty: '',
        medical_code: '',
        address: '',
        phone: '',
        office_phone: '',
        email: '',
        // تعرفه‌ها
        visit_price: '',
        phone_consultation_price: '',
        video_consultation_price: '',
        // مشاوره متنی
        is_text_consultation_enabled: false,
        text_consultation_price: '',
        // استان و شهر (فقط خواندنی)
        province_id: '',
        city_id: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${BASE_URL}/doctor/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                const responseData = await res.json();

                if (res.ok) {
                    const docInfo = responseData.doctor || responseData.data || responseData;

                    setProfile({
                        name: docInfo.name || '',
                        specialty: docInfo.specialty || '',
                        medical_code: docInfo.medical_code || '',
                        address: docInfo.address || '',
                        phone: docInfo.phone || '',
                        office_phone: docInfo.office_phone || '',
                        email: docInfo.email || '',
                        visit_price: docInfo.visit_price ? String(docInfo.visit_price) : '',
                        phone_consultation_price: docInfo.phone_consultation_price ? String(docInfo.phone_consultation_price) : '',
                        video_consultation_price: docInfo.video_consultation_price ? String(docInfo.video_consultation_price) : '',
                        is_text_consultation_enabled: Boolean(docInfo.is_text_consultation_enabled),
                        text_consultation_price: docInfo.text_consultation_price ? String(docInfo.text_consultation_price) : '',
                        province_id: docInfo.province_id || '',
                        city_id: docInfo.city_id || ''
                    });

                    if (docInfo.image_url) {
                        setPreviewUrl(docInfo.image_url);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');

            // فیلدهای مجاز برای ویرایش
            formData.append('name', profile.name);
            formData.append('address', profile.address);
            formData.append('phone', profile.phone);
            formData.append('office_phone', profile.office_phone);
            formData.append('email', profile.email);

            // تعرفه‌ها به تومان
            formData.append('visit_price', profile.visit_price ? profile.visit_price.toString() : '');
            formData.append('phone_consultation_price', profile.phone_consultation_price ? profile.phone_consultation_price.toString() : '');
            formData.append('video_consultation_price', profile.video_consultation_price ? profile.video_consultation_price.toString() : '');

            // وضعیت و تعرفه مشاوره متنی
            formData.append('is_text_consultation_enabled', profile.is_text_consultation_enabled ? '1' : '0');
            formData.append(
                'text_consultation_price',
                profile.is_text_consultation_enabled && profile.text_consultation_price
                    ? profile.text_consultation_price.toString()
                    : ''
            );

            // توجه: فیلدهای medical_code، province_id و city_id طبق درخواست عمداً ارسال نمی‌شوند.

            if (imageFile) {
                formData.append('avatar', imageFile);
            }

            const res = await fetch(`${BASE_URL}/doctor/profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            });

            if (res.ok) {
                setMessage({ text: 'اطلاعات با موفقیت ذخیره شد.', type: 'success' });
            } else {
                const errorData = await res.json();
                setMessage({ text: errorData.message || 'خطا در ذخیره اطلاعات.', type: 'error' });
            }
        } catch {
            setMessage({ text: 'خطای ارتباط با سرور.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PanelPageSkeleton />;
    }

    return (
        <div className="space-y-6 pb-12">
            <PageHeader title="تنظیمات" description="اطلاعات پزشک، تصویر پروفایل و تعرفه‌ها" />

            {message.text && (
                <div className={`rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* بخش تصویر پروفایل */}
            <div className="flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-inner">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <User size={40} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-slate-700">تصویر پروفایل</h3>
                    <p className="text-xs text-slate-500 mb-2">تصویر با فرمت JPG یا PNG انتخاب کنید.</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Camera size={16} />
                        تغییر تصویر
                    </button>
                </div>
            </div>

            {/* بخش اطلاعات پایه و موقعیت (با فیلدهای قفل‌شده) */}
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2 shadow-sm">
                <div className="col-span-full mb-1">
                    <h3 className="text-sm font-semibold text-slate-800">اطلاعات هویتی و آدرس مطب</h3>
                </div>

                <Field label="نام و نام خانوادگی" value={profile.name} onChange={(v) => setProfile(prev => ({ ...prev, name: v }))} />
                <Field label="شماره موبایل" value={profile.phone} onChange={(v) => setProfile(prev => ({ ...prev, phone: v }))} />

                <Field label="تخصص" value={profile.specialty} onChange={() => {}} disabled />
                <Field label="شماره نظام پزشکی (غیرقابل تغییر)" value={profile.medical_code} onChange={() => {}} disabled />

                <Field label="ایمیل" value={profile.email} onChange={(v) => setProfile(prev => ({ ...prev, email: v }))} />
                <Field label="تلفن ثابت مطب" value={profile.office_phone} onChange={(v) => setProfile(prev => ({ ...prev, office_phone: v }))} />

                {/* استان و شهر قفل‌شده (Disabled) */}
                <div className="md:col-span-2 pointer-events-none opacity-60">
                    <ProvinceCitySelector
                        provinceId={profile.province_id ? Number(profile.province_id) : ''}
                        cityId={profile.city_id ? Number(profile.city_id) : ''}
                        onProvinceChange={() => {}}
                        onCityChange={() => {}}
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">استان و شهر فقط توسط پشتیبانی قابل تغییر است.</span>
                </div>

                <Field label="آدرس مطب" value={profile.address} onChange={(v) => setProfile(prev => ({ ...prev, address: v }))} full />
            </div>

            {/* بخش کاملاً ایزوله‌شده تعرفه‌ها و تنظیمات نوبت‌دهی */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-semibold text-slate-800">مدیریت تعرفه و خدمات نوبت‌دهی</h3>
                    <p className="text-xs text-slate-500 mt-1">کلیه مبالغ را بر حسب <span className="font-bold text-slate-700">تومان</span> وارد کنید.</p>
                </div>

                {/* ویزیت حضوری و مشاوره‌ها */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Field
                        label="هزینه ویزیت حضوری"
                        value={profile.visit_price}
                        onChange={(v) => setProfile(prev => ({ ...prev, visit_price: v }))}
                        type="price"
                    />
                    <Field
                        label="هزینه مشاوره تلفنی"
                        value={profile.phone_consultation_price}
                        onChange={(v) => setProfile(prev => ({ ...prev, phone_consultation_price: v }))}
                        type="price"
                    />
                    <Field
                        label="هزینه مشاوره تصویری"
                        value={profile.video_consultation_price}
                        onChange={(v) => setProfile(prev => ({ ...prev, video_consultation_price: v }))}
                        type="price"
                    />
                </div>

                {/* بلوک مستقل مشاوره متنی با تاگل سوئیچ */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-800">فعال‌سازی مشاوره متنی</h4>
                                <p className="text-xs text-slate-500">امکان دریافت پیام و ارسال نسخه/پاسخ متنی توسط بیمار</p>
                            </div>
                        </div>

                        {/* سوئیچ تاگل */}
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={profile.is_text_consultation_enabled}
                                onChange={(e) => setProfile(prev => ({ ...prev, is_text_consultation_enabled: e.target.checked }))}
                                className="peer sr-only"
                            />
                            <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-[2px] after:right-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all"></div>
                        </label>
                    </div>

                    {/* فیلد مبلغ مشاوره متنی تنها در صورت فعال بودن تاگل نمایش داده می‌شود */}
                    {profile.is_text_consultation_enabled && (
                        <div className="mt-4 pt-4 border-t border-slate-200/60 max-w-sm">
                            <Field
                                label="هزینه مشاوره متنی"
                                value={profile.text_consultation_price}
                                onChange={(v) => setProfile(prev => ({ ...prev, text_consultation_price: v }))}
                                type="price"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
            </div>
        </div>
    );
}

function Field({
                   label,
                   value,
                   onChange,
                   full,
                   disabled = false,
                   type = "text"
               }: {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    full?: boolean;
    disabled?: boolean;
    type?: string;
}) {
    const isPrice = type === 'price';
    return (
        <label className={`flex flex-col gap-1.5 ${full ? 'md:col-span-2' : ''} ${disabled ? 'opacity-75' : ''}`}>
            <span className="text-xs font-medium text-slate-600">{label}</span>
            <div className="relative">
                <input
                    type={isPrice ? 'text' : type}
                    inputMode={isPrice ? 'numeric' : undefined}
                    dir={isPrice ? 'ltr' : undefined}
                    value={isPrice ? formatPriceInput(value) : (value ?? '')}
                    onChange={(e) => onChange(isPrice ? parsePriceInput(e.target.value) : e.target.value)}
                    disabled={disabled}
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors ${
                        isPrice ? 'pl-14' : ''
                    } ${
                        disabled
                            ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500'
                            : 'border-slate-200 focus:border-blue-500 bg-white'
                    }`}
                />
                {isPrice && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        تومان
                    </span>
                )}
            </div>
        </label>
    );
}
