import { useState } from 'react';
import { HeartPulse, Plus, Trash2, Star } from 'lucide-react';
import { useAdminDataStore } from '../store/adminDataStore';
import { Switch } from '../../components/ui/switch';

const typeLabels = { lab: 'آزمایشگاه', pharmacy: 'داروخانه', nurse: 'پرستار', package: 'پکیج' };

export function AdminServicesCatalog() {
    const catalog = useAdminDataStore((s) => s.serviceCatalog);
    const addEntry = useAdminDataStore((s) => s.addServiceCatalogEntry);
    const updateEntry = useAdminDataStore((s) => s.updateServiceCatalogEntry);
    const removeEntry = useAdminDataStore((s) => s.removeServiceCatalogEntry);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'package' as const, price: 0, province: 'تهران', city: 'تهران' });

    const handleAdd = () => {
        if (!form.title.trim()) return;
        addEntry({ ...form, featured: false, active: true });
        setForm({ title: '', type: 'package', price: 0, province: 'تهران', city: 'تهران' });
        setShowAdd(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                        <HeartPulse className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">خدمات درمانی</h2>
                        <p className="text-sm text-slate-500">کاتالوگ /services و پکیج‌های آزمایش</p>
                    </div>
                </div>
                <button type="button" onClick={() => setShowAdd(true)} className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm text-white">
                    <Plus className="h-4 w-4" /> افزودن
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {catalog.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                                    {item.featured && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                                </div>
                                <p className="text-xs text-slate-500">{typeLabels[item.type]} — {item.province}، {item.city}</p>
                                {item.price > 0 && <p className="mt-1 text-sm">{item.price.toLocaleString('fa-IR')} تومان</p>}
                            </div>
                            <button type="button" onClick={() => removeEntry(item.id)} className="text-slate-400 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-600">
                                <Switch checked={item.active} onCheckedChange={(v) => updateEntry(item.id, { active: v })} />
                                فعال
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-600">
                                <Switch checked={item.featured} onCheckedChange={(v) => updateEntry(item.id, { featured: v })} />
                                برتر
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6">
                        <h3 className="font-semibold">افزودن خدمت</h3>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان" className="mt-4 h-11 w-full rounded-xl border px-3 text-sm" />
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className="mt-3 h-11 w-full rounded-xl border px-3 text-sm">
                            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="قیمت" className="mt-3 h-11 w-full rounded-xl border px-3 text-sm" />
                        <div className="mt-4 flex gap-2">
                            <button type="button" onClick={handleAdd} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm text-white">ذخیره</button>
                            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm">انصراف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
