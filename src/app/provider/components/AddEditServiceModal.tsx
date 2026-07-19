import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ProviderModal, ProviderFormField, inputClass } from './ProviderModal';
import { nurseServiceLabels } from '../data/mockData';
import type { NurseService } from '../data/mockData';
import type { NurseServiceInput } from '../store/nurseStore';
import { isPositiveNumber } from '../utils/validation';

interface AddEditServiceModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (input: NurseServiceInput) => Promise<void>;
    initial?: NurseService | null;
}

const serviceOptions = Object.entries(nurseServiceLabels).map(([value, label]) => ({
    value,
    label,
}));

export function AddEditServiceModal({ open, onClose, onSubmit, initial }: AddEditServiceModalProps) {
    const [serviceKey, setServiceKey] = useState(initial?.serviceKey ?? 'injection');
    const [price, setPrice] = useState(initial ? String(initial.price) : '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [active, setActive] = useState(initial?.active ?? true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const next: Record<string, string> = {};
        if (!serviceKey) next.serviceKey = 'انتخاب نوع خدمت الزامی است';
        if (!isPositiveNumber(price)) next.price = 'نرخ خدمت باید عدد مثبت باشد';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        setSubmitError('');
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit({
                serviceKey,
                name: nurseServiceLabels[serviceKey] ?? serviceKey,
                price: Number(price.replace(/,/g, '')),
                description: description.trim() || undefined,
                active,
            });
            onClose();
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'خطا در ذخیره خدمت');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProviderModal
            open={open}
            onClose={onClose}
            title={initial ? 'ویرایش خدمت' : 'افزودن خدمت پرستاری'}
            description="تعریف خدمت درمانی و نرخ آن"
            footer={
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-[300px] bg-gradient-to-l from-rose-700 via-rose-600 to-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-rose-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/35 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {initial ? 'ذخیره تغییرات' : 'افزودن خدمت'}
                </button>
            }
        >
            <div className="grid gap-4">
                <ProviderFormField label="نام خدمت" required error={errors.serviceKey}>
                    <select
                        className={inputClass}
                        value={serviceKey}
                        onChange={(e) => setServiceKey(e.target.value)}
                    >
                        {serviceOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </ProviderFormField>
                <ProviderFormField label="نرخ خدمت (تومان)" required error={errors.price}>
                    <input
                        className={`${inputClass} dir-ltr text-left`}
                        value={price}
                        onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="450000"
                        dir="ltr"
                    />
                </ProviderFormField>
                <ProviderFormField label="توضیحات">
                    <textarea
                        className={inputClass}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="توضیحات اختیاری..."
                    />
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
