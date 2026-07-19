import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ProviderModal, ProviderFormField, inputClass } from './ProviderModal';
import type { NursePersonnel } from '../data/mockData';
import type { NursePersonnelInput } from '../store/nurseStore';
import { isNonEmpty, isValidIranPhone, isValidNationalCode } from '../utils/validation';

interface AddPersonnelModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (input: NursePersonnelInput) => Promise<void>;
    initial?: NursePersonnel | null;
}

export function AddPersonnelModal({ open, onClose, onSubmit, initial }: AddPersonnelModalProps) {
    const [firstName, setFirstName] = useState(initial?.firstName ?? '');
    const [lastName, setLastName] = useState(initial?.lastName ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [nationalCode, setNationalCode] = useState(initial?.nationalCode ?? '');
    const [gender, setGender] = useState<'male' | 'female'>(initial?.gender ?? 'female');
    const [active, setActive] = useState(initial?.active ?? true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const next: Record<string, string> = {};
        if (!isNonEmpty(firstName)) next.firstName = 'نام الزامی است';
        if (!isNonEmpty(lastName)) next.lastName = 'نام خانوادگی الزامی است';
        if (!isValidIranPhone(phone)) next.phone = 'شماره موبایل معتبر نیست (۰۹xxxxxxxxx)';
        if (!isValidNationalCode(nationalCode)) next.nationalCode = 'کد ملی معتبر نیست';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        setSubmitError('');
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.replace(/\D/g, ''),
                nationalCode: nationalCode.replace(/\D/g, ''),
                gender,
                active,
            });
            onClose();
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'خطا در ذخیره اطلاعات');
        } finally {
            setLoading(false);
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
                    />
                </ProviderFormField>
                <ProviderFormField label="نام خانوادگی" required error={errors.lastName}>
                    <input
                        className={inputClass}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </ProviderFormField>
                <ProviderFormField label="شماره موبایل" required error={errors.phone}>
                    <input
                        className={`${inputClass} dir-ltr text-left`}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09123456789"
                        dir="ltr"
                    />
                </ProviderFormField>
                <ProviderFormField label="کد ملی" required error={errors.nationalCode}>
                    <input
                        className={`${inputClass} dir-ltr text-left`}
                        value={nationalCode}
                        onChange={(e) => setNationalCode(e.target.value)}
                        placeholder="1234567890"
                        maxLength={10}
                        dir="ltr"
                    />
                </ProviderFormField>
                <ProviderFormField label="جنسیت">
                    <div
                        className="flex h-[42px] w-full items-center rounded-full bg-slate-200/70 p-1"
                        role="group"
                        aria-label="انتخاب جنسیت"
                    >
                        {(
                            [
                                { value: 'male' as const, label: 'مرد' },
                                { value: 'female' as const, label: 'زن' },
                            ] as const
                        ).map((option) => {
                            const selected = gender === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setGender(option.value)}
                                    className={`flex-1 rounded-full py-2 text-sm font-medium transition-all duration-200 ${
                                        selected
                                            ? 'bg-slate-600 text-white shadow-sm shadow-slate-600/30'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
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
