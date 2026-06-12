import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Stethoscope, Search, Star, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useAdminDataStore, type AdminProvider } from '../store/adminDataStore';
import { fetchAllAdminUsers } from '../services/adminApi';
import { userTypeLabels } from '../config/userOptions';

const typeLabels: Record<AdminProvider['type'], string> = {
    doctor: 'پزشک',
    pharmacy: 'داروخانه',
    lab: 'آزمایشگاه',
    nurse: 'پرستار',
};

export function AdminProviders() {
    const token = useAdminAuthStore((s) => s.token);
    const providers = useAdminDataStore((s) => s.providers);
    const updateProvider = useAdminDataStore((s) => s.updateProvider);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (!token) return;
        setSyncing(true);
        fetchAllAdminUsers()
            .then((users) => {
                const providerUsers = users.filter((u) =>
                    ['doctor', 'pharmacy', 'lab', 'nurse'].includes(u.type)
                );
                providerUsers.forEach((u) => {
                    const existing = providers.find((p) => p.userId === u.id);
                    if (!existing) {
                        useAdminDataStore.setState((s) => ({
                            providers: [
                                ...s.providers,
                                {
                                    id: u.id,
                                    userId: u.id,
                                    name: `${u.firstName} ${u.lastName}`,
                                    type: u.type as AdminProvider['type'],
                                    province: u.province,
                                    city: u.city,
                                    rating: 4.0,
                                    isActive: u.status === 'active',
                                    isVerified: u.isVerified,
                                    specialty: u.details?.specialty,
                                    fee: u.details?.visitFee ? Number(u.details.visitFee) : undefined,
                                },
                            ],
                        }));
                    }
                });
            })
            .finally(() => setSyncing(false));
    }, [token]);

    const filtered = useMemo(() => {
        return providers.filter((p) => {
            const q = search.trim().toLowerCase();
            const matchSearch = !q || p.name.toLowerCase().includes(q);
            const matchType = typeFilter === 'all' || p.type === typeFilter;
            return matchSearch && matchType;
        });
    }, [providers, search, typeFilter]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">پزشکان و ارائه‌دهندگان</h2>
                        <p className="text-sm text-slate-500">مدیریت پروفایل، تعرفه و فعال‌سازی در اپ</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="h-11 w-full rounded-xl border border-slate-200 pr-9 pl-3 text-sm" />
                </div>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="all">همه انواع</option>
                    {Object.entries(typeLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {syncing && <p className="col-span-full text-sm text-slate-400">در حال همگام‌سازی با API کاربران...</p>}
                {filtered.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-800">{p.name}</h3>
                                <p className="text-xs text-slate-500">{typeLabels[p.type]} {p.specialty && `— ${p.specialty}`}</p>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-medium">{p.rating}</span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{p.province} — {p.city}</p>
                        {p.fee && <p className="mt-1 text-sm text-slate-700">{p.fee.toLocaleString('fa-IR')} تومان</p>}
                        <div className="mt-4 flex items-center justify-between">
                            <Link to={`/admin/users/${p.userId}`} className="text-xs text-indigo-600 hover:underline">مشاهده پروفایل</Link>
                            <button
                                type="button"
                                onClick={() => updateProvider(p.id, { isActive: !p.isActive })}
                                className={`flex items-center gap-1 text-xs ${p.isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                            >
                                {p.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                                {p.isActive ? 'فعال در /doctors' : 'غیرفعال'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
