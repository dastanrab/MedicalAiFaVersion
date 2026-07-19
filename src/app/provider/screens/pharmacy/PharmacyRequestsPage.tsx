import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Eye, Trash2, Search, Plus, Unlock, Lock } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
    formatPrice,
} from '../../components';
import { providerPath } from '../../config/providerNav';
import { useProviderSession } from "../../store/providerAuthStore";

const statusConfig: Record<number, { label: string; style: string }> = {
    0: { label: 'در انتظار بررسی', style: 'bg-yellow-100 text-yellow-800' },
    1: { label: 'تایید شده (در انتظار پرداخت)', style: 'bg-blue-100 text-blue-800' },
    2: { label: 'رد شده', style: 'bg-red-100 text-red-800' },
    3: { label: 'تکمیل شده', style: 'bg-emerald-100 text-emerald-800' },
};

const statusOptions = [
    { value: 'all', label: 'همه' },
    { value: '0', label: 'در انتظار بررسی' },
    { value: '1', label: 'تایید شده' },
    { value: '2', label: 'رد شده' },
    { value: '3', label: 'تکمیل شده' },
];

interface RequestDetail {
    id: number;
    user_id: number;
    pharmacy_id: number | null;
    pharmacy_request_type_id: number | null;
    prescription_id: number;
    total_price: string;
    status: number;
    created_at: string;
    updated_at: string;
    user_name: string;
    user_mobile: string;
    user_national_code: string | null;
}

interface RequestItem {
    id: number;
    medicine_id: number;       // اصلاح: medicine_id نه pharmacy_medicine_id
    quantity: number;          // از qty alias شده
    price: string;
    total_price: string;
    medicine_name: string;
    medicine_type_name: string;
    unit: string;
}


interface MedicineSearchResult {
    id: number;
    name: string;
    base_price: string;
    pharmacy_medicine_id: number | null;
    pharmacy_price: string | null;
    pharmacy_unit: string | null;
}

const BASE_URL = 'http://185.222.163.113:7000/api/owner/pharmacy/requests';
const SEARCH_URL = 'http://185.222.163.113:7000/api/owner/pharmacy/medicines/search';

export function PharmacyRequestsPage() {
    const session = useProviderSession('pharmacy');
    const token = session?.token || '';

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    useEffect(() => {
        if (token) {
            fetchRequests();
        }
    }, [status, token]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const url = new URL(BASE_URL);
            if (status !== 'all') {
                url.searchParams.append('status', status);
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setRequests(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return requests.filter((r) => {
            const q = search.trim();
            if (!q) return true;
            return r.user_name?.includes(q) || r.user_mobile?.includes(q) || r.id.toString().includes(q);
        });
    }, [search, requests]);

    return (
        <div className="space-y-6">
            <PageHeader title="درخواست‌های داروخانه" />

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجوی نام، موبایل یا کد..." />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusOptions} />
            </div>

            {loading ? (
                <div className="text-center p-4">در حال بارگذاری...</div>
            ) : filtered.length === 0 ? (
                <EmptyState message="نسخه‌ای یافت نشد." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">نوع درخواست</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">مبلغ کل</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                            <th className="px-4 py-3" />
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((r) => {
                            const isFree = r.pharmacy_id === null;
                            return (
                                <tr key={r.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                                    <td className="px-4 py-3">
                                        <p>{r.user_name}</p>
                                        <p className="text-xs text-slate-400">{r.user_mobile}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {isFree ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                                                <Unlock className="w-3 h-3" />
                                                آزاد (منتظر پذیرش)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                                <Lock className="w-3 h-3" />
                                                اختصاصی
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{formatPrice(r.total_price || 0)}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            label={statusConfig[r.status]?.label || 'نامشخص'}
                                            className={statusConfig[r.status]?.style || ''}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-left">
                                        <Link
                                            to={providerPath('pharmacy', `requests/${r.id}`)}
                                            className="inline-flex items-center gap-1 text-teal-600 hover:underline"
                                        >
                                            <Eye className="h-4 w-4" />
                                            بررسی
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export function PharmacyRequestDetailPage({ requestId }: { requestId: number }) {
    const session = useProviderSession('pharmacy');
    const token = session?.token || '';

    const [request, setRequest] = useState<RequestDetail | null>(null);
    const [items, setItems] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MedicineSearchResult[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<MedicineSearchResult | null>(null);
    const [addQuantity, setAddQuantity] = useState<number | ''>('');
    const [addPrice, setAddPrice] = useState<number | ''>('');
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (token) {
            fetchRequestDetail();
        }
    }, [requestId, token]);

    const fetchRequestDetail = async () => {
        try {
            const response = await fetch(`${BASE_URL}/${requestId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,'Accept': 'application/json'
                }
            });
            const result = await response.json();

            // اصلاح: 'success' نه true
            if (result.status ==='success' && result.data) {
                setRequest(result.data.request);
                setItems(result.data.items || []);
            }
        } catch (error) {
            console.error("Error fetching request details:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleAcceptRequest = async () => {
        setUpdating(true);
        try {
            const response = await fetch(`${BASE_URL}/${requestId}/accept`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                fetchRequestDetail();
            } else {
                alert(data.message || 'خطا در پذیرش درخواست');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleReleaseRequest = async () => {
        if (!confirm('آیا مطمئن هستید؟ با این کار تمام داروهایی که اضافه کرده‌اید حذف شده و درخواست به استخر آزاد برمی‌گردد.')) return;
        setUpdating(true);
        try {
            const response = await fetch(`${BASE_URL}/${requestId}/release`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                fetchRequestDetail();
            } else {
                alert(data.message || 'خطا در آزادسازی درخواست');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateStatus = async (newStatus: number) => {
        setUpdating(true);
        try {
            const response = await fetch(`${BASE_URL}/${requestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.status === 'success') {
                fetchRequestDetail();
            } else {
                alert(data.message || 'خطا در تغییر وضعیت');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleSearchMedicine = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`${SEARCH_URL}?q=${searchQuery}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setSearchResults(data.data || []);
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectMedicine = (med: MedicineSearchResult) => {
        setSelectedMedicine(med);
        const defaultPrice = med.pharmacy_price ? Number(med.pharmacy_price) : Number(med.base_price);
        setAddPrice(defaultPrice || '');
        setAddQuantity(1);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleAddItem = async () => {
        if (!selectedMedicine || !addQuantity || !addPrice) return;
        setIsAdding(true);
        try {
            const response = await fetch(`${BASE_URL}/${requestId}/items`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    medicine_id: selectedMedicine.id,
                    qty: addQuantity,
                    price: addPrice
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setSelectedMedicine(null);
                setAddQuantity('');
                setAddPrice('');
                fetchRequestDetail();
            } else {
                alert(data.message || 'خطا در افزودن دارو');
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!confirm('آیا از حذف این مورد اطمینان دارید؟')) return;
        try {
            const response = await fetch(`${BASE_URL}/${requestId}/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status === 'success') {
                fetchRequestDetail();
            } else {
                alert(data.message || 'خطا در حذف دارو');
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    if (loading) return <div className="p-6 text-center">در حال بارگذاری اطلاعات...</div>;
    if (!request) return <EmptyState message="درخواست یافت نشد." />;

    const isPending = request.status === 0;
    const isFreeRequest = request.pharmacy_id === null;

    return (
        <div className="space-y-6">
            <PageHeader
                title={`درخواست #${request.id} ${isFreeRequest ? '(آزاد)' : ''}`}
                actions={
                    <Link to={providerPath('pharmacy', 'requests')} className="text-sm text-slate-500 hover:text-slate-800">
                        بازگشت
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card title="بیمار">
                        <Row label="نام" value={request.user_name} />
                        <Row label="موبایل" value={request.user_mobile} />
                        {request.user_national_code && <Row label="کد ملی" value={request.user_national_code} />}
                    </Card>

                    <Card title="داروها">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="text-slate-500 border-b border-slate-100">
                                    <th className="pb-2 text-right">نام دارو</th>
                                    <th className="pb-2 text-right">نوع/واحد</th>
                                    <th className="pb-2 text-right">تعداد</th>
                                    <th className="pb-2 text-right">قیمت (واحد)</th>
                                    {isPending && !isFreeRequest && <th className="pb-2 text-center">عملیات</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={isPending && !isFreeRequest ? 5 : 4} className="py-4 text-center">دارویی ثبت نشده است</td></tr>
                                ) : (
                                    items.map((item, i) => (
                                        <tr key={i} className="border-b border-slate-50 last:border-0">
                                            <td className="py-3">{item.medicine_name}</td>
                                            <td className="py-3">{item.medicine_type_name} / {item.unit}</td>
                                            <td className="py-3">{item.quantity}</td>
                                            <td className="py-3">{formatPrice(item.price)}</td>
                                            {isPending && !isFreeRequest && (
                                                <td className="py-3 text-center">
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="حذف دارو"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {isFreeRequest ? (
                        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 text-center">
                            <Unlock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-purple-800 mb-2">این درخواست آزاد است</h3>
                            <p className="text-sm text-purple-600">برای مشاهده جزئیات بیشتر و افزودن دارو، ابتدا باید این درخواست را رزرو کنید.</p>
                        </div>
                    ) : isPending ? (
                        <Card title="افزودن دارو به نسخه">
                            {!selectedMedicine ? (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchMedicine()}
                                            placeholder="جستجوی نام دارو..."
                                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={handleSearchMedicine}
                                            disabled={isSearching}
                                            className="rounded-xl bg-slate-100 px-4 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                                        >
                                            <Search className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                                            {searchResults.map(med => (
                                                <div
                                                    key={med.id}
                                                    onClick={() => handleSelectMedicine(med)}
                                                    className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 flex justify-between items-center border-b border-slate-100 last:border-0"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{med.name}</span>
                                                        {med.pharmacy_price ? (
                                                            <span className="text-xs text-teal-600 bg-teal-100 px-1.5 py-0.5 rounded mt-1 w-max">
                                                                موجود در انبار ({med.pharmacy_unit})
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1 w-max">
                                                                جدید برای داروخانه
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-slate-500 text-xs font-mono">
                                                        {formatPrice(med.pharmacy_price || med.base_price || 0)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-teal-800">{selectedMedicine.name}</span>
                                        <button onClick={() => setSelectedMedicine(null)} className="text-xs text-slate-500 hover:text-red-500">انصراف</button>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 mb-1 block">تعداد</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={addQuantity}
                                                onChange={(e) => setAddQuantity(Number(e.target.value))}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 mb-1 block">قیمت واحد (تومان)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={addPrice}
                                                onChange={(e) => setAddPrice(Number(e.target.value))}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddItem}
                                        disabled={isAdding || !addQuantity || !addPrice}
                                        className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-teal-600 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {isAdding ? 'در حال افزودن...' : 'افزودن به نسخه'}
                                    </button>
                                </div>
                            )}
                        </Card>
                    ) : null}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <StatusBadge
                            label={statusConfig[request.status]?.label || 'نامشخص'}
                            className={statusConfig[request.status]?.style || ''}
                        />
                        <p className="mt-3 text-sm font-bold text-slate-700">جمع: {formatPrice(request.total_price || 0)}</p>

                        <div className="mt-4 flex flex-col gap-2">
                            {isFreeRequest ? (
                                <button
                                    onClick={handleAcceptRequest}
                                    disabled={updating}
                                    className="rounded-xl border border-purple-200 bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 shadow-sm"
                                >
                                    {updating ? 'کمی صبر کنید...' : 'رزرو و پذیرش درخواست'}
                                </button>
                            ) : request.status === 0 ? (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(1)}
                                        disabled={updating}
                                        className="rounded-xl border border-blue-200 bg-blue-50 py-2 text-sm text-blue-700 hover:bg-blue-100"
                                    >
                                        {updating ? 'کمی صبر کنید...' : 'تایید نهایی نسخه و ارسال به بیمار'}
                                    </button>

                                    <div className="h-px bg-slate-100 my-2"></div>

                                    <button
                                        onClick={handleReleaseRequest}
                                        disabled={updating}
                                        className="rounded-xl border border-amber-200 py-2 text-sm text-amber-600 hover:bg-amber-50"
                                    >
                                        رهاسازی (بازگشت به درخواست‌های آزاد)
                                    </button>

                                    <button
                                        onClick={() => handleUpdateStatus(2)}
                                        disabled={updating}
                                        className="rounded-xl border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        رد کامل درخواست
                                    </button>
                                </>
                            ) : null}

                            {request.status === 1 && (
                                <button
                                    onClick={() => handleUpdateStatus(3)}
                                    disabled={updating}
                                    className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-sm text-emerald-700 hover:bg-emerald-100"
                                >
                                    {updating ? 'کمی صبر کنید...' : 'تکمیل و تحویل'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
            {children}
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-2 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
