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
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {initial ? 'ذخیره تغییرات' : 'افزودن پرسنل'}
                    </button>
                </>
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
                <div className="sm:col-span-2">
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
            </div>
            {submitError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                </div>
            )}
        </ProviderModal>
    );
}
