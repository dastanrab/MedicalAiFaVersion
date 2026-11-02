import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, Check, Pencil, X, Loader2 } from 'lucide-react';
import { EmptyState, PageHeader, SearchInput, formatFaNumber } from '../../../components';
import { showProviderError, showProviderSuccess } from '../../../utils/toast';
import { toEnglishDigits } from '../../../utils/validation';
import { useStaffCan } from '../../components/StaffGates';
import { useStaffActivityLogger, useStaffSession } from '../../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

interface InventoryItem {
    id: number;
    medicine_id: number;
    name: string;
    form: string;
    stock: number;
    minStock: number;
}

export function StaffInventoryPage() {
    const can = useStaffCan('pharmacy');
    const log = useStaffActivityLogger('pharmacy');
    const session = useStaffSession('pharmacy');

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);

    const [search, setSearch] = useState('');
    const [lowOnly, setLowOnly] = useState(false);
    const [editing, setEditing] = useState<{ id: number; value: string } | null>(null);
    const [serverLowCount, setServerLowCount] = useState<number>(0);

    // ۱. دریافت موجودی از سرور
    const fetchInventory = useCallback(async () => {
        if (!session?.token) return;
        setLoading(true);
        try {
            const url = new URL(`${API_BASE}/staff/pharmacy/inventory`);
            if (search.trim()) url.searchParams.append('search', search.trim());
            if (lowOnly) url.searchParams.append('low_only', '1');

            const res = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Accept': 'application/json',
                },
            });
            const result = await res.json();

            if (res.ok && result.status === 'success') {
                setItems(result.data.items || []);
                setServerLowCount(result.data.low_stock_count || 0);
            } else {
                showProviderError(result.message || 'خطا در دریافت لیست موجودی داروها');
            }
        } catch {
            showProviderError('خطا در ارتباط با سرور انبار');
        } finally {
            setLoading(false);
        }
    }, [session?.token, search, lowOnly]);

    // لود خودکار با جستجو یا تغییر فیلتر
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInventory();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchInventory]);

    // ۲. ذخیره موجودی تغییر یافته در دیتابیس
    const handleSaveStock = async () => {
        if (!editing || !session?.token) return;
        const val = Number(toEnglishDigits(editing.value));
        if (!Number.isInteger(val) || val < 0) {
            showProviderError('تعداد موجودی باید یک عدد صحیح نامنفی باشد');
            return;
        }

        const targetDrug = items.find((d) => d.id === editing.id);
        setSavingId(editing.id);

        try {
            const res = await fetch(`${API_BASE}/staff/pharmacy/inventory/${editing.id}/stock`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ stock: val }),
            });

            const result = await res.json();
            if (res.ok && result.status === 'success') {
                showProviderSuccess('موجودی با موفقیت به‌روزرسانی شد');
                if (targetDrug) {
                    log('به‌روزرسانی موجودی', `${targetDrug.name}: ${targetDrug.stock} ← ${val}`);
                }
                // بروزرسانی لوکال در استیت برای سرعت بالا
                setItems((prev) =>
                    prev.map((item) => (item.id === editing.id ? { ...item, stock: val } : item))
                );
                setEditing(null);
            } else {
                showProviderError(result.message || 'خطا در ثبت موجودی');
            }
        } catch {
            showProviderError('خطا در ارتباط با سرور');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader
                title="موجودی داروها"
                subtitle="مشاهده و به‌روزرسانی سریع تعداد موجودی اقلام دارویی داروخانه"
            />

            {/* نوار جستجو و فیلتر */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="جستجوی نام دارو..."
                    className="max-w-md w-full"
                />
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={lowOnly}
                        onChange={(e) => setLowOnly(e.target.checked)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="font-medium">
                        فقط داروهای رو به اتمام ({formatFaNumber(serverLowCount)})
                    </span>
                </label>
            </div>

            {/* لیست جدول موجودی */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    <span className="text-sm font-medium">در حال دریافت موجودی انبار...</span>
                </div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="دارویی یافت نشد"
                    description="هیچ دارویی مطابق با عبارت جستجوی شما پیدا نشد."
                />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3.5 text-right">نام دارو</th>
                            <th className="px-4 py-3.5 text-right">شکل دارویی</th>
                            <th className="px-4 py-3.5 text-right">موجودی فعلی</th>
                            <th className="px-4 py-3.5 text-right">حداقل مجاز (هشدار)</th>
                            <th className="px-4 py-3.5 text-left">عملیات</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {items.map((d) => {
                            const isLow = d.stock < d.minStock;
                            const isEditing = editing?.id === d.id;
                            const isSaving = savingId === d.id;

                            return (
                                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-4 py-3.5 font-bold text-slate-800">
                                            <span className="flex items-center gap-2">
                                                {isLow && (
                                                    <span title="موجودی رو به اتمام است">
                                                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                                    </span>
                                                )}
                                                {d.name}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-600 text-xs">
                                        {d.form || '—'}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {isEditing ? (
                                            <input
                                                autoFocus
                                                type="number"
                                                min="0"
                                                value={editing.value}
                                                onChange={(e) =>
                                                    setEditing({ id: d.id, value: e.target.value })
                                                }
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveStock()}
                                                dir="ltr"
                                                className="w-24 rounded-lg border border-teal-500 bg-teal-50/20 px-2.5 py-1 text-sm font-bold text-slate-800 outline-none"
                                            />
                                        ) : (
                                            <span
                                                className={`font-black ${
                                                    isLow ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md' : 'text-slate-700'
                                                }`}
                                            >
                                                    {formatFaNumber(d.stock)}
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-500 font-medium">
                                        {formatFaNumber(d.minStock)}
                                    </td>
                                    <td className="px-4 py-3.5 text-left">
                                        {can('write') &&
                                            (isEditing ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        disabled={isSaving}
                                                        onClick={handleSaveStock}
                                                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                                                        title="ذخیره"
                                                    >
                                                        {isSaving ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Check className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isSaving}
                                                        onClick={() => setEditing(null)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                                                        title="انصراف"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditing({ id: d.id, value: String(d.stock) })
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    ویرایش موجودی
                                                </button>
                                            ))}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
