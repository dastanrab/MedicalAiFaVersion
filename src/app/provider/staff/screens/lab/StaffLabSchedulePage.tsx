import { useEffect, useState, useCallback, useRef } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Home,
    Loader2,
    RefreshCw,
    X,
    Phone,
    User,
    Navigation,
    Upload,
    FileCheck2,
    CheckCircle2,
    FlaskConical,
} from 'lucide-react';
import { PageHeader, StatusBadge } from '../../../components';
import { showProviderError, showProviderSuccess } from '../../../utils/toast';
import {
    ALLOWED_RESULT_EXTENSIONS,
    ALLOWED_RESULT_MIME_TYPES,
    MAX_RESULT_FILE_SIZE_BYTES,
} from '../../../utils/validation';
import { useStaffSession, useStaffActivityLogger } from '../../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

export interface ScheduleItem {
    id: number;
    patientName: string;
    date: string;
    time: string;
    type: 'home' | 'lab';
    address?: string | null;
    status: string;
}

interface DetailedLabTest {
    lab_request_test_pack_id: number;
    test_pack_id: number;
    name: string;
    price: number;
    result_url?: string | null;
}

interface DetailedLabRequest {
    request_id: number;
    status: number;
    visit_type: number;
    total_price: number;
    created_at: string;
    patient: {
        name: string;
        phone: string;
        national_code?: string;
    };
    location?: {
        address?: string;
        lat?: number | string | null;
        lng?: number | string | null;
    } | null;
    tests: DetailedLabTest[];
}

const STATUS_OPTIONS = [
    { value: 1, label: 'جدید / در انتظار' },
    { value: 2, label: 'تایید شده (آماده)' },
    { value: 3, label: 'در حال نمونه‌گیری' },
    { value: 4, label: 'تکمیل (جواب آماده)' },
    { value: 5, label: 'لغو شده' },
];

export function StaffLabSchedulePage() {
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const session = useStaffSession('lab');
    const log = useStaffActivityLogger('lab');

    const STAFF_AUTH_TOKEN = `Bearer ${session.token}`;

    // استیت‌های مودال و عملیات
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detail, setDetail] = useState<DetailedLabRequest | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // استیت‌های آپلود و دانلود
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingPackId, setUploadingPackId] = useState<number | null>(null);
    const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

    // ۱. دریافت لیست برنامه زمان‌بندی
    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/staff/lab/schedule`, {
                headers: {
                    'Authorization': STAFF_AUTH_TOKEN,
                    'Accept': 'application/json',
                },
            });
            const result = await response.json();
            if (response.ok && result.data) {
                setSchedules(result.data);
            } else {
                setSchedules([]);
            }
        } catch {
            showProviderError('خطا در دریافت برنامه زمان‌بندی');
        } finally {
            setLoading(false);
        }
    }, [STAFF_AUTH_TOKEN]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // ۲. دریافت جزئیات یک درخواست خاص
    const openRequestDetail = async (id: number) => {
        setSelectedId(id);
        setDetail(null);
        setDetailLoading(true);
        try {
            const response = await fetch(`${API_BASE}/staff/lab/requests/${id}`, {
                headers: {
                    'Authorization': STAFF_AUTH_TOKEN,
                    'Accept': 'application/json',
                },
            });
            const result = await response.json();
            if (response.ok && result.data) {
                setDetail(result.data);
            } else {
                showProviderError(result.message || 'خطا در دریافت جزئیات درخواست');
                setSelectedId(null);
            }
        } catch {
            showProviderError('خطا در ارتباط با سرور');
            setSelectedId(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedId(null);
        setDetail(null);
        setUploadingPackId(null);
    };

    // ۳. تغییر وضعیت درخواست
    const handleStatusChange = async (newStatus: number) => {
        if (!detail) return;
        setUpdatingStatus(true);
        try {
            const response = await fetch(`${API_BASE}/staff/lab/requests/${detail.request_id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': STAFF_AUTH_TOKEN,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const result = await response.json();
            if (response.ok) {
                showProviderSuccess('وضعیت درخواست با موفقیت بروزرسانی شد');
                log('تغییر وضعیت از برنامه زمان‌بندی', `#${detail.request_id} به وضعیت ${newStatus}`);
                setDetail({ ...detail, status: newStatus });
                fetchSchedules();
            } else {
                showProviderError(result.message || 'خطا در تغییر وضعیت');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط با سرور');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // ۴. شروع آپلود برای پکیج مشخص
    const triggerFileUpload = (testPackId: number) => {
        setUploadingPackId(testPackId);
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 50);
    };

    // ۵. آپلود فایل نتیجه
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !detail || !uploadingPackId) return;

        if (ALLOWED_RESULT_MIME_TYPES.length > 0 && !ALLOWED_RESULT_MIME_TYPES.includes(file.type)) {
            showProviderError('فقط فایل PDF یا تصویر مجاز است');
            setUploadingPackId(null);
            return;
        }
        if (file.size > MAX_RESULT_FILE_SIZE_BYTES) {
            showProviderError('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
            setUploadingPackId(null);
            return;
        }

        const formData = new FormData();
        formData.append('lab_request_test_pack_id', String(uploadingPackId));
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}/staff/lab/requests/${detail.request_id}/results`, {
                method: 'POST',
                headers: {
                    'Authorization': STAFF_AUTH_TOKEN,
                    'Accept': 'application/json',
                },
                body: formData,
            });
            const result = await response.json();

            if (response.ok) {
                showProviderSuccess('فایل نتیجه با موفقیت بارگذاری شد');
                log('آپلود جواب از برنامه زمان‌بندی', `#${detail.request_id} — ${detail.patient.name}`);
                await openRequestDetail(detail.request_id);
                fetchSchedules();
            } else {
                showProviderError(result.message || 'خطا در بارگذاری فایل نتیجه');
            }
        } catch {
            showProviderError('خطا در ارتباط با سرور هنگام آپلود');
        } finally {
            setUploadingPackId(null);
        }
    };

    // ۶. مشاهده و دانلود فایل نتیجه
    const handleDownloadResult = async (url: string) => {
        setDownloadingUrl(url);
        try {
            const res = await fetch(url, {
                headers: { 'Authorization': STAFF_AUTH_TOKEN },
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch {
            showProviderError('خطا در دریافت فایل نتیجه');
        } finally {
            setDownloadingUrl(null);
        }
    };

    // گروه‌بندی بر اساس تاریخ شمسی
    const grouped = schedules.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {} as Record<string, ScheduleItem[]>);

    const sortedDates = Object.keys(grouped).sort();
    const todayStr = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
        .format(new Date())
        .replace(/([۰-۹])/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728));

    const getStatusStyle = (statusStr: string) => {
        switch (statusStr) {
            case 'جدید':
                return 'bg-blue-100 text-blue-700';
            case 'تایید شده':
                return 'bg-emerald-100 text-emerald-700';
            case 'در حال نمونه‌گیری':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 text-right font-[YekanBakhFaNum] pb-6 sm:pb-0" dir="rtl">
            {/* هدر صفحه */}
            <div className="flex items-center justify-between gap-2">
                <PageHeader
                    title="برنامه زمان‌بندی نمونه‌گیری"
                    description="لیست مراجعات و نمونه‌گیری‌های ارجاع شده به شما"
                />
                <button
                    type="button"
                    onClick={fetchSchedules}
                    disabled={loading}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs disabled:opacity-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-amber-500' : 'text-slate-500'}`} />
                    <span className="hidden sm:inline">به‌روزرسانی</span>
                </button>
            </div>

            {/* فایل اینپوت مخفی */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_RESULT_EXTENSIONS.join(',')}
                className="hidden"
                onChange={handleFileSelected}
            />

            {loading ? (
                <div className="flex h-56 sm:h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-2xs">
                    <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-amber-500" />
                </div>
            ) : schedules.length === 0 ? (
                <div className="flex h-56 sm:h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center shadow-2xs">
                    <CalendarIcon className="h-9 w-9 text-slate-300 mb-2.5" />
                    <p className="text-xs sm:text-sm font-semibold text-slate-500">برنامه‌ای برای نمایش وجود ندارد.</p>
                </div>
            ) : (
                <div className="space-y-6 sm:space-y-8">
                    {sortedDates.map((date) => {
                        const isToday = date === todayStr || date.replace(/\//g, '') === todayStr.replace(/\//g, '');

                        return (
                            <div key={date} className="relative">
                                {/* عنوان هر تاریخ */}
                                <div className="mb-3 sm:mb-4 flex items-center gap-2.5">
                                    <div
                                        className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-2xs ${
                                            isToday
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}
                                    >
                                        <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className={`text-base sm:text-lg font-bold ${isToday ? 'text-amber-600' : 'text-slate-800'}`}>
                                                {date}
                                            </h3>
                                            {isToday && (
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                    امروز
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            {grouped[date].length} مورد نمونه‌گیری / مراجعه
                                        </p>
                                    </div>
                                </div>

                                {/* شبکه کارت‌ها */}
                                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {grouped[date].map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => openRequestDetail(item.id)}
                                            role="button"
                                            tabIndex={0}
                                            className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:border-amber-300 active:scale-[0.99] transition-all"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                                                        {item.patientName}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] font-mono text-slate-400">
                                                        شناسه: #{item.id}
                                                    </p>
                                                </div>
                                                <StatusBadge label={item.status} className={getStatusStyle(item.status)} />
                                            </div>

                                            <div className="mt-2 space-y-2 rounded-xl bg-slate-50/80 p-2.5 sm:p-3">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                                    <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                                    <span>{item.time}</span>
                                                </div>

                                                <div className="flex items-start gap-2 text-xs text-slate-600">
                                                    {item.type === 'home' ? (
                                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                                                    ) : (
                                                        <Home className="h-3.5 w-3.5 shrink-0 text-sky-500 mt-0.5" />
                                                    )}
                                                    <span className="leading-snug line-clamp-2">
                                                        {item.type === 'home'
                                                            ? item.address || 'آدرس ثبت نشده'
                                                            : 'مراجعه حضوری به آزمایشگاه'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* مودال واکنش‌گرا (Bottom Sheet در موبایل و Modal در دسکتاپ) */}
            {selectedId !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-2xs p-0 sm:p-4 animate-in fade-in duration-200"
                    onClick={closeModal}
                >
                    <div
                        className="relative max-h-[92vh] sm:max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* هندل مخصوص تاچ در موبایل */}
                        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 sm:hidden -mt-1 mb-2" />

                        {/* هدر مودال */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                                    جزئیات پرونده #{selectedId}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                                    مشخصات بیمار، تغییر وضعیت و بارگذاری جواب
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {detailLoading || !detail ? (
                            <div className="flex h-52 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-5">
                                {/* مشخصات بیمار */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">نام بیمار</p>
                                            <p className="text-xs sm:text-sm font-bold text-slate-800">{detail.patient.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">شماره تماس</p>
                                            <a
                                                href={`tel:${detail.patient.phone}`}
                                                className="text-xs sm:text-sm font-bold text-indigo-600 hover:underline"
                                                dir="ltr"
                                            >
                                                {detail.patient.phone}
                                            </a>
                                        </div>
                                    </div>

                                    {detail.patient.national_code && (
                                        <div className="sm:col-span-2 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                                            <span className="text-slate-400 text-[11px]">کد ملی مراجع:</span>
                                            <span className="font-mono font-bold text-slate-800">{detail.patient.national_code}</span>
                                        </div>
                                    )}
                                </div>

                                {/* آدرس و دکمه مسیریابی نشان */}
                                {detail.visit_type === 1 && detail.location && (
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 space-y-3">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-emerald-950">آدرس نمونه‌گیری در منزل:</p>
                                                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                                                    {detail.location.address || 'آدرس متنی ثبت نشده است'}
                                                </p>
                                            </div>
                                        </div>

                                        {detail.location.lat && detail.location.lng && (
                                            <a
                                                href={`https://neshan.org/maps/@${detail.location.lat},${detail.location.lng},16z`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-500 active:scale-95 transition"
                                            >
                                                <Navigation className="h-3.5 w-3.5" />
                                                <span>مسیریابی با نشان</span>
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* تغییر وضعیت درخواست */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        تغییر وضعیت نوبت:
                                    </label>
                                    <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap">
                                        {STATUS_OPTIONS.map((opt) => {
                                            const active = detail.status === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    disabled={updatingStatus || active}
                                                    onClick={() => handleStatusChange(opt.value)}
                                                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                                                        active
                                                            ? 'bg-amber-500 text-white shadow-2xs'
                                                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                    } disabled:opacity-60`}
                                                >
                                                    {active && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                                                    <span>{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* لیست تست‌ها و آپلود فایل جواب */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-1.5">
                                        <FlaskConical className="h-4 w-4 text-amber-500" />
                                        <h4 className="text-xs font-bold text-slate-700">
                                            آزمایش‌ها و فایل جواب ({detail.tests.length})
                                        </h4>
                                    </div>

                                    {detail.tests.length === 0 ? (
                                        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
                                            آزمایشی در این درخواست ثبت نشده است.
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                                            {detail.tests.map((test) => {
                                                const packId = test.lab_request_test_pack_id || test.test_pack_id;
                                                const isUploadingThis = uploadingPackId === packId;

                                                return (
                                                    <div
                                                        key={packId}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-slate-50/50 transition"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{test.name}</p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                مبلغ: {Number(test.price || 0).toLocaleString('fa-IR')} تومان
                                                            </p>
                                                        </div>

                                                        {/* دکمه‌های عملیات آپلود و مشاهده جواب */}
                                                        <div className="flex items-center gap-2 pt-1 sm:pt-0">
                                                            {test.result_url && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDownloadResult(test.result_url!)}
                                                                    disabled={downloadingUrl === test.result_url}
                                                                    className="flex flex-1 sm:flex-initial items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition"
                                                                >
                                                                    {downloadingUrl === test.result_url ? (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    ) : (
                                                                        <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                                                                    )}
                                                                    <span>مشاهده جواب</span>
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => triggerFileUpload(packId)}
                                                                disabled={isUploadingThis}
                                                                className="flex flex-1 sm:flex-initial items-center justify-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 active:scale-95 transition shadow-2xs disabled:opacity-50"
                                                            >
                                                                {isUploadingThis ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <Upload className="h-3.5 w-3.5" />
                                                                )}
                                                                <span>
                                                                    {test.result_url ? 'جایگزینی جواب' : 'آپلود جواب'}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
