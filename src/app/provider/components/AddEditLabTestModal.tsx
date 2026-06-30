import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ProviderModal, ProviderFormField, inputClass } from './ProviderModal';
import { isPositiveNumber } from '../utils/validation';
import {useProviderSession} from "../store/providerAuthStore";

export interface ApiTestPack {
    id: number;
    name: string;
}

export interface LabTestPayload {
    test_pack_id: number;
    price: number;
    status: number;
    description: string;
}

interface AddEditLabTestModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: LabTestPayload) => Promise<void>;
    initial?: any | null;
}

export function AddEditLabTestModal({ open, onClose, onSubmit, initial }: AddEditLabTestModalProps) {
    const labSession = useProviderSession('lab');

    const [testPacks, setTestPacks] = useState<ApiTestPack[]>([]);
    const [loadingPacks, setLoadingPacks] = useState(false);

    const [testPackId, setTestPackId] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState<number>(1);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    // دریافت لیست Test Packs هنگام باز شدن مودال
    useEffect(() => {
        if (open && testPacks.length === 0) {
            const fetchTestPacks = async () => {
                setLoadingPacks(true);
                try {
                    const res = await fetch('http://185.222.163.113:7000/api/owner/lab/test-packs', {
                        headers: {
                            'Authorization': `Bearer ${labSession?.token}`,
                            'Accept': 'application/json'
                        }
                    });
                    const json = await res.json();
                    if (json.status) {
                        setTestPacks(json.data);
                    }
                } catch (error) {
                    console.error('Error fetching test packs:', error);
                } finally {
                    setLoadingPacks(false);
                }
            };
            fetchTestPacks();
        }
    }, [open, labSession?.token, testPacks.length]);

    // تنظیم مقادیر اولیه برای ویرایش یا افزودن
    useEffect(() => {
        if (!open) return;
        if (initial) {
            setTestPackId(String(initial.test_pack_id));
            setDescription(initial.description ?? '');
            setPrice(String(initial.price));
            setStatus(initial.active ? 1 : 0);
        } else {
            setTestPackId('');
            setDescription('');
            setPrice('');
            setStatus(1); // پیش‌فرض فعال
        }
        setErrors({});
        setSubmitError('');
    }, [open, initial]);

    const validate = () => {
        const next: Record<string, string> = {};
        if (!testPackId) next.test_pack_id = 'انتخاب نوع آزمایش الزامی است';
        if (!isPositiveNumber(price)) next.price = 'نرخ آزمایش باید عدد مثبت باشد';
        if (description.trim().length > 500) next.description = 'توضیحات حداکثر ۵۰۰ کاراکتر';

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        setSubmitError('');
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit({
                test_pack_id: Number(testPackId),
                price: Number(price.replace(/,/g, '')),
                status: status,
                description: description.trim(),
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
                        disabled={loading || loadingPacks}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {initial ? 'ذخیره تغییرات' : 'افزودن آزمایش'}
                    </button>
                </>
            }
        >
            <div className="grid gap-4">
                <ProviderFormField label="نوع آزمایش (Test Pack)" required error={errors.test_pack_id}>
                    <div className="relative">
                        <select
                            className={inputClass}
                            value={testPackId}
                            onChange={(e) => setTestPackId(e.target.value)}
                            disabled={loadingPacks || !!initial} // در صورت ویرایش معمولاً نوع آزمایش ثابت می‌ماند
                        >
                            <option value="">انتخاب کنید...</option>
                            {testPacks.map((pack) => (
                                <option key={pack.id} value={pack.id}>
                                    {pack.name}
                                </option>
                            ))}
                        </select>
                        {loadingPacks && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-slate-400" />
                        )}
                    </div>
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
                        value={status.toString()}
                        onChange={(e) => setStatus(Number(e.target.value))}
                    >
                        <option value="1">فعال</option>
                        <option value="0">غیرفعال</option>
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
