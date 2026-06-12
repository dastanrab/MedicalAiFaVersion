import { useState } from 'react';
import { BookOpen, Plus, Trash2, Pencil } from 'lucide-react';
import { useAdminDataStore, type HealthContentItem } from '../store/adminDataStore';

const moduleLabels: Record<HealthContentItem['module'], string> = {
    'meal-plan': 'برنامه غذایی',
    'body-measurement': 'اندازه‌گیری بدن',
    'period-tracker': 'تقویم قاعدگی',
};

export function AdminHealthContent() {
    const items = useAdminDataStore((s) => s.healthContent);
    const addItem = useAdminDataStore((s) => s.addHealthContent);
    const updateItem = useAdminDataStore((s) => s.updateHealthContent);
    const removeItem = useAdminDataStore((s) => s.removeHealthContent);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ module: 'meal-plan' as HealthContentItem['module'], title: '', content: '' });

    const openEdit = (item: HealthContentItem) => {
        setEditId(item.id);
        setForm({ module: item.module, title: item.title, content: item.content });
    };

    const save = () => {
        if (!form.title.trim()) return;
        if (editId) {
            updateItem(editId, form);
        } else {
            addItem(form);
        }
        setEditId(null);
        setForm({ module: 'meal-plan', title: '', content: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">محتوای سلامت</h2>
                        <p className="text-sm text-slate-500">meal-plan، body-measurement، period-tracker</p>
                    </div>
                </div>
                <button type="button" onClick={() => { setEditId('new'); setForm({ module: 'meal-plan', title: '', content: '' }); }} className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm text-white">
                    <Plus className="h-4 w-4" /> افزودن
                </button>
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{moduleLabels[item.module]}</span>
                                <h3 className="mt-2 font-semibold text-slate-800">{item.title}</h3>
                                <p className="mt-2 whitespace-pre-line text-sm text-slate-600 line-clamp-3">{item.content}</p>
                                <p className="mt-2 text-xs text-slate-400">آخرین ویرایش: {item.updatedAt}</p>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => openEdit(item)} className="text-slate-400 hover:text-indigo-600"><Pencil className="h-4 w-4" /></button>
                                <button type="button" onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6">
                        <h3 className="font-semibold">{editId === 'new' ? 'افزودن محتوا' : 'ویرایش محتوا'}</h3>
                        <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value as HealthContentItem['module'] })} className="mt-4 h-11 w-full rounded-xl border px-3 text-sm">
                            {Object.entries(moduleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان" className="mt-3 h-11 w-full rounded-xl border px-3 text-sm" />
                        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder="محتوا..." className="mt-3 w-full rounded-xl border p-3 text-sm" />
                        <div className="mt-4 flex gap-2">
                            <button type="button" onClick={save} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm text-white">ذخیره</button>
                            <button type="button" onClick={() => setEditId(null)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm">انصراف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
