// src/pages/provider/pharmacy/Requests.tsx
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Eye, Trash2, Search, Plus, Unlock, Lock, X } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
    formatPrice,
} from '../../components';
import { PanelPageSkeleton } from '../../../components/PageSkeleton';
import { providerPath } from '../../config/providerNav';
import { useProviderSession } from "../../store/providerAuthStore";
import { SecureFileLink } from "../../components/SecureFileLink";

// ================== STATUS CONFIG ==================
const statusConfig: Record<number, { label: string; style: string }> = {
    0: { label: 'در انتظار تأیید داروخانه', style: 'bg-yellow-100 text-yellow-800' },
    1: { label: 'در انتظار پرداخت',      style: 'bg-blue-100 text-blue-800' },
    2: { label: 'در حال آماده‌سازی',     style: 'bg-purple-100 text-purple-800' },
    3: { label: 'آماده ارسال',           style: 'bg-indigo-100 text-indigo-800' },
    4: { label: 'در حال ارسال',          style: 'bg-cyan-100 text-cyan-800' },
    5: { label: 'تحویل شده',             style: 'bg-green-100 text-green-800' },
    6: { label: 'تکمیل شده',             style: 'bg-emerald-100 text-emerald-800' },
    7: { label: 'لغو شده',               style: 'bg-red-100 text-red-800' },
};

const statusOptions = [
    { value: 'all', label: 'همه' },
    ...Object.entries(statusConfig).map(([value, { label }]) => ({ value, label })),
];

// ================== CONSTANTS ==================
const BASE_URL = 'https://api.mediraai.com/api/owner/pharmacy/requests';
const SEARCH_URL = 'https://api.mediraai.com/api/owner/pharmacy/medicines/search';

// ================== INTERFACES ==================
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
    prescription_type_id?: number;
    prescription_status?: number;
    prescription_details?: string;
    prescription_created_at?: string;
    prescription_updated_at?: string;
    prescription_type_name?: string;
}

interface RequestItem {
    id: number;
    medicine_id: number;
    quantity: number;
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

// ================== LIST PAGE ==================
export function PharmacyRequestsPage() {
    const session = useProviderSession('pharmacy');
    const token = session?.token || '';

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    useEffect(() => {
        if (token) fetchRequests();
    }, [status, token]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const url = new URL(BASE_URL);
            if (status !== 'all') url.searchParams.append('status', status);
            const response = await fetch(url.toString(), {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') setRequests(data.data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return requests.filter(r => {
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
                <PanelPageSkeleton />
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
                        {filtered.map(r => {
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
                                                <Unlock className="w-3 h-3" /> آزاد (منتظر پذیرش)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                                <Lock className="w-3 h-3" /> اختصاصی
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
                                            <Eye className="h-4 w-4" /> بررسی
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

// ================== DETAIL PAGE ==================
export function PharmacyRequestDetailPage({ requestId }: { requestId: number }) {
    const session = useProviderSession('pharmacy');
    const token = session?.token || '';

    const [request, setRequest] = useState<RequestDetail | null>(null);
    const [items, setItems] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // مقادیر مودال
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MedicineSearchResult[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<MedicineSearchResult | null>(null);
    const [addQuantity, setAddQuantity] = useState<number | ''>('');
    const [addPrice, setAddPrice] = useState<number | ''>('');
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // متد بستن مودال و ریست کردن مقادیر
    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setSelectedMedicine(null);
        setAddQuantity('');
        setAddPrice('');
    };

    const handleSelectCustomMedicine = (name: string) => {
        setSelectedMedicine({
            id: 0, // آیدی 0 می‌فرستیم تا بک‌اند متوجه شود داروی جدید است
            name: name,
            base_price: '',
            pharmacy_medicine_id: null,
            pharmacy_price: null,
            pharmacy_unit: 'عدد'
        });
        setAddPrice('');
        setAddQuantity(1);
        setSearchResults([]);
        setSearchQuery('');
    };

    useEffect(() => {
        if (token) fetchRequestDetail();
    }, [requestId, token]);

    // جستجوی خودکار هنگام تایپ (Live Search با Debounce)
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await fetch(`${SEARCH_URL}?q=${searchQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setSearchResults(data.data || []);
                }
            } catch (error) {
                console.error("Error searching medicines:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, token]);

    const fetchRequestDetail = async () => {
        try {
            const response = await fetch(`${BASE_URL}/${requestId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const result = await response.json();
            if (result.status === 'success' && result.data) {
                setRequest(result.data.request);
                setItems(result.data.items || []);
            }
        } catch (error) {
            console.error("Error fetching request details:", error);
        } finally {
            setLoading(false);
        }
    };

    // ---------- عملیات تغییر وضعیت ----------
    const handleAcceptRequest = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    const handleReleaseRequest = async () => {
        if (!confirm('داروهای اضافه‌شده حذف و درخواست به لیست آزاد بازمی‌گردد. ادامه می‌دهید؟')) return;
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/release`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    const handleApproveToPayment = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ status: 1 })
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    const handleMarkAsPreparing = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/mark-preparing`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    const handleMarkAsReady = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/mark-ready`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    const handleMarkAsDelivering = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/mark-delivering`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    const handleMarkAsDelivered = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/mark-delivered`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    const handleMarkAsCompleted = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/mark-completed`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    const handleCancelRequest = async () => {
        if (!confirm('درخواست لغو شود؟')) return;
        setUpdating(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/cancel`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } finally { setUpdating(false); }
    };

    // ---------- عملیات داروها ----------
    const handleSelectMedicine = (med: MedicineSearchResult) => {
        setSelectedMedicine(med);
        setAddPrice(Number(med.pharmacy_price) || Number(med.base_price) || '');
        setAddQuantity(1);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleAddItem = async () => {
        if (!selectedMedicine || !addQuantity || !addPrice) return;
        setIsAdding(true);
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    medicine_id: selectedMedicine.id === 0 ? null : selectedMedicine.id,
                    medicine_name: selectedMedicine.name,
                    qty: addQuantity,
                    price: addPrice
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                closeAddModal(); // بستن مودال پس از موفقیت
                fetchRequestDetail();
            } else {
                alert(data.message);
            }
        } finally { setIsAdding(false); }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!confirm('آیا از حذف این مورد اطمینان دارید؟')) return;
        try {
            const res = await fetch(`${BASE_URL}/${requestId}/items/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'success') fetchRequestDetail();
            else alert(data.message);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    if (loading) return <PanelPageSkeleton />;
    if (!request) return <EmptyState message="درخواست یافت نشد." />;

    const isFreeRequest = request.pharmacy_id === null;
    const isPending = request.status === 0;

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

                    <Card title="جزئیات نسخه">
                        {request.prescription_type_name && <Row label="نوع نسخه" value={request.prescription_type_name} />}
                        {request.prescription_status !== undefined && (
                            <Row label="وضعیت نسخه" value={request.prescription_status === 1 ? 'فعال' : 'غیرفعال'} />
                        )}
                        {request.prescription_created_at && (
                            <Row label="تاریخ ثبت نسخه" value={new Date(request.prescription_created_at).toLocaleDateString('fa-IR')} />
                        )}
                        {request.prescription_details && (() => {
                            try {
                                const details = JSON.parse(request.prescription_details);
                                return (
                                    <>
                                        {details.code && <Row label="کد دیجیتال" value={details.code} />}
                                        {details.medicines && <Row label="داروهای درخواستی" value={details.medicines} />}
                                        {details.files?.length > 0 && (
                                            <div className="flex flex-col gap-2 py-2 text-sm border-t border-slate-50 mt-2 pt-2">
                                                <span className="text-slate-500 mb-1">فایل‌های پیوست نسخه:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {details.files.map((f: string) => (
                                                        <SecureFileLink
                                                            key={f}
                                                            filePath={f}
                                                            requestId={request.id}
                                                            token={token}
                                                            baseUrl={BASE_URL}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {details.has_insurance !== undefined && (
                                            <Row label="بیمه پایه" value={details.has_insurance ? 'دارد' : 'ندارد'} />
                                        )}
                                        {details.description && <Row label="توضیحات" value={details.description} />}
                                        {details.delivery_type !== undefined && (
                                            <Row label="نوع تحویل" value={details.delivery_type === '1' ? 'ارسال به درب' : 'حضوری'} />
                                        )}
                                    </>
                                );
                            } catch {
                                return <Row label="جزئیات" value={request.prescription_details || '-'} />;
                            }
                        })()}
                        {!request.prescription_details && <p className="text-sm text-slate-500">اطلاعات نسخه موجود نیست</p>}
                    </Card>

                    <Card title="داروها">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="text-slate-500 border-b border-slate-100">
                                    <th className="pb-2 text-right">نام دارو</th>
                                    <th className="pb-2 text-right">نوع/واحد</th>
                                    <th className="pb-2 text-right">تعداد</th>
                                    <th className="pb-2 text-right">قیمت واحد</th>
                                    {isPending && !isFreeRequest && <th className="pb-2 text-center">عملیات</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={isPending && !isFreeRequest ? 5 : 4} className="py-4 text-center text-slate-400">دارویی ثبت نشده است</td></tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50 last:border-0">
                                            <td className="py-3 font-medium">{item.medicine_name}</td>
                                            <td className="py-3 text-slate-500">{item.medicine_type_name} / {item.unit}</td>
                                            <td className="py-3">{item.quantity}</td>
                                            <td className="py-3 font-mono">{formatPrice(item.price)}</td>
                                            {isPending && !isFreeRequest && (
                                                <td className="py-3 text-center">
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
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

                        {/* دکمه افزودن دارو به صورت پاپ‌آپ */}
                        {isPending && !isFreeRequest && (
                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> افزودن دارو به لیست
                                </button>
                            </div>
                        )}

                        {isFreeRequest && (
                            <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50/50 p-4 text-center">
                                <Unlock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                <p className="text-sm text-purple-700">برای افزودن دارو ابتدا باید درخواست را رزرو کنید.</p>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sticky top-6">
                        <StatusBadge
                            label={statusConfig[request.status]?.label || 'نامشخص'}
                            className={statusConfig[request.status]?.style || ''}
                        />
                        <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500 text-sm">مبلغ کل قابل پرداخت:</span>
                            <span className="text-lg font-bold text-slate-800">{formatPrice(request.total_price || 0)} <span className="text-xs font-normal text-slate-500">تومان</span></span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            {isFreeRequest && (
                                <button onClick={handleAcceptRequest} disabled={updating}
                                        className="rounded-xl border border-purple-200 bg-purple-600 py-3 text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors">
                                    {updating ? 'در حال رزرو...' : 'رزرو و پذیرش درخواست'}
                                </button>
                            )}

                            {!isFreeRequest && request.status === 0 && (
                                <>
                                    <button onClick={handleApproveToPayment} disabled={updating}
                                            className="rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                                        {updating ? 'کمی صبر کنید...' : 'تایید نهایی و صدور فاکتور'}
                                    </button>
                                    <div className="h-px bg-slate-100 my-2"></div>
                                    <button onClick={handleReleaseRequest} disabled={updating}
                                            className="rounded-xl border border-amber-200 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors">
                                        رهاسازی (بازگشت به درخواست‌های آزاد)
                                    </button>
                                    <button onClick={handleCancelRequest} disabled={updating}
                                            className="rounded-xl border border-red-200 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                        لغو درخواست
                                    </button>
                                </>
                            )}

                            {!isFreeRequest && request.status === 1 && (
                                <>
                                    <button onClick={handleMarkAsPreparing} disabled={updating}
                                            className="rounded-xl border border-purple-200 bg-purple-50 py-3 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors">
                                        {updating ? 'کمی صبر کنید...' : 'شروع آماده‌سازی'}
                                    </button>
                                    <button onClick={handleCancelRequest} disabled={updating}
                                            className="rounded-xl border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                        لغو درخواست
                                    </button>
                                </>
                            )}

                            {!isFreeRequest && request.status === 2 && (
                                <button onClick={handleMarkAsReady} disabled={updating}
                                        className="rounded-xl border border-indigo-200 bg-indigo-50 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
                                    {updating ? 'کمی صبر کنید...' : 'آماده برای ارسال'}
                                </button>
                            )}

                            {!isFreeRequest && request.status === 3 && (
                                <button onClick={handleMarkAsDelivering} disabled={updating}
                                        className="rounded-xl border border-cyan-200 bg-cyan-50 py-3 text-sm font-medium text-cyan-700 hover:bg-cyan-100 transition-colors">
                                    {updating ? 'کمی صبر کنید...' : 'شروع ارسال به بیمار'}
                                </button>
                            )}

                            {!isFreeRequest && request.status === 4 && (
                                <button onClick={handleMarkAsDelivered} disabled={updating}
                                        className="rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
                                    {updating ? 'کمی صبر کنید...' : 'تأیید تحویل به بیمار'}
                                </button>
                            )}

                            {!isFreeRequest && request.status === 5 && (
                                <button onClick={handleMarkAsCompleted} disabled={updating}
                                        className="rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                                    {updating ? 'کمی صبر کنید...' : 'تکمیل نهایی سفارش'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* مودال جستجو و افزودن دارو */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeAddModal}></div>
                    <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">

                        {/* هدر مودال */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <h3 className="text-lg font-bold text-slate-800">جستجو و افزودن دارو</h3>
                            <button onClick={closeAddModal} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* بدنه مودال */}
                        <div className="flex-1 overflow-y-auto min-h-[300px]">
                            {!selectedMedicine ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="نام دارو را تایپ کنید..."
                                            autoFocus
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3.5 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                                        />
                                        <div className="absolute left-3 top-4 text-slate-400">
                                            {isSearching ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
                                            ) : (
                                                <Search className="h-5 w-5" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        {searchResults.length === 0 && searchQuery.trim() !== '' && !isSearching && (
                                            <div className="text-center py-8 text-slate-500 text-sm">
                                                دارویی با این نام در سیستم یافت نشد. می‌توانید آن را به عنوان داروی جدید اضافه کنید.
                                            </div>
                                        )}

                                        {searchResults.map(med => (
                                            <div
                                                key={med.id}
                                                onClick={() => handleSelectMedicine(med)}
                                                className="cursor-pointer rounded-xl px-4 py-3 hover:bg-teal-50 border border-transparent hover:border-teal-100 flex justify-between items-center transition-colors"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800">{med.name}</span>
                                                    {med.pharmacy_price ? (
                                                        <span className="text-xs text-teal-700 bg-teal-100/50 px-2 py-0.5 rounded-md mt-1.5 w-max">
                                                            موجود در داروخانه ({med.pharmacy_unit})
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 w-max border border-amber-100">
                                                            نیاز به قیمت‌گذاری جدید
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* دکمه افزودن داروی جدید */}
                                        {searchQuery.trim() !== '' && !searchResults.some(m => m.name === searchQuery.trim()) && !isSearching && (
                                            <div
                                                onClick={() => handleSelectCustomMedicine(searchQuery.trim())}
                                                className="cursor-pointer rounded-xl px-4 py-4 mt-2 text-sm text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center justify-center gap-2 group"
                                            >
                                                <div className="bg-white p-1 rounded-full group-hover:scale-110 transition-transform">
                                                    <Plus className="w-4 h-4 text-teal-600" />
                                                </div>
                                                <span className="font-medium">افزودن <span className="font-bold">"{searchQuery.trim()}"</span> به عنوان داروی جدید</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* فرم ثبت قیمت و تعداد برای داروی انتخاب شده */
                                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-teal-600 mb-1">داروی انتخاب شده:</p>
                                                <span className="text-base font-bold text-teal-900">{selectedMedicine.name}</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedMedicine(null)}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200"
                                            >
                                                تغییر دارو
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">تعداد</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={addQuantity}
                                                onChange={e => setAddQuantity(Number(e.target.value))}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">قیمت واحد (تومان)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={addPrice}
                                                onChange={e => setAddPrice(Number(e.target.value))}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddItem}
                                        disabled={isAdding || !addQuantity || !addPrice}
                                        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors shadow-sm"
                                    >
                                        <Plus className="h-5 w-5" />
                                        {isAdding ? 'در حال افزودن...' : 'ثبت و افزودن به نسخه بیمار'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ================== COMPONENTS HELPERS ==================
function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-base font-bold text-slate-800">{title}</h3>
            {children}
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-2.5 text-sm border-b border-slate-50 last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-800">{value}</span>
        </div>
    );
}