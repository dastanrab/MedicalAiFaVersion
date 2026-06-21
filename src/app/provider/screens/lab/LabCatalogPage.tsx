import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, formatPrice } from '../../components';
import { mockLabCatalog } from '../../data/mockData';

export function LabCatalogPage() {
    const [items, setItems] = useState(mockLabCatalog);

    const toggleActive = (id: number) => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active: !i.active } : i)));
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="کاتالوگ آزمایش‌ها"
                description="مدیریت لیست آزمایش‌های قابل ارائه"
                actions={
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                        <Plus className="h-4 w-4" />
                        افزودن آزمایش
                    </button>
                }
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold">نام</th>
                            <th className="px-4 py-3 text-right font-semibold">دسته</th>
                            <th className="px-4 py-3 text-right font-semibold">قیمت</th>
                            <th className="px-4 py-3 text-right font-semibold">زمان نتیجه</th>
                            <th className="px-4 py-3 text-right font-semibold">ناشتا</th>
                            <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                            <th className="px-4 py-3 text-right font-semibold" />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
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
                                <td className="px-4 py-3">{item.fasting ? 'بله' : 'خیر'}</td>
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
                                    <button
                                        type="button"
                                        onClick={() => toggleActive(item.id)}
                                        className="text-xs text-amber-600 hover:underline"
                                    >
                                        {item.active ? 'غیرفعال' : 'فعال'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
