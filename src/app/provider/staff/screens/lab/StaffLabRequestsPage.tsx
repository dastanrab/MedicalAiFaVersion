import { useEffect, useState, useCallback } from 'react';
import {
    Home, MapPin, Phone, Loader2, Upload, FileCheck, Image as ImageIcon,
    FileText, Calendar, DollarSign, Navigation, ArrowLeft
} from 'lucide-react';
import {
    EmptyState,
    FilterSelect,
    PageHeader,
    ProviderModal,
    SearchInput,
    StatusBadge,
} from '../../../components';
import { showProviderSuccess, showProviderError } from '../../../utils/toast';
import { useStaffCan } from '../../components/StaffGates';
import { ConfirmModal, DetailRow } from '../../components/StaffUi';
import {
    labVisitTypeLabels,
    staffLabNextStep,
    staffLabStatusLabels,
    staffLabStatusStyles,
} from '../../config/staffStatusOptions';
import { useStaffSession, useStaffActivityLogger } from '../../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

export interface ApiLabRequest {
    request_id: number;
    visit_type: string | number;
    request_status: number;
    total_price: number;
    request_date: string;
    user_name: string;
    user_phone: string;
    tests?: { test_pack_id: number; test_name: string }[];
}

export interface DetailedLabRequest extends ApiLabRequest {
    address?: string | null;
    lat?: number | string | null;
    lng?: number | string | null;
    prescription_id?: number | null;
    prescription_type_id?: number | null;
    prescription_details?: any;
    prescription_files?: string[];
    tests: {
        lab_request_test_pack_id: number;
        test_pack_id: number;
        name: string;
        result_url?: string | null;
    }[];
}

const statusOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(staffLabStatusLabels).map(([value, label]) => ({ value, label })),
];

const typeOptions = [
    { value: 'all', label: 'همه' },
    { value: '0', label: 'مراجعه حضوری' },
    { value: '1', label: 'نمونه‌گیری در منزل' },
];

export function StaffLabRequestsPage() {
    const can = useStaffCan('lab');
    const log = useStaffActivityLogger('lab');
    const session = useStaffSession('lab');

    const [requests, setRequests] = useState<ApiLabRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // فیلترها
    const [status, setStatus] = useState('all');
    const [type, setType] = useState('all');
    const [search, setSearch] = useState('');

    // مدیریت جزئیات و دانلود/آپلود
    const [selectedDetail, setSelectedDetail] = useState<DetailedLabRequest | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [uploadingTestPackId, setUploadingTestPackId] = useState<number | null>(null);
    const [downloadingPrescriptionIndex, setDownloadingPrescriptionIndex] = useState<number | null>(null);
    const [downloadingResultId, setDownloadingResultId] = useState<number | null>(null);

    // مودال لغو و لودینگ عملیات تغییر وضعیت
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    // واکشی لیست درخواست‌ها
    const fetchRequests = useCallback(async () => {
        if (!session?.token) return;
        setLoading(true);

        try {
            const params = new URLSearchParams();
            if (status !== 'all') params.append('status', status);
            if (type !== 'all') params.append('visit_type', type);

            const response = await fetch(`${API_BASE}/staff/lab/requests?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${session.token}` ,
                    'Accept': 'application/json',
                }
            });
            const result = await response.json();

            if (result.data) {
                setRequests(result.data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            showProviderError('خطا در دریافت لیست درخواست‌ها');
        } finally {
            setLoading(false);
        }
    }, [session?.token, status, type]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // دریافت اطلاعات کامل پرونده
    const openDetailModal = async (requestId: number) => {
        setLoadingDetail(true);
        try {
            const response = await fetch(`${API_BASE}/staff/lab/requests/${requestId}`, {
                headers: {
                    'Authorization': `Bearer ${session.token}` ,
                    'Accept': 'application/json',
                }
            });
            const result = await response.json();
            if (response.ok && result.data) {
                setSelectedDetail(result.data);
            } else {
                showProviderError(result.message || 'خطا در دریافت جزئیات');
            }
        } catch (err) {
            showProviderError('خطا در ارتباط با سرور');
        } finally {
            setLoadingDetail(false);
        }
    };

    // دانلود نسخه
    const handleDownloadPrescription = async (fileUrl: string, index: number) => {
        setDownloadingPrescriptionIndex(index);
        try {
            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            if (!response.ok) throw new Error();

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch {
            showProviderError('خطا در دریافت فایل نسخه.');
        } finally {
            setDownloadingPrescriptionIndex(null);
        }
    };

    // دانلود جواب
    const handleDownloadResult = async (resultUrl: string, testPackId: number) => {
        setDownloadingResultId(testPackId);
        try {
            const response = await fetch(resultUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${session.token}`  }
            });
            if (!response.ok) throw new Error();

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch {
            showProviderError('خطا در دریافت نتیجه آزمایش.');
        } finally {
            setDownloadingResultId(null);
        }
    };

    // آپلود جواب آزمایش
    const handleUploadResult = async (labRequestTestPackId: number, file: File) => {
        if (!selectedDetail) return;
        setUploadingTestPackId(labRequestTestPackId);

        const formData = new FormData();
        formData.append('lab_request_test_pack_id', String(labRequestTestPackId));
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}/staff/lab/requests/${selectedDetail.request_id}/results`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.token}` ,
                    'Accept': 'application/json',
                },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                showProviderSuccess('نتیجه آزمایش با موفقیت بارگذاری شد.');
                await openDetailModal(selectedDetail.request_id);
                fetchRequests();
            } else {
                showProviderError(result.message || 'خطا در بارگذاری فایل');
            }
        } catch {
            showProviderError('خطا در ارسال فایل به سرور');
        } finally {
            setUploadingTestPackId(null);
        }
    };

    // تغییر وضعیت
    const updateRequestStatus = async (requestId: number, newStatus: string) => {
        if (!session?.token) return;
        setActionLoadingId(requestId);

        try {
            const response = await fetch(`${API_BASE}/staff/lab/requests/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}` ,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();

            if (response.ok) {
                showProviderSuccess(`وضعیت با موفقیت تغییر کرد`);
                fetchRequests();
                if (selectedDetail && selectedDetail.request_id === requestId) {
                    setSelectedDetail(prev => prev ? { ...prev, request_status: Number(newStatus) } : null);
                }
            } else {
                showProviderError(result.message || 'خطا در تغییر وضعیت');
            }
        } catch (error) {
            showProviderError('ارتباط با سرور قطع شد');
        } finally {
            setActionLoadingId(null);
            setCancelId(null);
        }
    };

    const advance = (r: ApiLabRequest) => {
        const currentStatusStr = String(r.request_status);
        const step = staffLabNextStep[currentStatusStr];
        if (!step) return;

        log(step.label, `شناسه ${r.request_id} — ${r.user_name}`);
        updateRequestStatus(r.request_id, step.to);
    };

    const list = requests.filter((r) => {
        const q = search.trim();
        if (!q) return true;
        const reqStr = String(r.request_id);
        return r.user_name?.includes(q) || r.user_phone?.includes(q) || reqStr.includes(q);
    });

    const toCancel = requests.find((r) => r.request_id === cancelId) ?? null;

    return (
        <div className="space-y-4 sm:space-y-6 text-right font-[YekanBakhFaNum]" dir="rtl">
            <PageHeader title="درخواست‌های آزمایشگاه من" description="پیگیری، نمونه‌گیری و ثبت نتایج مراجعین" />

            {/* بخش فیلترها (ریسپانسیو) */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
                <div className="flex-1 min-w-[200px]">
                    <SearchInput value={search} onChange={setSearch} placeholder="شماره درخواست، نام یا موبایل..." />
                </div>
                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                    <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusOptions} />
                    <FilterSelect label="نوع مراجعه" value={type} onChange={setType} options={typeOptions} />
                </div>
            </div>

            {loading ? (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : list.length === 0 ? (
                <EmptyState message="درخواستی به شما ارجاع داده نشده است." />
            ) : (
                <>
                    {/* 📱 نمای مخصوص موبایل (Card-based List) */}
                    <div className="space-y-3 md:hidden">
                        {list.map((r) => {
                            const statusStr = String(r.request_status);
                            const step = staffLabNextStep[statusStr];
                            const isActionLoading = actionLoadingId === r.request_id;
                            const visitTypeLabel = labVisitTypeLabels[String(r.visit_type)] || 'نامشخص';

                            return (
                                <div
                                    key={r.request_id}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 transition active:bg-slate-50/50"
                                >
                                    {/* هدر کارت: شماره درخواست، وضعیت و نوع مراجعه */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                                #{r.request_id}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                                {String(r.visit_type) === '1' ? (
                                                    <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                                        <Home className="h-3 w-3" /> در منزل
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">حضوری</span>
                                                )}
                                            </span>
                                        </div>
                                        <StatusBadge
                                            label={staffLabStatusLabels[statusStr] || statusStr}
                                            className={staffLabStatusStyles[statusStr] || 'bg-gray-100 text-gray-700'}
                                        />
                                    </div>

                                    {/* مشخصات بیمار و تماس */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{r.user_name}</p>
                                            <p className="font-mono text-xs text-slate-400 mt-0.5">
                                                {new Date(r.request_date).toLocaleDateString('fa-IR')}
                                            </p>
                                        </div>
                                        {r.user_phone && (
                                            <a
                                                href={`tel:${r.user_phone}`}
                                                className="flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                                dir="ltr"
                                            >
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{r.user_phone}</span>
                                            </a>
                                        )}
                                    </div>

                                    {/* آزمایش‌های خواسته شده */}
                                    <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                                        <span className="font-semibold text-slate-700 block mb-1">آزمایش‌ها:</span>
                                        <p className="line-clamp-2 leading-relaxed" dir="ltr">
                                            {r.tests && r.tests.length > 0
                                                ? r.tests.map(t => t.test_name).join('، ')
                                                : <span className="text-slate-400 font-sans">فقط نسخه ضمیمه شده است</span>}
                                        </p>
                                    </div>

                                    {/* دکمه‌های اکشن موبایل */}
                                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => openDetailModal(r.request_id)}
                                            className="w-full rounded-xl bg-slate-100 py-2.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-200 active:scale-[0.98] transition"
                                        >
                                            جزئیات و مدارک
                                        </button>

                                        {can('lab.requests.status') && step ? (
                                            <button
                                                type="button"
                                                onClick={() => advance(r)}
                                                disabled={isActionLoading}
                                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-medium text-white hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50"
                                            >
                                                {isActionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                <span>{step.label}</span>
                                            </button>
                                        ) : can('lab.requests.status') && ['2', '3'].includes(statusStr) ? (
                                            <button
                                                type="button"
                                                onClick={() => setCancelId(r.request_id)}
                                                disabled={isActionLoading}
                                                className="w-full rounded-xl bg-red-50 py-2.5 text-center text-xs font-medium text-red-700 hover:bg-red-100 active:scale-[0.98] transition"
                                            >
                                                لغو درخواست
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 💻 نمای دسکتاپ و تبلت (جدول کلاسیک) */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold">کد</th>
                                <th className="px-4 py-3 text-right font-semibold">بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold">آزمایش‌ها</th>
                                <th className="px-4 py-3 text-right font-semibold">زمان ثبت</th>
                                <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                                <th className="px-4 py-3 text-center font-semibold">عملیات</th>
                            </tr>
                            </thead>
                            <tbody>
                            {list.map((r) => {
                                const statusStr = String(r.request_status);
                                const step = staffLabNextStep[statusStr];
                                const isActionLoading = actionLoadingId === r.request_id;
                                const visitTypeLabel = labVisitTypeLabels[String(r.visit_type)] || 'نامشخص';

                                return (
                                    <tr key={r.request_id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">#{r.request_id}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-800">{r.user_name}</p>
                                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                {String(r.visit_type) === '1' && <Home className="h-3 w-3 text-amber-600" />}
                                                {visitTypeLabel}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate" dir="ltr">
                                            {r.tests && r.tests.length > 0
                                                ? r.tests.map(t => t.test_name).join('، ')
                                                : <span className="text-slate-400">فقط نسخه ضمیمه</span>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 font-mono text-xs" dir="ltr">
                                            {new Date(r.request_date).toLocaleDateString('fa-IR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                label={staffLabStatusLabels[statusStr] || statusStr}
                                                className={staffLabStatusStyles[statusStr] || 'bg-gray-100 text-gray-700'}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openDetailModal(r.request_id)}
                                                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                                >
                                                    جزئیات و مدارک
                                                </button>
                                                {can('lab.requests.status') && step && (
                                                    <button
                                                        type="button"
                                                        onClick={() => advance(r)}
                                                        disabled={isActionLoading}
                                                        className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                                    >
                                                        {isActionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                                                        {step.label}
                                                    </button>
                                                )}
                                                {can('lab.requests.status') && ['2', '3'].includes(statusStr) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCancelId(r.request_id)}
                                                        disabled={isActionLoading}
                                                        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                                                    >
                                                        لغو
                                                    </button>
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

            {/* لودینگ باز شدن مودال */}
            {loadingDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="flex items-center gap-3 bg-white p-5 rounded-2xl shadow-xl">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        <span className="text-sm font-medium text-slate-700">در حال دریافت جزئیات و پرونده...</span>
                    </div>
                </div>
            )}

            {/* مودال جامع جزئیات، آدرس و مدارک */}
            {selectedDetail && (
                <ProviderModal
                    open
                    onClose={() => setSelectedDetail(null)}
                    title={`پرونده آزمایش #${selectedDetail.request_id}`}
                >
                    <div className="space-y-4 sm:space-y-6 text-sm">
                        {/* اطلاعات پایه */}
                        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 space-y-3">
                            <DetailRow label="نام بیمار" value={selectedDetail.user_name} />
                            <DetailRow
                                label="شماره تماس"
                                value={
                                    <a href={`tel:${selectedDetail.user_phone}`} className="flex items-center gap-1.5 text-indigo-600 font-mono font-medium" dir="ltr">
                                        <Phone className="h-3.5 w-3.5" />
                                        {selectedDetail.user_phone}
                                    </a>
                                }
                            />
                            <DetailRow label="نوع مراجعه" value={labVisitTypeLabels[String(selectedDetail.visit_type)]} />
                            <DetailRow
                                label="آدرس بیمار"
                                value={
                                    selectedDetail.address ? (
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-1.5 text-slate-700">
                                                <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                <span className="leading-relaxed text-xs sm:text-sm">{selectedDetail.address}</span>
                                            </div>

                                            {/* دکمه مسیریابی نشان */}
                                            {selectedDetail.lat && selectedDetail.lng && (
                                                <div className="pt-1">
                                                    <a
                                                        href={`https://neshan.org/maps/@${selectedDetail.lat},${selectedDetail.lng},16z,0p/routing/car/destination/${selectedDetail.lat},${selectedDetail.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition shadow-2xs"
                                                    >
                                                        <Navigation className="h-3.5 w-3.5 text-sky-600" />
                                                        <span>مسیریابی با نشان</span>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">مراجعه حضوری به آزمایشگاه</span>
                                    )
                                }
                            />
                            <DetailRow
                                label="مبلغ کل"
                                value={`${(selectedDetail.total_price || 0).toLocaleString('fa-IR')} تومان`}
                            />
                            <DetailRow
                                label="وضعیت جاری"
                                value={
                                    <StatusBadge
                                        label={staffLabStatusLabels[String(selectedDetail.request_status)]}
                                        className={staffLabStatusStyles[String(selectedDetail.request_status)]}
                                    />
                                }
                            />
                        </div>

                        {/* فایل‌های نسخه بیمار */}
                        {selectedDetail.prescription_files && selectedDetail.prescription_files.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
                                <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-3 text-xs">
                                    <FileText className="w-4 h-4 text-amber-500" /> تصاویر / مدارک نسخه بیمار:
                                </h4>
                                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2.5">
                                    {selectedDetail.prescription_files.map((url, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleDownloadPrescription(url, idx)}
                                            disabled={downloadingPrescriptionIndex === idx}
                                            className="group flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-amber-400 transition disabled:opacity-50"
                                        >
                                            {downloadingPrescriptionIndex === idx ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="h-6 w-6 text-slate-400 group-hover:text-amber-600 transition-colors" />
                                                    <span className="mt-1 text-[11px] text-slate-600 font-medium">فایل {idx + 1}</span>
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* لیست آزمایش‌ها و آپلود نتیجه (بهینه‌شده برای موبایل) */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-800 text-xs">تست‌های آزمایشگاهی و ثبت نتیجه:</h4>

                            {/* کارت‌های آزمایش در موبایل / جدول در دسکتاپ */}
                            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
                                {selectedDetail.tests && selectedDetail.tests.length > 0 ? (
                                    selectedDetail.tests.map((t) => {
                                        const isUploading = uploadingTestPackId === t.lab_request_test_pack_id;
                                        const isDownloading = downloadingResultId === t.test_pack_id;

                                        return (
                                            <div key={t.lab_request_test_pack_id} className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/60">
                                                <span className="font-semibold text-slate-800 text-xs sm:text-sm">{t.name}</span>
                                                <div className="flex items-center gap-2">
                                                    {t.result_url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDownloadResult(t.result_url!, t.test_pack_id)}
                                                            disabled={isDownloading}
                                                            className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                                                        >
                                                            {isDownloading ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                            )}
                                                            <span>مشاهده نتیجه</span>
                                                        </button>
                                                    )}
                                                    <label className="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition">
                                                        {isUploading ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Upload className="h-3.5 w-3.5" />
                                                        )}
                                                        <span>{t.result_url ? 'تغییر فایل' : 'آپلود جواب'}</span>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            disabled={isUploading}
                                                            onChange={(e) => {
                                                                const f = e.target.files?.[0];
                                                                if (f) handleUploadResult(t.lab_request_test_pack_id, f);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-4 text-center text-xs text-slate-400">
                                        هیچ آزمایشی برای این درخواست ثبت نشده است.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ProviderModal>
            )}

            {/* مودال تأیید لغو */}
            {toCancel && (
                <ConfirmModal
                    title="لغو درخواست"
                    description={`آیا از لغو درخواست #${toCancel.request_id} برای (${toCancel.user_name}) اطمینان دارید؟`}
                    note="با لغو درخواست، فرایند نمونه‌گیری متوقف می‌شود."
                    confirmLabel="تأیید لغو"
                    onClose={() => setCancelId(null)}
                    onConfirm={() => {
                        log('لغو درخواست آزمایش', `شناسه ${toCancel.request_id} — ${toCancel.user_name}`);
                        updateRequestStatus(toCancel.request_id, '6');
                    }}
                />
            )}
        </div>
    );
}
