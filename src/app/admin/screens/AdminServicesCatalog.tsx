import { useState, useEffect } from 'react';
import { HeartPulse, Plus, Trash2, Loader2 } from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import {useAdminAuthStore} from "../store/adminAuthStore";


const API_BASE = 'http://185.222.163.113:7000/api/admin/services';

export function AdminServicesCatalog() {
    const accessToken = useAdminAuthStore((state) => state.token);
    const [catalog, setCatalog] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const [form, setForm] = useState({
        name: '',
        service_key: '',
        description: ''
    });

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const fetchServices = async () => {
        try {
            const res = await fetch(API_BASE, { headers });
            const json = await res.json();
            if (json.status === 'success') {
                const mappedData = json.data.map((item: any) => ({
                    ...item,
                    status: Boolean(item.status)
                }));
                setCatalog(mappedData);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) fetchServices();
    }, [accessToken]);

    const handleAdd = async () => {
        if (!form.name.trim() || !form.service_key.trim()) return;

        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers,
                body: JSON.stringify(form)
            });
            const json = await res.json();
            if (json.status === 'success') {
                setForm({ name: '', service_key: '', description: '' });
                setShowAdd(false);
                fetchServices();
            }
        } catch (error) {
            console.error('Error adding service:', error);
        }
    };

    const updateEntryStatus = async (id: number | string, status: boolean) => {
        setCatalog(prev => prev.map(item => item.id === id ? { ...item, status } : item));

        try {
            await fetch(`${API_BASE}/${id}/status`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
            fetchServices();
        }
    };

    const removeEntry = async (id: number | string) => {
        if (!window.confirm('آیا از حذف این سرویس اطمینان دارید؟')) return;

        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers
            });
            const json = await res.json();
            if (json.status === 'success') {
                setCatalog(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    return (
        <div className="space-y-6 text-right font-[YekanBakhFaNum]" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                        <HeartPulse className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">سرویس‌های سیستم</h2>
                        <p className="text-sm text-slate-500">مدیریت بخش‌های اصلی (آزمایشگاه، داروخانه و ...)</p>
                    </div>
                </div>
                <button type="button" onClick={() => setShowAdd(true)} className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-700 transition-colors">
                    <Plus className="h-4 w-4" /> افزودن
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {catalog.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">{item.name}</h3>
                                    <p className="text-xs font-mono text-slate-400 mt-1" dir="ltr" style={{ textAlign: 'right' }}>{item.service_key}</p>
                                    <p className="text-sm text-slate-600 mt-2">{item.description}</p>
                                </div>
                                <button type="button" onClick={() => removeEntry(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                    <Switch checked={item.status} onCheckedChange={(v) => updateEntryStatus(item.id, v)} />
                                    {item.status ? 'فعال' : 'غیرفعال'}
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">افزودن سرویس جدید</h3>
                        <div className="space-y-3">
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="نام (مثلاً: آزمایشگاه)"
                                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                            <input
                                value={form.service_key}
                                onChange={(e) => setForm({ ...form, service_key: e.target.value })}
                                placeholder="کلید سرویس (مثلاً: laboratory)"
                                dir="ltr"
                                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-none text-left"
                            />
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="توضیحات کوتاه..."
                                className="h-24 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                            />
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button type="button" onClick={handleAdd} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">ذخیره</button>
                            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200">انصراف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
