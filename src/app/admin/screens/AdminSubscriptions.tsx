import { useState } from 'react';
import { Crown, Plus, Trash2, Pencil } from 'lucide-react';
import { useAdminDataStore, type SubscriptionPlan } from '../store/adminDataStore';
import { Switch } from '../../components/ui/switch';

export function AdminSubscriptions() {
    const plans = useAdminDataStore((s) => s.subscriptionPlans);
    const updatePlan = useAdminDataStore((s) => s.updateSubscriptionPlan);
    const addPlan = useAdminDataStore((s) => s.addSubscriptionPlan);
    const removePlan = useAdminDataStore((s) => s.removeSubscriptionPlan);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', price: '', durationDays: 30, features: '' });

    const openEdit = (plan: SubscriptionPlan) => {
        setEditId(plan.id);
        setForm({ name: plan.name, price: plan.price, durationDays: plan.durationDays, features: plan.features.join('\n') });
    };

    const save = () => {
        const features = form.features.split('\n').filter(Boolean);
        if (editId && editId !== 'new') {
            updatePlan(editId, { name: form.name, price: form.price, durationDays: form.durationDays, features });
        } else {
            addPlan({ name: form.name, price: form.price, durationDays: form.durationDays, features, active: true });
        }
        setEditId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                        <Crown className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">پلن‌های اشتراک</h2>
                        <p className="text-sm text-slate-500">تعریف و ویرایش پلن‌های /plans</p>
                    </div>
                </div>
                <button type="button" onClick={() => { setEditId('new'); setForm({ name: '', price: '', durationDays: 30, features: '' }); }} className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm text-white">
                    <Plus className="h-4 w-4" /> پلن جدید
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {plans.map((plan) => (
                    <div key={plan.id} className={`rounded-2xl border p-5 ${plan.popular ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-800">{plan.name}</h3>
                                <p className="mt-1 text-lg font-bold text-indigo-600">{plan.price}</p>
                                <p className="text-xs text-slate-500">{plan.durationDays === 0 ? 'رایگان' : `${plan.durationDays} روز`}</p>
                            </div>
                            <div className="flex gap-1">
                                <button type="button" onClick={() => openEdit(plan)} className="text-slate-400 hover:text-indigo-600"><Pencil className="h-4 w-4" /></button>
                                {plan.id !== 'basic' && (
                                    <button type="button" onClick={() => removePlan(plan.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                )}
                            </div>
                        </div>
                        <ul className="mt-4 space-y-1 text-xs text-slate-600">
                            {plan.features.slice(0, 4).map((f) => <li key={f}>• {f}</li>)}
                        </ul>
                        <div className="mt-4 flex items-center justify-between">
                            <Switch checked={plan.active} onCheckedChange={(v) => updatePlan(plan.id, { active: v })} />
                            <span className="text-xs text-slate-500">{plan.active ? 'فعال' : 'غیرفعال'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {editId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6">
                        <h3 className="font-semibold">{editId === 'new' ? 'پلن جدید' : 'ویرایش پلن'}</h3>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام پلن" className="mt-4 h-11 w-full rounded-xl border px-3 text-sm" />
                        <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="قیمت" className="mt-3 h-11 w-full rounded-xl border px-3 text-sm" />
                        <input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} placeholder="مدت (روز)" className="mt-3 h-11 w-full rounded-xl border px-3 text-sm" />
                        <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} placeholder="امکانات (هر خط یک مورد)" className="mt-3 w-full rounded-xl border p-3 text-sm" />
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
