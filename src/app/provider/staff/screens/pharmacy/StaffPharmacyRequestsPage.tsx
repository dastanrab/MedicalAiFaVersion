import { useEffect, useState, useCallback } from 'react';
import {
    Phone, Loader2, Send, Lock, Unlock, XCircle,
} from 'lucide-react';
import {
    EmptyState,
    FilterSelect,
    PageHeader,
    SearchInput,
    StatusBadge,
    formatFaNumber,
} from '../../../components';
import { showProviderSuccess, showProviderError } from '../../../utils/toast';
import { useStaffCan } from '../../components/StaffGates';
import { ConfirmModal } from '../../components/StaffUi';
import { useStaffSession, useStaffActivityLogger } from '../../store/staffStore';
import {
    API_BASE,
    staffPharmacyStatusLabels,
    staffPharmacyStatusStyles,
    getNextStep,
    statusOptions,
    deliveryOptions,
    isAssignedToUs,
    type ApiPharmacyRequest,
} from '../../types/pharmacyShared';
import { PharmacyRequestDetailModal } from '../../components/PharmacyRequestDetailModal';

// حفظ سازگاری با ایمپورت‌های قبلی سایر فایل‌ها
export {
    staffPharmacyStatusLabels,
    staffPharmacyStatusStyles,
    pharmacyDeliveryTypeLabels,
} from './../../types/pharmacyShared';
export type {
    ApiPharmacyRequest,
    DetailedPharmacyRequest,
    PharmacyItem,
} from './../../types/pharmacyShared';

export function StaffPharmacyRequestsPage() {
    const can = useStaffCan('pharmacy');
    const log = useStaffActivityLogger('pharmacy');
    const session = useStaffSession('pharmacy');

    const [requests, setRequests] = useState<ApiPharmacyRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [status, setStatus] = useState('all');
    const [deliveryType, setDeliveryType] = useState('all');
    const [search, setSearch] = useState('');

    // مودال مستقل: فقط شناسه درخواست فعال را نگه می‌داریم
    const [detailRequestId, setDetailRequestId] = useState<number | null>(null);

    const [cancelId, setCancelId] = useState<number | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    // ---------- fetch list ----------
    const fetchRequests = useCallback(async () => {
        if (!session?.token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status !== 'all') params.append('status', status);
            if (search.trim()) params.append('search', search.trim());

            const response = await fetch(
                `${API_BASE}/staff/pharmacy/requests?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.token}`,
                        'Accept': 'application/json',
                    },
                }
            );
            const result = await response.json();
            setRequests(result.data || []);
        } catch {
            showProviderError('خطا در دریافت لیست درخواست‌های داروخانه');
        } finally {
            setLoading(false);
        }
    }, [session?.token, status, search]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // ---------- reserve ----------
    const handleAcceptRequest = async (requestId: number) => {
        if (!session?.token) return;
        setActionLoadingId(requestId);
        try {
            const response = await fetch(
                `${API_BASE}/staff/pharmacy/requests/${requestId}/accept`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.token}`,
                        'Accept': 'application/json',
                    },
                }
            );
            const result = await response.json();
            if (response.ok) {
                showProviderSuccess('درخواست با موفقیت برای داروخانه شما رزرو شد');
                log('رزرو درخواست نسخه', `درخواست #${requestId}`);
                await fetchRequests();
            } else {
                showProviderError(result.message || 'خطا در رزرو درخواست');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط');
        } finally {
            setActionLoadingId(null);
        }
    };

    // ---------- release ----------
    const handleReleaseRequest = async (requestId: number) => {
        if (!session?.token) return;
        setActionLoadingId(requestId);
        try {
            const response = await fetch(
                `${API_BASE}/staff/pharmacy/requests/${requestId}/release`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.token}`,
                        'Accept': 'application/json',
                    },
                }
            );
            const result = await response.json();
            if (response.ok) {
                showProviderSuccess('درخواست آزاد شد و به لیست عمومی بازگشت');
                log('آزادسازی درخواست نسخه', `درخواست #${requestId}`);
                await fetchRequests();
            } else {
                showProviderError(result.message || 'خطا در آزادسازی درخواست');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط');
        } finally {
            setActionLoadingId(null);
        }
    };

    // ---------- status transition ----------
    const handleStatusTransition = async (
        requestId: number,
        endpoint: string,
        stepLabel: string
    ) => {
        if (!session?.token) return;
        setActionLoadingId(requestId);
        try {
            const response = await fetch(
                `${API_BASE}/staff/pharmacy/requests/${requestId}/${endpoint}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.token}`,
                        'Accept': 'application/json',
                    },
                }
            );
            const result = await response.json();
            if (response.ok) {
                showProviderSuccess(`عملیات "${stepLabel}" ثبت شد`);
                log(`تغییر وضعیت به ${stepLabel}`, `درخواست #${requestId}`);
                await fetchRequests();
            } else {
                showProviderError(result.message || 'خطا در تغییر وضعیت');
            }
        } catch {
            showProviderError('ارتباط با سرور برقرار نشد');
        } finally {
            setActionLoadingId(null);
            setCancelId(null);
        }
    };

    // فیلتر سمت کلاینت: delivery_type + search
    const list = requests.filter((r) => {
        if (deliveryType !== 'all' && String(r.delivery_type) !== deliveryType) return false;
        const q = search.trim();
        if (!q) return true;
        return (
            r.user_name?.includes(q) ||
            r.user_mobile?.includes(q) ||
            String(r.id).includes(q) ||
            (r.prescription_code && r.prescription_code.includes(q))
        );
    });

    const toCancel = requests.find((r) => r.id === cancelId) ?? null;

    return (
        <div className="space-y-4 sm:space-y-6 text-right font-[YekanBakhFaNum]" dir="rtl">
            <PageHeader
                title="درخواست‌های نسخه داروخانه"
                description="بررسی نسخه، قیمت‌گذاری و ارسال برای بیمار"
            />

            {/* فیلترها */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
                <div className="flex-1 min-w-[200px]">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="شماره درخواست، نام بیمار، موبایل یا کد نسخه..."
                    />
                </div>
                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                    <FilterSelect
                        label="وضعیت"
                        value={status}
                        onChange={setStatus}
                        options={statusOptions}
                    />
                    <FilterSelect
                        label="نوع تحویل"
                        value={deliveryType}
                        onChange={setDeliveryType}
                        options={deliveryOptions}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : list.length === 0 ? (
                <EmptyState message="درخواست دارویی فعالی یافت نشد." />
            ) : (
                <>
                    {/* کارت موبایل */}
                    <div className="space-y-3 md:hidden">
                        {list.map((r) => {
                            const statusStr = String(r.status);
                            const step = getNextStep(r.status, r.delivery_type);
                            const isActionLoading = actionLoadingId === r.id;
                            const assigned = isAssignedToUs(r);

                            return (
                                <div
                                    key={r.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                                #{r.id}
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-500">
                                                {r.delivery_type === 1
                                                    ? 'ارسال با پیک'
                                                    : 'حضوری'}
                                            </span>
                                            {!assigned ? (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                                    عمومی
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">
                                                    رزرو شما
                                                </span>
                                            )}
                                        </div>
                                        <StatusBadge
                                            label={
                                                staffPharmacyStatusLabels[statusStr] || statusStr
                                            }
                                            className={
                                                staffPharmacyStatusStyles[statusStr] ||
                                                'bg-gray-100'
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">
                                                {r.user_name || 'کاربر ناشناس'}
                                            </p>
                                            <p className="font-mono text-xs text-slate-400 mt-0.5">
                                                {new Date(r.created_at).toLocaleDateString('fa-IR')}
                                            </p>
                                        </div>
                                        {r.user_mobile && (
                                            <a
                                                href={`tel:${r.user_mobile}`}
                                                className="flex items-center gap-1.5 rounded-xl bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-700"
                                                dir="ltr"
                                            >
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{r.user_mobile}</span>
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-xs">
                                        <span>مبلغ کل:</span>
                                        <span className="font-bold text-slate-800">
                                            {r.total_price
                                                ? `${formatFaNumber(r.total_price)} تومان`
                                                : 'در انتظار قیمت‌گذاری'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setDetailRequestId(r.id)}
                                            className="w-full rounded-xl bg-slate-100 py-2.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-200"
                                        >
                                            {r.status === 0
                                                ? assigned
                                                    ? 'قیمت‌گذاری'
                                                    : 'مشاهده نسخه'
                                                : 'اقلام و مدارک'}
                                        </button>

                                        {can('pharmacy.requests.status') && (
                                            <>
                                                {!assigned && r.status === 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAcceptRequest(r.id)}
                                                        disabled={isActionLoading}
                                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-medium text-white disabled:opacity-50"
                                                    >
                                                        {isActionLoading ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Lock className="h-3.5 w-3.5" />
                                                        )}
                                                        <span>رزرو درخواست</span>
                                                    </button>
                                                )}

                                                {assigned && r.status === 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReleaseRequest(r.id)}
                                                        disabled={isActionLoading}
                                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2.5 text-xs font-medium text-amber-700 disabled:opacity-50"
                                                    >
                                                        {isActionLoading ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Unlock className="h-3.5 w-3.5" />
                                                        )}
                                                        <span>آزادسازی</span>
                                                    </button>
                                                )}

                                                {assigned && r.status > 0 && step && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusTransition(
                                                                r.id,
                                                                step.endpoint,
                                                                step.label
                                                            )
                                                        }
                                                        disabled={isActionLoading}
                                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-medium text-white disabled:opacity-50"
                                                    >
                                                        {isActionLoading && (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        )}
                                                        <span>{step.label}</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {can('pharmacy.requests.status') &&
                                        assigned &&
                                        [0, 1].includes(r.status) && (
                                            <button
                                                type="button"
                                                onClick={() => setCancelId(r.id)}
                                                className="w-full rounded-xl bg-red-50 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                                            >
                                                لغو درخواست
                                            </button>
                                        )}
                                </div>
                            );
                        })}
                    </div>

                    {/* جدول دسکتاپ */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-right">شناسه</th>
                                <th className="px-4 py-3 text-right">بیمار</th>
                                <th className="px-4 py-3 text-right">روش تحویل</th>
                                <th className="px-4 py-3 text-right">وضعیت رزرو</th>
                                <th className="px-4 py-3 text-right">مبلغ نسخه</th>
                                <th className="px-4 py-3 text-right">تاریخ</th>
                                <th className="px-4 py-3 text-right">وضعیت</th>
                                <th className="px-4 py-3 text-center">عملیات</th>
                            </tr>
                            </thead>
                            <tbody>
                            {list.map((r) => {
                                const statusStr = String(r.status);
                                const step = getNextStep(r.status, r.delivery_type);
                                const isActionLoading = actionLoadingId === r.id;
                                const assigned = isAssignedToUs(r);

                                return (
                                    <tr
                                        key={r.id}
                                        className="border-t border-slate-100 hover:bg-slate-50/50"
                                    >
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">
                                            #{r.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-800">
                                                {r.user_name || 'کاربر ناشناس'}
                                            </p>
                                            <p
                                                className="text-xs text-slate-400 font-mono"
                                                dir="ltr"
                                            >
                                                {r.user_mobile}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {r.delivery_type === 1
                                                ? 'ارسال با پیک'
                                                : 'حضوری'}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {!assigned ? (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                                                        <XCircle className="w-3 h-3" />
                                                        عمومی
                                                    </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 font-medium text-teal-700">
                                                        <Lock className="w-3 h-3" />
                                                        رزرو شما
                                                    </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-700">
                                            {r.total_price
                                                ? `${formatFaNumber(r.total_price)} تومان`
                                                : '-'}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-slate-500 font-mono text-xs"
                                            dir="ltr"
                                        >
                                            {new Date(r.created_at).toLocaleDateString('fa-IR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                label={
                                                    staffPharmacyStatusLabels[statusStr] ||
                                                    statusStr
                                                }
                                                className={
                                                    staffPharmacyStatusStyles[statusStr] ||
                                                    ''
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailRequestId(r.id)}
                                                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                                                >
                                                    {r.status === 0
                                                        ? assigned
                                                            ? 'قیمت‌گذاری'
                                                            : 'مشاهده'
                                                        : 'جزئیات'}
                                                </button>

                                                {can('pharmacy.requests.status') && (
                                                    <>
                                                        {!assigned && r.status === 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAcceptRequest(r.id)
                                                                }
                                                                disabled={isActionLoading}
                                                                className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                                            >
                                                                {isActionLoading ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <Lock className="h-3 w-3" />
                                                                )}
                                                                <span>رزرو</span>
                                                            </button>
                                                        )}

                                                        {assigned && r.status === 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleReleaseRequest(r.id)
                                                                }
                                                                disabled={isActionLoading}
                                                                className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                                                            >
                                                                {isActionLoading ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <Unlock className="h-3 w-3" />
                                                                )}
                                                                <span>آزادسازی</span>
                                                            </button>
                                                        )}

                                                        {assigned && r.status > 0 && step && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStatusTransition(
                                                                        r.id,
                                                                        step.endpoint,
                                                                        step.label
                                                                    )
                                                                }
                                                                disabled={isActionLoading}
                                                                className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-50"
                                                            >
                                                                {isActionLoading && (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                )}
                                                                <span>{step.label}</span>
                                                            </button>
                                                        )}

                                                        {assigned &&
                                                            [0, 1].includes(r.status) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setCancelId(r.id)
                                                                    }
                                                                    className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                                                >
                                                                    لغو
                                                                </button>
                                                            )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* مودال مستقل جزئیات */}
            <PharmacyRequestDetailModal
                requestId={detailRequestId}
                onClose={() => setDetailRequestId(null)}
                onMutated={fetchRequests}
            />

            {/* مودال لغو */}
            {toCancel && (
                <ConfirmModal
                    title="لغو درخواست نسخه"
                    description={`آیا از لغو نسخه #${toCancel.id} اطمینان دارید؟`}
                    note="با تأیید این عمل، وضعیت درخواست به لغو شده تغییر خواهد کرد."
                    confirmLabel="تأیید لغو"
                    onClose={() => setCancelId(null)}
                    onConfirm={() =>
                        handleStatusTransition(toCancel.id, 'cancel', 'لغو سفارش')
                    }
                />
            )}
        </div>
    );
}