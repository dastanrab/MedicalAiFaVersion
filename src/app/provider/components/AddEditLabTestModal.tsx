import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ProviderModal, ProviderFormField, inputClass } from './ProviderModal';
import { labTestTitleOptions } from '../data/mockData';
import type { LabTestCatalogItem } from '../data/mockData';
import type { LabCatalogInput } from '../store/labStore';
import { isPositiveNumber } from '../utils/validation';

interface AddEditLabTestModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (input: LabCatalogInput) => Promise<void>;
    initial?: LabTestCatalogItem | null;
}

export function AddEditLabTestModal({ open, onClose, onSubmit, initial }: AddEditLabTestModalProps) {
    const [titleKey, setTitleKey] = useState(labTestTitleOptions[0]?.value ?? '');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (initial) {
            const match = labTestTitleOptions.find((o) => o.label.startsWith(initial.name) || initial.name.includes(o.label.split('—')[0]?.trim() ?? ''));
            setTitleKey(match?.value ?? labTestTitleOptions[0]?.value ?? '');
            setDescription(initial.description ?? '');
            setPrice(String(initial.price));
            setActive(initial.active);
        } else {
            const first = labTestTitleOptions[0];
            setTitleKey(first?.value ?? '');
            setDescription('');
            setPrice(first ? String(first.defaultPrice) : '');
            setActive(true);
        }
        setErrors({});
        setSubmitError('');
    }, [open, initial]);

    const selectedOption = labTestTitleOptions.find((o) => o.value === titleKey);

    const validate = () => {
        const next: Record<string, string> = {};
        if (!titleKey) next.title = 'انتخاب عنوان آزمایش الزامی است';
        if (!isPositiveNumber(price)) next.price = 'نرخ آزمایش باید عدد مثبت باشد';
        if (description.trim().length > 500) next.description = 'توضیحات حداکثر ۵۰۰ کاراکتر';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        setSubmitError('');
        if (!validate() || !selectedOption) return;

        setLoading(true);
        try {
            const name = selectedOption.label.split('—')[0]?.trim() || selectedOption.label;
            await onSubmit({
                name,
                category: selectedOption.category,
                price: Number(price.replace(/,/g, '')),
                turnaround: '۲۴ ساعت',
                fasting: false,
                active,
                description: description.trim() || undefined,
            });
            onClose();
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'خطا در ذخیره آزمایش');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProviderModal
            open={open}
            onClose={onClose}
            title={initial ? 'ویرایش آزمایش' : 'افزودن آزمایش'}
            description="تعریف آزمایش و نرخ آن در کاتالوگ آزمایشگاه"
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
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {initial ? 'ذخیره تغییرات' : 'افزودن آزمایش'}
                    </button>
                </>
            }
        >
            <div className="grid gap-4">
                <ProviderFormField label="عنوان آزمایش" required error={errors.title}>
                    <select
                        className={inputClass}
                        value={titleKey}
                        onChange={(e) => {
                            const key = e.target.value;
                            setTitleKey(key);
                            const opt = labTestTitleOptions.find((o) => o.value === key);
                            if (opt && !initial) setPrice(String(opt.defaultPrice));
                        }}
                    >
                        {labTestTitleOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </ProviderFormField>

                <ProviderFormField label="توضیحات آزمایش" error={errors.description}>
                    <textarea
                        className={inputClass}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="توضیحات اختیاری برای بیمار..."
                    />
                </ProviderFormField>

                <ProviderFormField label="نرخ آزمایش (تومان)" required error={errors.price}>
                    <input
                        className={`${inputClass} text-left`}
                        value={price}
                        onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="120000"
                        dir="ltr"
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
