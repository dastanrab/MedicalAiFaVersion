import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { PageHeader, formatPrice } from '../../components';
import { AddEditLabTestModal } from '../../components/AddEditLabTestModal';
import { useLabStore } from '../../store/labStore';
import type { LabTestCatalogItem } from '../../data/mockData';

export function LabCatalogPage() {
    const catalog = useLabStore((s) => s.catalog);
    const addCatalogItem = useLabStore((s) => s.addCatalogItem);
    const updateCatalogItem = useLabStore((s) => s.updateCatalogItem);
    const toggleCatalogActive = useLabStore((s) => s.toggleCatalogActive);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<LabTestCatalogItem | null>(null);

    const openAdd = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (item: LabTestCatalogItem) => {
        setEditing(item);
        setModalOpen(true);
    };

    const handleSubmit = async (input: Parameters<typeof addCatalogItem>[0]) => {
        if (editing) {
            updateCatalogItem(editing.id, input);
        } else {
            addCatalogItem(input);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="کاتالوگ آزمایش‌ها"
                description="مدیریت لیست آزمایش‌های قابل ارائه"
                actions={
                    <button
                        type="button"
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                        <Plus className="h-4 w-4" />
                        افزودن آزمایش
                    </button>
                }
            />

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold">نام</th>
                            <th className="px-4 py-3 text-right font-semibold">دسته</th>
                            <th className="px-4 py-3 text-right font-semibold">نرخ</th>
                            <th className="px-4 py-3 text-right font-semibold">زمان نتیجه</th>
                            <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                            <th className="px-4 py-3 text-right font-semibold">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {catalog.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{item.name}</p>
                                    {item.description && (
                                        <p className="text-xs text-slate-400">{item.description}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3">{item.category}</td>
                                <td className="px-4 py-3">{formatPrice(item.price)}</td>
                                <td className="px-4 py-3">{item.turnaround}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            item.active
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {item.active ? 'فعال' : 'غیرفعال'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(item)}
                                            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            ویرایش
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleCatalogActive(item.id)}
                                            className="text-xs text-slate-500 hover:text-amber-600"
                                        >
                                            {item.active ? 'غیرفعال' : 'فعال'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddEditLabTestModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initial={editing}
            />
        </div>
    );
}
