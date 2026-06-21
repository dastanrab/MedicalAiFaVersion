import { useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
    EmptyState,
    PageHeader,
    SearchInput,
    formatPrice,
} from '../../components';
import {
    mockDrugDatabase,
    mockDrugInventory,
    type DrugInventoryItem,
} from '../../data/mockData';

const LOW_STOCK_THRESHOLD = 10;

type DrugForm = {
    name: string;
    stock: string;
    price: string;
};

const emptyForm: DrugForm = { name: '', stock: '', price: '' };

function withLowStock(item: Omit<DrugInventoryItem, 'lowStock'>): DrugInventoryItem {
    return { ...item, lowStock: item.stock < LOW_STOCK_THRESHOLD };
}

function nextDrugId(items: DrugInventoryItem[]) {
    return items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
}

export function PharmacyInventoryPage() {
    const [items, setItems] = useState(mockDrugInventory);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<DrugForm>(emptyForm);
    const [formError, setFormError] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filtered = useMemo(() => {
        const q = search.trim();
        if (!q) return items;
        return items.filter((i) => i.name.includes(q));
    }, [items, search]);

    const suggestions = useMemo(() => {
        const q = form.name.trim();
        if (!q || editingId !== null) return [];
        const inInventory = new Set(items.map((i) => i.name));
        return mockDrugDatabase
            .filter((d) => d.name.includes(q) && !inInventory.has(d.name))
            .slice(0, 6);
    }, [form.name, items, editingId]);

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError('');
        setFormOpen(true);
    };

    const openEditForm = (item: DrugInventoryItem) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            stock: String(item.stock),
            price: String(item.price),
        });
        setFormError('');
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditingId(null);
        setForm(emptyForm);
        setFormError('');
        setShowSuggestions(false);
    };

    const selectSuggestion = (name: string, defaultPrice: number) => {
        setForm((prev) => ({
            ...prev,
            name,
            price: prev.price || String(defaultPrice),
        }));
        setShowSuggestions(false);
    };

    const saveForm = (e: React.FormEvent) => {
        e.preventDefault();
        const name = form.name.trim();
        const stock = Number(form.stock);
        const price = Number(form.price);

        if (!name) {
            setFormError('نام دارو را وارد کنید');
            return;
        }
        if (Number.isNaN(stock) || stock < 0) {
            setFormError('موجودی معتبر وارد کنید');
            return;
        }
        if (Number.isNaN(price) || price <= 0) {
            setFormError('قیمت معتبر وارد کنید');
            return;
        }

        const duplicate = items.some(
            (i) => i.name === name && i.id !== editingId
        );
        if (duplicate) {
            setFormError('این دارو قبلاً در موجودی ثبت شده است');
            return;
        }

        if (editingId !== null) {
            setItems((prev) =>
                prev.map((i) =>
                    i.id === editingId
                        ? withLowStock({ id: editingId, name, stock, price })
                        : i
                )
            );
        } else {
            setItems((prev) => [
                ...prev,
                withLowStock({ id: nextDrugId(prev), name, stock, price }),
            ]);
        }

        closeForm();
    };

    const deleteItem = (item: DrugInventoryItem) => {
        if (!window.confirm(`«${item.name}» از موجودی حذف شود؟`)) return;
        setItems((prev) => prev.filter((i) => i.id !== item.id));
    };

    const updateStock = (id: number, stock: number) => {
        setItems((prev) =>
            prev.map((i) =>
                i.id === id ? withLowStock({ ...i, stock: Math.max(0, stock) }) : i
            )
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="موجودی داروها"
                description="جستجو، افزودن و مدیریت موجودی و قیمت داروها"
                actions={
                    <button
                        type="button"
                        onClick={openAddForm}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" />
                        افزودن دارو
                    </button>
                }
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="جستجو در موجودی داروها..."
                />
            </div>

            {items.some((i) => i.lowStock) && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    {items.filter((i) => i.lowStock).length.toLocaleString('fa-IR')} قلم دارو
                    موجودی کم دارد (کمتر از {LOW_STOCK_THRESHOLD.toLocaleString('fa-IR')} عدد).
                </div>
            )}

            {filtered.length === 0 ? (
                <EmptyState
                    message={
                        search.trim()
                            ? 'دارویی با این عبارت یافت نشد.'
                            : 'هنوز دارویی ثبت نشده — با «افزودن دارو» شروع کنید.'
                    }
                />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                    نام دارو
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                    موجودی
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                    قیمت (تومان)
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                    وضعیت
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            min={0}
                                            value={item.stock}
                                            className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                                            onChange={(e) =>
                                                updateStock(item.id, Number(e.target.value) || 0)
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">{formatPrice(item.price)}</td>
                                    <td className="px-4 py-3">
                                        {item.stock === 0 ? (
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                ناموجود
                                            </span>
                                        ) : item.lowStock ? (
                                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                                                موجودی کم
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                موجود
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditForm(item)}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-teal-600 hover:bg-teal-50"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                ویرایش
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteItem(item)}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {formOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeForm}
                >
                    <div
                        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                        dir="rtl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeForm}
                            className="absolute left-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-lg font-bold text-slate-800">
                            {editingId !== null ? 'ویرایش دارو' : 'افزودن دارو'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {editingId !== null
                                ? 'نام، موجودی و قیمت را ویرایش کنید'
                                : 'از پایگاه دارو جستجو کنید یا نام را دستی وارد کنید'}
                        </p>

                        <form onSubmit={saveForm} className="mt-6 space-y-4">
                            <div className="relative">
                                <label className="mb-1.5 block text-sm text-slate-700">نام دارو</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => {
                                        setForm((prev) => ({ ...prev, name: e.target.value }));
                                        setFormError('');
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                    placeholder="مثلاً متفورمین ۵۰۰"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                        {suggestions.map((s) => (
                                            <li key={s.name}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        selectSuggestion(s.name, s.defaultPrice)
                                                    }
                                                    className="flex w-full items-center justify-between px-3 py-2 text-right text-sm hover:bg-teal-50"
                                                >
                                                    <span>{s.name}</span>
                                                    <span className="text-xs text-slate-400">
                                                        {formatPrice(s.defaultPrice)} تومان
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm text-slate-700">موجودی</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.stock}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, stock: e.target.value }))
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                        placeholder="۰"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm text-slate-700">
                                        قیمت (تومان)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, price: e.target.value }))
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                        placeholder="۰"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {formError}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
                                >
                                    {editingId !== null ? 'ذخیره تغییرات' : 'افزودن به موجودی'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    انصراف
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
