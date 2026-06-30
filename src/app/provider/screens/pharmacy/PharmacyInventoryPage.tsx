import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
    EmptyState,
    PageHeader,
    SearchInput,
    formatPrice,
} from '../../components';
import { ProviderModal, ProviderFormField, inputClass } from '../../components/ProviderModal';
import { isPositiveNumber } from '../../utils/validation';
import {
    mockDrugDatabase,
    mockDrugInventory,
    type DrugInventoryItem,
} from '../../data/mockData';

type DrugForm = {
    name: string;
    price: string;
};

const emptyForm: DrugForm = { name: '', price: '' };

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

    const filtered = useMemo(() => {
        const q = search.trim();
        if (!q) return items;
        return items.filter((i) => i.name.includes(q));
    }, [items, search]);

    const availableDrugs = useMemo(() => {
        const inInventory = new Set(items.map((i) => i.name));
        return mockDrugDatabase.filter((d) => !inInventory.has(d.name));
    }, [items]);

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
    };

    const handleDrugSelect = (name: string) => {
        const drug = mockDrugDatabase.find((d) => d.name === name);
        setForm((prev) => ({
            name,
            price: prev.price || (drug ? String(drug.defaultPrice) : ''),
        }));
        setFormError('');
    };

    const saveForm = (e: React.FormEvent) => {
        e.preventDefault();
        const name = form.name.trim();
        const price = Number(form.price);

        if (!name) {
            setFormError('عنوان دارو را انتخاب کنید');
            return;
        }
        if (!isPositiveNumber(price)) {
            setFormError('قیمت هر واحد باید عدد مثبت باشد');
            return;
        }

        const duplicate = items.some((i) => i.name === name && i.id !== editingId);
        if (duplicate) {
            setFormError('این دارو قبلاً در لیست ثبت شده است');
            return;
        }

        if (editingId !== null) {
            setItems((prev) =>
                prev.map((i) => (i.id === editingId ? { ...i, price } : i))
            );
        } else {
            setItems((prev) => [...prev, { id: nextDrugId(prev), name, price }]);
        }

        closeForm();
    };

    const deleteItem = (item: DrugInventoryItem) => {
        if (!window.confirm(`«${item.name}» از لیست حذف شود؟`)) return;
        setItems((prev) => prev.filter((i) => i.id !== item.id));
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="موجودی داروها"
                description="لیست داروها و نرخ هر واحد"
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
                    placeholder="جستجو در لیست داروها..."
                />
            </div>

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
                                    نرخ (تومان)
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                    <td className="px-4 py-3">{formatPrice(item.price)}</td>
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

            <ProviderModal
                open={formOpen}
                onClose={closeForm}
                title={editingId !== null ? 'ویرایش نرخ دارو' : 'افزودن دارو'}
                description={
                    editingId !== null
                        ? 'نرخ هر واحد دارو را ویرایش کنید'
                        : 'عنوان دارو را انتخاب و قیمت هر واحد را وارد کنید'
                }
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            form="drug-form"
                            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                        >
                            {editingId !== null ? 'ذخیره تغییرات' : 'افزودن دارو'}
                        </button>
                    </>
                }
            >
                <form id="drug-form" onSubmit={saveForm} className="space-y-4">
                    <ProviderFormField label="عنوان دارو" required>
                        {editingId !== null ? (
                            <input
                                className={`${inputClass} bg-slate-50 text-slate-600`}
                                value={form.name}
                                readOnly
                            />
                        ) : (
                            <select
                                className={inputClass}
                                value={form.name}
                                onChange={(e) => handleDrugSelect(e.target.value)}
                            >
                                <option value="">انتخاب کنید...</option>
                                {availableDrugs.map((drug) => (
                                    <option key={drug.name} value={drug.name}>
                                        {drug.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </ProviderFormField>

                    <ProviderFormField label="قیمت هر واحد (تومان)" required>
                        <input
                            type="text"
                            inputMode="numeric"
                            className={`${inputClass} text-left`}
                            dir="ltr"
                            value={form.price}
                            onChange={(e) => {
                                setForm((prev) => ({
                                    ...prev,
                                    price: e.target.value.replace(/[^\d]/g, ''),
                                }));
                                setFormError('');
                            }}
                            placeholder="۰"
                        />
                    </ProviderFormField>

                    {formError && (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {formError}
                        </p>
                    )}
                </form>
            </ProviderModal>
        </div>
    );
}
