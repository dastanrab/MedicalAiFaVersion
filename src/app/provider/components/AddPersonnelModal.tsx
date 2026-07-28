import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ProviderModal, ProviderFormField, inputClass } from './ProviderModal';
import type { NursePersonnel } from '../services/nurseApi';
import type { NursePersonnelInput } from '../services/nurseApi';

interface AddPersonnelModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (input: NursePersonnelInput) => Promise<void>;
    initial?: NursePersonnel | null;
}

// تبدیل نام کامل به نام و نام خانوادگی جداگانه
function splitName(fullName: string): { firstName: string; lastName: string } {
    if (!fullName || typeof fullName !== 'string') {
        return { firstName: '', lastName: '' };
    }

    const trimmed = fullName.trim();
    if (!trimmed) {
        return { firstName: '', lastName: '' };
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: parts[0] };
    }
    if (parts.length >= 2) {
        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        };
    }
    return { firstName: '', lastName: '' };
}


export function AddPersonnelModal({ open, onClose, onSubmit, initial }: AddPersonnelModalProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [nationalCode, setNationalCode] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    // مقداردهی اولیه فرم از روی داده اولیه
    useEffect(() => {
        if (initial) {
            const { firstName: fn, lastName: ln } = splitName(initial.name || '');
            setFirstName(fn || '');
            setLastName(ln || '');
            setPhone(initial.mobile || '');
            setNationalCode(initial.national_code || '');
            setGender(initial.gender || 'female');
            setActive(initial.status === 1);
        } else {
            // ریست فرم برای ایجاد جدید
            setFirstName('');
            setLastName('');
            setPhone('');
            setNationalCode('');
            setGender('female');
            setActive(true);
        }
        setErrors({});
        setSubmitError('');
    }, [initial, open]);


    const validate = () => {
        const next: Record<string, string> = {};

        if (!firstName.trim()) next.firstName = 'نام الزامی است';
        if (!lastName.trim()) next.lastName = 'نام خانوادگی الزامی است';

        // اعتبارسنجی شماره موبایل (شکل ایرانی)
        const phoneRegex = /^09\d{9}$/;
        const cleanedPhone = phone.replace(/\D/g, '');
        if (!cleanedPhone) {
            next.phone = 'شماره موبایل الزامی است';
        } else if (!phoneRegex.test(cleanedPhone)) {
            next.phone = 'شماره موبایل معتبر نیست (۰۹xxxxxxxxx)';
        }

        // اعتبارسنجی کد ملی (الزامی و دقیقا ۱۰ رقم)
        const cleanedNationalCode = nationalCode.replace(/\D/g, '');
        if (!cleanedNationalCode) {
            next.nationalCode = 'کد ملی الزامی است';
        } else if (cleanedNationalCode.length !== 10) {
            next.nationalCode = 'کد ملی باید ۱۰ رقم باشد';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        setSubmitError('');
        if (!validate()) return;

        setLoading(true);
        try {
            // اطمینان از وجود مقادیر
            const cleanedFirstName = (firstName || '').trim();
            const cleanedLastName = (lastName || '').trim();
            const cleanedPhone = (phone || '').replace(/\D/g, '');
            const cleanedNationalCode = (nationalCode || '').replace(/\D/g, '');

            const apiInput: NursePersonnelInput = {
                name: `${cleanedFirstName} ${cleanedLastName}`.trim(),
                mobile: cleanedPhone,
                national_code: cleanedNationalCode,
                gender,
                status: active ? 1 : 0,
            };

            console.log('ارسال داده به API:', apiInput); // برای دیباگ

            await onSubmit(apiInput);
            onClose();
        } catch (e) {
            const errorMessage = e instanceof Error
                ? e.message
                : 'خطا در ذخیره اطلاعات';
            setSubmitError(errorMessage);
            console.error('خطا در ارسال فرم:', e);
        } finally {
            setLoading(false);
        }
    };


    const handlePhoneChange = (value: string) => {
        // فقط اعداد
        const cleaned = value.replace(/\D/g, '');
        // محدود کردن به ۱۱ رقم
        const limited = cleaned.slice(0, 11);
        setPhone(limited);
        // پاک کردن خطای قبلی
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const handleNationalCodeChange = (value: string) => {
        // فقط اعداد
        const cleaned = value.replace(/\D/g, '');
        // محدود کردن به ۱۰ رقم
        const limited = cleaned.slice(0, 10);
        setNationalCode(limited);
        // پاک کردن خطای قبلی
        if (errors.nationalCode) {
            setErrors(prev => ({ ...prev, nationalCode: '' }));
        }
    };

    return (
        <ProviderModal
            open={open}
            onClose={onClose}
            title={initial ? 'ویرایش پرسنل' : 'افزودن پرسنل'}
            description="اطلاعات پرسنل شرکت خدمات پرستاری"
            footer={
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-[300px] bg-gradient-to-l from-rose-700 via-rose-600 to-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-rose-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/35 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {initial ? 'ذخیره تغییرات' : 'افزودن پرسنل'}
                </button>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <ProviderFormField label="نام" required error={errors.firstName}>
                    <input
                        className={inputClass}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="نام"
                        disabled={loading}
                    />
                </ProviderFormField>
                <ProviderFormField label="نام خانوادگی" required error={errors.lastName}>
                    <input
                        className={inputClass}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="نام خانوادگی"
                        disabled={loading}
                    />
                </ProviderFormField>
                <ProviderFormField label="شماره موبایل" required error={errors.phone}>
                    <input
                        className={`${inputClass} dir-ltr text-left`}
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="09123456789"
                        dir="ltr"
                        disabled={loading}
                        inputMode="numeric"
                    />
                </ProviderFormField>
                <ProviderFormField label="کد ملی" required error={errors.nationalCode}>
                    <input
                        className={`${inputClass} dir-ltr text-left`}
                        value={nationalCode}
                        onChange={(e) => handleNationalCodeChange(e.target.value)}
                        placeholder="1234567890"
                        maxLength={10}
                        dir="ltr"
                        disabled={loading}
                        inputMode="numeric"
                    />
                </ProviderFormField>
                <ProviderFormField label="جنسیت">
                    <div
                        className="flex h-[42px] w-full items-center rounded-full bg-slate-200/70 p-1"
                        role="group"
                        aria-label="انتخاب جنسیت"
                    >
                        {[
                            { value: 'male' as const, label: 'مرد' },
                            { value: 'female' as const, label: 'زن' },
                        ].map((option) => {
                            const selected = gender === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setGender(option.value)}
                                    disabled={loading}
                                    className={`flex-1 rounded-full py-2 text-sm font-medium transition-all duration-200 ${
                                        selected
                                            ? 'bg-slate-600 text-white shadow-sm shadow-slate-600/30'
                                            : 'text-slate-500 hover:text-slate-700'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </ProviderFormField>
                <ProviderFormField label="وضعیت">
                    <select
                        className={inputClass}
                        value={active ? 'active' : 'inactive'}
                        onChange={(e) => setActive(e.target.value === 'active')}
                        disabled={loading}
                    >
                        <option value="active">فعال</option>
                        <option value="inactive">غیرفعال</option>
                    </select>
                </ProviderFormField>
            </div>
            {submitError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                </div>
            )}
        </ProviderModal>
    );
}
