import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Pencil, X } from 'lucide-react';
import { EmptyState, PageHeader, SearchInput, formatFaNumber } from '../../../components';
import { showProviderError, showProviderSuccess } from '../../../utils/toast';
import { toEnglishDigits } from '../../../utils/validation';
import { useStaffCan } from '../../components/StaffGates';
import { useStaffDataStore } from '../../store/staffDataStore';
import { useStaffActivityLogger } from '../../store/staffStore';

/** کارمند فقط تعداد موجودی را به‌روز می‌کند؛ قیمت و افزودن دارو با صاحب حساب است */
export function StaffInventoryPage() {
    const can = useStaffCan('pharmacy');
    const log = useStaffActivityLogger('pharmacy');
    const drugs = useStaffDataStore((s) => s.drugStock);
    const updateDrugStock = useStaffDataStore((s) => s.updateDrugStock);

    const [search, setSearch] = useState('');
    const [lowOnly, setLowOnly] = useState(false);
    const [editing, setEditing] = useState<{ id: number; value: string } | null>(null);

    const list = useMemo(() => {
        const q = search.trim();
        return drugs.filter((d) => (!q || d.name.includes(q)) && (!lowOnly || d.stock < d.minStock));
    }, [drugs, search, lowOnly]);

    const lowCount = drugs.filter((d) => d.stock < d.minStock).length;

    const save = () => {
        if (!editing) return;
        const value = Number(toEnglishDigits(editing.value));
        if (!Number.isInteger(value) || value < 0) {
            showProviderError('تعداد موجودی معتبر نیست');
            return;
        }
        const drug = drugs.find((d) => d.id === editing.id);
        updateDrugStock(editing.id, value);
        if (drug) log('به‌روزرسانی موجودی', `${drug.name}: ${drug.stock} ← ${value}`);
        showProviderSuccess('موجودی به‌روز شد');
        setEditing(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader title="موجودی داروها" description="مشاهده و به‌روزرسانی تعداد موجودی" />

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="نام دارو..." />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
                    فقط داروهای رو به اتمام ({formatFaNumber(lowCount)})
                </label>
            </div>

            {list.length === 0 ? (
                <EmptyState message="دارویی یافت نشد." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نام دارو</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">شکل</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">موجودی</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">حداقل</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((d) => {
                                const low = d.stock < d.minStock;
                                const isEditing = editing?.id === d.id;
                                return (
                                    <tr key={d.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            <span className="flex items-center gap-1.5">
                                                {low && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                                {d.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{d.form}</td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input
                                                    autoFocus
                                                    value={editing.value}
                                                    onChange={(e) => setEditing({ id: d.id, value: e.target.value })}
                                                    onKeyDown={(e) => e.key === 'Enter' && save()}
                                                    dir="ltr"
                                                    className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-teal-500"
                                                />
                                            ) : (
                                                <span className={low ? 'font-semibold text-amber-700' : ''}>{formatFaNumber(d.stock)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{formatFaNumber(d.minStock)}</td>
                                        <td className="px-4 py-3">
                                            {can('pharmacy.inventory.stock') &&
                                                (isEditing ? (
                                                    <div className="flex gap-1">
                                                        <button type="button" onClick={save} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" title="ذخیره">
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" title="انصراف">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditing({ id: d.id, value: String(d.stock) })}
                                                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-teal-700 hover:bg-teal-50"
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
