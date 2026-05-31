import { useState, useEffect, useMemo } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Eye,
    Filter,
    MoreVertical,
    Pencil,
    Trash2,
    ShieldCheck,
    ShieldBan,
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
} from 'lucide-react';
import { iranProvinces, iranCitiesByProvince } from '../../data/iranLocations';
import {
    userTypeLabels,
    userStatusLabels,
    userStatusStyles,
    userTypeStyles,
    type AdminUserRow,
    type UserType,
    type UserStatus,
} from '../config/userOptions';
import { useAdminAuthStore } from "../store/adminAuthStore";

const PAGE_SIZE = 8;
const API_URL = 'http://185.222.163.113:7000/api/admin/users';

const statusMapApiToFront: Record<number, UserStatus> = {
    1: 'active',
    0: 'blocked',
};

const statusMapFrontToApi: Record<string, number> = {
    active: 1,
    blocked: 0,
};

interface UsersApiResponse {
    data: any[];
    total: number;
    per_page: number;
    current_page: number;
}

export function AdminUsers() {
    const token = useAdminAuthStore((state) => state.token);

    const [usersData, setUsersData] = useState<UsersApiResponse>({
        data: [],
        total: 0,
        per_page: PAGE_SIZE,
        current_page: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState<UserType | 'all'>('all');
    const [status, setStatus] = useState<UserStatus | 'all'>('all');
    const [province, setProvince] = useState('all');
    const [city, setCity] = useState('all');

    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const cities = province === 'all' ? [] : iranCitiesByProvince[province] ?? [];

    const fetchUsers = async () => {
        if (!token) {
            setError('توکن احراز هویت معتبر نیست.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {
                page: String(page),
                per_page: String(PAGE_SIZE),
            };
            if (name.trim()) params.name = name.trim();
            if (phone.trim()) params.phone = phone.trim();
            if (type !== 'all') params.type = type;
            if (status !== 'all') params.status = String(statusMapFrontToApi[status]);
            if (province !== 'all') params.province = province;
            if (city !== 'all') params.city = city;

            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}?${queryString}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401 || response.status === 403) {
                setError('توکن نامعتبر است. لطفا دوباره وارد شوید.');
                return;
            }

            if (!response.ok) {
                throw new Error(`خطا در دریافت اطلاعات کاربران: ${response.statusText}`);
            }

            const result = await response.json();
            const normalized: AdminUserRow[] = result.data.data.map((user: any) => ({
                ...user,
                firstName: user.name?.split(' ')[0] ?? '',
                lastName: user.name?.split(' ').slice(1).join(' ') ?? '',
                status: statusMapApiToFront[user.status] ?? 'blocked',
                isVerified: Boolean(user.is_verify),
                type: user.role as UserType,
            }));

            setUsersData({ ...result.data, data: normalized });
        } catch (err: any) {
            setError(err.message ?? 'خطایی رخ داد.');
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, page, name, phone, type, status, province, city]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(usersData.total / usersData.per_page)),
        [usersData.total, usersData.per_page]
    );

    const currentPage = usersData.current_page;
    const paged = usersData.data as AdminUserRow[];

    const resetPage = () => setPage(1);

    const resetFilters = () => {
        setName('');
        setPhone('');
        setType('all');
        setStatus('all');
        setProvince('all');
        setCity('all');
        resetPage();
    };

    const pageIds = paged.map((u) => u.id);
    const allPageSelected =
        pageIds.length > 0 && pageIds.every((id) => selected.has(id));

    const toggleSelectAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allPageSelected) {
                pageIds.forEach((id) => next.delete(id));
            } else {
                pageIds.forEach((id) => next.add(id));
            }
            return next;
        });
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const clearSelection = () => setSelected(new Set());

    const setStatusFor = async (ids: number[], newStatus: UserStatus) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/bulk-status`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids, status: statusMapFrontToApi[newStatus] }),
            });
            if (!response.ok) throw new Error('خطا در تغییر وضعیت');
            await fetchUsers();
            setSelected(new Set());
            setOpenMenuId(null);
        } catch (err) {
            setError('خطا در تغییر وضعیت کاربر');
            console.error(err);
        }
    };

    const deleteUsers = async (ids: number[]) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/bulk-delete`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids }),
            });
            if (!response.ok) throw new Error('خطا در حذف کاربران');
            await fetchUsers();
            setSelected(new Set());
            setOpenMenuId(null);
        } catch (err) {
            setError('خطا در حذف کاربران');
            console.error(err);
        }
    };

    const selectedIds = Array.from(selected);

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-red-500">
                <p>{error}</p>
                <button
                    onClick={fetchUsers}
                    className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                    تلاش مجدد
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* هدر */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">کاربران</h2>
                        <p className="text-sm text-slate-500">مدیریت و مشاهده کاربران سامانه</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-l from-indigo-500 to-violet-600 px-5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-400 hover:to-violet-500"
                >
                    <UserPlus className="h-5 w-5" />
                    افزودن کاربر
                </button>
            </div>

            {/* فیلترها */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Filter className="h-4 w-4" />
                        جستجو و فیلتر
                    </div>
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-indigo-600"
                    >
                        <X className="h-3.5 w-3.5" />
                        پاک کردن فیلترها
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">نام و نام خانوادگی</label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={name}
                                onChange={(e) => { setName(e.target.value); resetPage(); }}
                                placeholder="جستجوی نام..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">نوع کاربری</label>
                        <select
                            value={type}
                            onChange={(e) => { setType(e.target.value as UserType | 'all'); resetPage(); }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            {Object.entries(userTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">شماره موبایل</label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={phone}
                                onChange={(e) => { setPhone(e.target.value); resetPage(); }}
                                placeholder="09..."
                                dir="ltr"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-right text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">استان</label>
                        <select
                            value={province}
                            onChange={(e) => { setProvince(e.target.value); setCity('all'); resetPage(); }}
                            className={selectClass}
                        >
                            <option value="all">همه استان‌ها</option>
                            {iranProvinces.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">شهر</label>
                        <select
                            value={city}
                            onChange={(e) => { setCity(e.target.value); resetPage(); }}
                            disabled={province === 'all'}
                            className={`${selectClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                        >
                            <option value="all">همه شهرها</option>
                            {cities.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">وضعیت</label>
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value as UserStatus | 'all'); resetPage(); }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            {Object.entries(userStatusLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* نوار عملیات گروهی */}
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 px-5 py-3">
                    <span className="text-sm text-indigo-700">
                        {selectedIds.length} کاربر انتخاب شده
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setStatusFor(selectedIds, 'active')}
                            className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 transition hover:bg-emerald-50"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            فعال‌سازی
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFor(selectedIds, 'blocked')}
                            className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20 transition hover:bg-amber-50"
                        >
                            <ShieldBan className="h-4 w-4" />
                            مسدودسازی
                        </button>
                        <button
                            type="button"
                            onClick={() => deleteUsers(selectedIds)}
                            className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-red-700 ring-1 ring-red-600/20 transition hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            حذف
                        </button>
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* جدول */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                            <th className="w-12 px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={allPageSelected}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600"
                                />
                            </th>
                            <th className="w-14 px-4 py-3 font-medium">ردیف</th>
                            <th className="w-16 px-4 py-3 font-medium">آواتار</th>
                            <th className="px-4 py-3 font-medium">نام و نام خانوادگی</th>
                            <th className="w-36 px-4 py-3 font-medium">نوع کاربری</th>
                            <th className="px-4 py-3 font-medium">شماره موبایل</th>
                            <th className="w-32 px-4 py-3 font-medium">وضعیت</th>
                            <th className="w-28 px-4 py-3 font-medium">عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paged.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                    کاربری یافت نشد
                                </td>
                            </tr>
                        ) : (
                            paged.map((u, index) => {
                                const fullName = `${u.firstName} ${u.lastName}`;
                                const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`;
                                const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
                                const isSelected = selected.has(u.id);
                                return (
                                    <tr
                                        key={u.id}
                                        className={`border-b border-slate-100 transition last:border-0 ${
                                            isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'
                                        }`}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(u.id)}
                                                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{rowNumber}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                                                {u.avatar ? (
                                                    <img
                                                        src={u.avatar}
                                                        alt={fullName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{initials}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-slate-800">{fullName}</span>
                                                {u.isVerified && (
                                                    <BadgeCheck
                                                        className="h-4 w-4 text-sky-500"
                                                        aria-label="احراز هویت شده"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                    {u.province} - {u.city}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className={`inline-flex w-24 justify-center rounded-lg px-2.5 py-1 text-xs font-medium ${userTypeStyles[u.type]}`}>
                                                    {userTypeLabels[u.type]}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600" dir="ltr">
                                            <span className="block text-right">{u.phone}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className={`inline-flex w-20 justify-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${userStatusStyles[u.status]}`}>
                                                    {userStatusLabels[u.status]}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    title="مشاهده جزئیات"
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        title="عملیات بیشتر"
                                                        onClick={() =>
                                                            setOpenMenuId(openMenuId === u.id ? null : u.id)
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                    >
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>

                                                    {openMenuId === u.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setOpenMenuId(null)}
                                                            />
                                                            <div className="absolute left-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    ویرایش
                                                                </button>
                                                                {u.status === 'active' ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setStatusFor([u.id], 'blocked');
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-amber-700 transition hover:bg-amber-50"
                                                                    >
                                                                        <ShieldBan className="h-4 w-4" />
                                                                        مسدودسازی
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setStatusFor([u.id], 'active');
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-emerald-700 transition hover:bg-emerald-50"
                                                                    >
                                                                        <ShieldCheck className="h-4 w-4" />
                                                                        فعال‌سازی
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteUsers([u.id])}
                                                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    حذف
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* صفحه‌بندی */}
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                    <span>
                        نمایش {paged.length} از {usersData.total} کاربر
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs transition ${
                                    p === currentPage
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
