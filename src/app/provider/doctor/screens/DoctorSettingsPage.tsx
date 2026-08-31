import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components';
import { useDoctorAuthStore } from '../store/doctorAuthStore';
import { Camera, User } from 'lucide-react';
import {ProvinceCitySelector} from "../../../components/ProvinceCitySelector";
// توجه: مسیر ایمپورت ProvinceCitySelector را بر اساس ساختار پوشه‌های خود تنظیم کنید


const BASE_URL = 'http://185.222.163.113:7000/api';

export function DoctorSettingsPage() {
    const token = useDoctorAuthStore((state) => state.token);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // افزودن province_id و city_id به استیت
    const [profile, setProfile] = useState({
        name: '',
        specialty: '',
        medical_code: '',
        address: '',
        phone: '',
        office_phone: '',
        email: '',
        visit_price: '',
        phone_consultation_price: '',
        video_consultation_price: '',
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
                        visit_price: docInfo.visit_price || '',
                        phone_consultation_price: docInfo.phone_consultation_price || '',
                        video_consultation_price: docInfo.video_consultation_price || '',
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

            formData.append('name', profile.name);
            formData.append('medical_code', profile.medical_code);
            formData.append('address', profile.address);
            formData.append('phone', profile.phone);
            formData.append('office_phone', profile.office_phone);
            formData.append('email', profile.email);

            // افزودن تعرفه‌ها (چک کردن خالی نبودن مقدار)
            formData.append('visit_price', profile.visit_price ? profile.visit_price.toString() : '');
            formData.append('phone_consultation_price', profile.phone_consultation_price ? profile.phone_consultation_price.toString() : '');
            formData.append('video_consultation_price', profile.video_consultation_price ? profile.video_consultation_price.toString() : '');

            // افزودن استان و شهر به FormData
            if (profile.province_id) formData.append('province_id', profile.province_id.toString());
            if (profile.city_id) formData.append('city_id', profile.city_id.toString());

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
                setMessage({ text: 'اطلاعات و تصویر با موفقیت بروزرسانی شد.', type: 'success' });
            } else {
                const errorData = await res.json();
                setMessage({ text: errorData.message || 'خطا در ذخیره اطلاعات.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'خطای ارتباط با سرور.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-slate-500">در حال دریافت اطلاعات پروفایل...</div>;
    }

    return (
        <div className="space-y-6 pb-12">
            <PageHeader title="تنظیمات" description="اطلاعات پزشک، تصویر پروفایل و تعرفه‌ها" />

            {message.text && (
                <div className={`rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* بخش آپلود تصویر */}
            <div className="flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm">
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

            {/* بخش اطلاعات هویتی و تماس */}
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
                <Field label="نام و نام خانوادگی" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                <Field label="شماره موبایل" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />

                <Field label="تخصص" value={profile.specialty} onChange={() => {}} disabled />
                <Field label="شماره نظام پزشکی" value={profile.medical_code} onChange={(v) => setProfile({ ...profile, medical_code: v })} />

                <Field label="ایمیل" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
                <Field label="تلفن ثابت مطب" value={profile.office_phone} onChange={(v) => setProfile({ ...profile, office_phone: v })} />

                {/* اضافه کردن کامپوننت انتخاب استان و شهر */}
                {/* اضافه کردن کامپوننت انتخاب استان و شهر */}
                <div className="md:col-span-2">
                    <ProvinceCitySelector
                        provinceId={profile.province_id ? Number(profile.province_id) : ''}
                        cityId={profile.city_id ? Number(profile.city_id) : ''}
                        // به جای profile از prev استفاده کنید:
                        onProvinceChange={(val) => setProfile(prev => ({ ...prev, province_id: val.toString(), city_id: '' }))}
                        onCityChange={(val) => setProfile(prev => ({ ...prev, city_id: val.toString() }))}
                    />
                </div>


                <Field label="آدرس مطب" value={profile.address} onChange={(v) => setProfile({ ...profile, address: v })} full />
            </div>

            {/* بخش تعرفه‌ها */}
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-3">
                <div className="col-span-full mb-2">
                    <h3 className="text-sm font-semibold text-slate-700">تعرفه‌های پزشکی (تومان)</h3>
                </div>
                <Field
                    label="هزینه ویزیت حضوری"
                    value={profile.visit_price}
                    onChange={(v) => setProfile({ ...profile, visit_price: v })}
                    type="number"
                />
                <Field
                    label="هزینه مشاوره تلفنی"
                    value={profile.phone_consultation_price}
                    onChange={(v) => setProfile({ ...profile, phone_consultation_price: v })}
                    type="number"
                />
                <Field
                    label="هزینه مشاوره ویدیویی"
                    value={profile.video_consultation_price}
                    onChange={(v) => setProfile({ ...profile, video_consultation_price: v })}
                    type="number"
                />
            </div>

            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
    return (
        <label className={`flex flex-col gap-1 ${full ? 'md:col-span-2' : ''} ${disabled ? 'opacity-70' : ''}`}>
            <span className="text-xs text-slate-500">{label}</span>
            <input
                type={type}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`rounded-xl border px-3 py-2 text-sm outline-none transition-colors ${
                    disabled
                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                        : 'border-slate-200 focus:border-blue-400 bg-white'
                }`}
            />
        </label>
    );
}
