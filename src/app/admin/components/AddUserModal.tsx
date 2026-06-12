import { useMemo, useState } from 'react';
import {
    X,
    User,
    Stethoscope,
    Pill,
    FlaskConical,
    HeartPulse,
    UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { iranProvinces, iranCitiesByProvince } from '../../data/iranLocations';
import {
    userTypeLabels,
    userTypeFields,
    type AdminUserRow,
    type UserType,
    type UserStatus,
    type UserField,
} from '../config/userOptions';

interface AddUserModalProps {
    onClose: () => void;
    onSubmit: (user: Omit<AdminUserRow, 'id'>) => void | Promise<void>;
}

const typeIcons: Record<UserType, LucideIcon> = {
    patient: User,
    doctor: Stethoscope,
    pharmacy: Pill,
    lab: FlaskConical,
    nurse: HeartPulse,
};

const typeAccent: Record<UserType, string> = {
    patient: 'data-[active=true]:border-slate-400 data-[active=true]:bg-slate-50 data-[active=true]:text-slate-700',
    doctor: 'data-[active=true]:border-indigo-400 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700',
    pharmacy: 'data-[active=true]:border-teal-400 data-[active=true]:bg-teal-50 data-[active=true]:text-teal-700',
    lab: 'data-[active=true]:border-amber-400 data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700',
    nurse: 'data-[active=true]:border-rose-400 data-[active=true]:bg-rose-50 data-[active=true]:text-rose-700',
};

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

const userTypeOrder: UserType[] = ['patient', 'doctor', 'lab', 'pharmacy', 'nurse'];

export function AddUserModal({ onClose, onSubmit }: AddUserModalProps) {
    const [type, setType] = useState<UserType>('patient');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [status, setStatus] = useState<UserStatus>('active');
    const [details, setDetails] = useState<Record<string, string>>({});

    const [error, setError] = useState('');

    const cities = province === '' ? [] : iranCitiesByProvince[province] ?? [];
    const fields = userTypeFields[type];

    const setDetail = (name: string, value: string) =>
        setDetails((prev) => ({ ...prev, [name]: value }));

    const handleTypeChange = (next: UserType) => {
        setType(next);
        setDetails({});
        setError('');
    };

    const requiredDetails = useMemo(
        () => fields.filter((f) => f.required),
        [fields]
    );

    const handleSubmit = () => {
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
            setError('نام، نام خانوادگی و شماره موبایل الزامی است.');
            return;
        }
        if (!province || !city) {
            setError('انتخاب استان و شهر الزامی است.');
            return;
        }
        const missing = requiredDetails.find((f) => !(details[f.name] ?? '').trim());
        if (missing) {
            setError(`فیلد «${missing.label}» الزامی است.`);
            return;
        }

        onSubmit({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            province,
            city,
            status,
            type,
            isVerified: false,
            avatar: null,
            details,
        });
    };

    const renderField = (field: UserField) => {
        const value = details[field.name] ?? '';
        const labelEl = (
            <label className="mb-1.5 block text-xs text-slate-500">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
            </label>
        );

        if (field.type === 'select') {
            return (
                <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                    {labelEl}
                    <select
                        value={value}
                        onChange={(e) => setDetail(field.name, e.target.value)}
                        className={inputClass}
                    >
                        <option value="">انتخاب کنید</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (field.type === 'textarea') {
            return (
                <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                    {labelEl}
                    <textarea
                        value={value}
                        onChange={(e) => setDetail(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        rows={2}
                        className={`${inputClass} h-auto py-2.5`}
                    />
                </div>
            );
        }

        return (
            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                {labelEl}
                <input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={value}
                    onChange={(e) => setDetail(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    dir={field.ltr ? 'ltr' : undefined}
                    className={`${inputClass} ${field.ltr ? 'text-right' : ''}`}
                />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* هدر */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">افزودن کاربر</h3>
                            <p className="text-xs text-slate-500">ابتدا نوع هویت کاربری را انتخاب کنید</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* انتخاب نوع کاربری */}
                    <div className="mb-6">
                        <label className="mb-2 block text-xs text-slate-500">نوع هویت کاربری</label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                            {userTypeOrder.map((t) => {
                                const Icon = typeIcons[t];
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        data-active={type === t}
                                        onClick={() => handleTypeChange(t)}
                                        className={`flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 ${typeAccent[t]}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {userTypeLabels[t]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* اطلاعات پایه */}
                    <div className="mb-5">
                        <h4 className="mb-3 text-sm font-medium text-slate-700">اطلاعات پایه</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs text-slate-500">
                                    نام<span className="text-red-500"> *</span>
                                </label>
                                <input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="نام"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-slate-500">
                                    نام خانوادگی<span className="text-red-500"> *</span>
                                </label>
                                <input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="نام خانوادگی"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-slate-500">
                                    شماره موبایل<span className="text-red-500"> *</span>
                                </label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="09..."
                                    dir="ltr"
                                    className={`${inputClass} text-right`}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-slate-500">وضعیت</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                                    className={inputClass}
                                >
                                    <option value="active">فعال</option>
                                    <option value="inactive">غیرفعال</option>
                                    <option value="blocked">مسدود</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-slate-500">
                                    استان<span className="text-red-500"> *</span>
                                </label>
                                <select
                                    value={province}
                                    onChange={(e) => {
                                        setProvince(e.target.value);
                                        setCity('');
                                    }}
                                    className={inputClass}
                                >
                                    <option value="">انتخاب استان</option>
                                    {iranProvinces.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-slate-500">
                                    شهر<span className="text-red-500"> *</span>
                                </label>
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    disabled={province === ''}
                                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                                >
                                    <option value="">انتخاب شهر</option>
                                    {cities.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* فیلدهای اختصاصی */}
                    <div>
                        <h4 className="mb-3 text-sm font-medium text-slate-700">
                            اطلاعات اختصاصی «{userTypeLabels[type]}»
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {fields.map(renderField)}
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                            {error}
                        </p>
                    )}
                </div>

                {/* فوتر */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-l from-indigo-500 to-violet-600 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-400 hover:to-violet-500"
                    >
                        <UserPlus className="h-5 w-5" />
                        ثبت کاربر
                    </button>
                </div>
            </div>
        </div>
    );
}
