import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { FileCheck2, ShieldCheck, Upload, Loader2, RefreshCw, X, FlaskConical, Calendar } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge } from '../../../components';
import { showProviderError, showProviderSuccess } from '../../../utils/toast';
import {
    ALLOWED_RESULT_EXTENSIONS,
    ALLOWED_RESULT_MIME_TYPES,
    MAX_RESULT_FILE_SIZE_BYTES,
} from '../../../utils/validation';
import { staffLabStatusLabels, staffLabStatusStyles } from '../../config/staffStatusOptions';
import { useStaffActivityLogger, useStaffSession } from '../../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

interface ApiTestPack {
    lab_request_test_pack_id?: number;
    test_pack_id: number;
    test_name: string;
    result_id?: number | null;
    result_url?: string | null;
}

interface ApiLabRequestItem {
    request_id: number;
    visit_type: number;
    request_status: number;
    total_price: number;
    request_date: string;
    user_name: string;
    user_phone: string;
    tests?: ApiTestPack[];
    resultFileName?: string;
    resultId?: number;
}

export function StaffLabResultsPage() {
    const log = useStaffActivityLogger('lab');
    const fileInput = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<ApiLabRequestItem[]>([]);
    const [targetRequest, setTargetRequest] = useState<ApiLabRequestItem | null>(null);
    const [targetTestPackId, setTargetTestPackId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const session = useStaffSession('lab');
    const STAFF_AUTH_TOKEN = `Bearer ${session.token}` ;

    // واکشی لیست درخواست‌های ارجاع شده به کارمند
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/staff/lab/requests`, {
                headers: {
                    'Authorization': STAFF_AUTH_TOKEN,
                    'Accept': 'application/json',
                },
            });
            const result = await response.json();
            if (response.ok && result.data) {
                setRequests(result.data);
            } else {
                setRequests([]);
            }
        } catch {
            showProviderError('خطا در دریافت لیست آزمایش‌ها');
        } finally {
            setLoading(false);
        }
    }, [STAFF_AUTH_TOKEN]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // تفکیک به «در انتظار آپلود»
    const pending = useMemo(() => {
        return requests.filter((r) => r.request_status !== 4 && r.request_status !== 5);
    }, [requests]);

    // تفکیک به «آپلود شده / تکمیل شده»
    const uploaded = useMemo(() => {
        return requests.filter((r) => r.request_status === 4 || r.request_status === 5);
    }, [requests]);

    // مرحله ۱ انتخاب درخواست برای آپلود فایل
    const pickFile = async (req: ApiLabRequestItem) => {
        try {
            const detailRes = await fetch(`${API_BASE}/staff/lab/requests/${req.request_id}`, {
                headers: {
                    'Authorization': STAFF_AUTH_TOKEN,
                    'Accept': 'application/json',
                },
            });
            const detailData = await detailRes.json();
            if (detailRes.ok && detailData.data?.tests?.length > 0) {
                const detailedTests = detailData.data.tests;
                req.tests = detailedTests.map((t: any) => ({
                    lab_request_test_pack_id: t.lab_request_test_pack_id,
                    test_pack_id: t.test_pack_id,
                    test_name: t.name,
                    result_url: t.result_url,
                }));
            }
        } catch {
            // نادیده گرفتن خطا و ادامه روند با داده‌های موجود
        }

        setTargetRequest(req);

        const firstPackId = req.tests?.[0]?.lab_request_test_pack_id;
        if (req.tests && req.tests.length === 1 && firstPackId) {
            setTargetTestPackId(firstPackId);
            fileInput.current?.click();
        } else if (!req.tests || req.tests.length === 0) {
            setTargetTestPackId(req.request_id);
            fileInput.current?.click();
        }
    };

    const proceedWithTestPack = (packId: number) => {
        setTargetTestPackId(packId);
        setTimeout(() => {
            fileInput.current?.click();
        }, 50);
    };

    // ارسال فایل انتخاب‌شده به سرور
    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !targetRequest) return;

        if (ALLOWED_RESULT_MIME_TYPES.length > 0 && !ALLOWED_RESULT_MIME_TYPES.includes(file.type)) {
            showProviderError('فقط فایل PDF یا تصویر مجاز است');
            return;
        }
        if (file.size > MAX_RESULT_FILE_SIZE_BYTES) {
            showProviderError('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
            return;
        }

        const formData = new FormData();
        formData.append(
            'lab_request_test_pack_id',
            String(targetTestPackId || targetRequest.tests?.[0]?.lab_request_test_pack_id || targetRequest.request_id)
        );
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await fetch(`${API_BASE}/staff/lab/requests/${targetRequest.request_id}/results`, {
                method: 'POST',
                headers: {
                    'Authorization': STAFF_AUTH_TOKEN,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                log('آپلود فایل جواب', `#${targetRequest.request_id} — ${targetRequest.user_name}`);
                showProviderSuccess('فایل جواب با موفقیت آپلود شد');
                fetchRequests();
            } else {
                showProviderError(result.message || 'خطا در آپلود فایل جواب');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط با سرور هنگام آپلود');
        } finally {
            setUploading(false);
            setTargetRequest(null);
            setTargetTestPackId(null);
        }
    };

    // دانلود و مشاهده فایل نتیجه ذخیره شده
    const handleDownloadResult = async (requestId: number) => {
        setDownloadingId(requestId);
        try {
            const res = await fetch(`${API_BASE}/staff/lab/requests/${requestId}`, {
                headers: {
                    'Authorization': STAFF_AUTH_TOKEN,
                    'Accept': 'application/json',
                },
            });
            const json = await res.json();
            const tests = json.data?.tests || [];
            const resultUrl = tests.find((t: any) => t.result_url)?.result_url;

            if (!resultUrl) {
                showProviderError('فایل نتیجه‌ای یافت نشد');
                return;
            }

            const downloadRes = await fetch(resultUrl, {
                headers: { 'Authorization': STAFF_AUTH_TOKEN },
            });
            if (!downloadRes.ok) throw new Error();

            const blob = await downloadRes.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch {
            showProviderError('خطا در بارگیری فایل جواب');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 text-right font-[YekanBakhFaNum]" dir="rtl">
            {/* هدر صفحه و دکمه به‌روزرسانی */}
            <div className="flex items-center justify-between gap-2">
                <PageHeader title="آپلود جواب آزمایش" description="ثبت فایل جواب جهت بررسی و تأیید نهایی مسئول فنی" />
                <button
                    type="button"
                    onClick={fetchRequests}
                    disabled={loading}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition disabled:opacity-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                    <span className="hidden sm:inline">به‌روزرسانی</span>
                </button>
            </div>

            {/* اعلان امنیتی */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 sm:p-4 text-xs text-amber-900 leading-relaxed">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>
                    پس از آپلود، فایل جواب صرفاً جهت تأیید مسئول فنی آزمایشگاه ارسال می‌شود و تنها پس از تأیید ایشان برای مراجع در دسترس خواهد بود.
                </span>
            </div>

            {/* ورودی پنهان فایل */}
            <input
                ref={fileInput}
                type="file"
                accept={ALLOWED_RESULT_EXTENSIONS.join(',')}
                className="hidden"
                onChange={onFile}
            />

            {loading ? (
                <div className="flex h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="space-y-5 sm:space-y-6">
                    {/* بخش اول: در انتظار آپلود */}
                    <section className="space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                در انتظار آپلود جواب
                                <span className="text-[11px] font-medium text-slate-400">({pending.length})</span>
                            </h3>
                        </div>

                        {pending.length === 0 ? (
                            <EmptyState message="درخواستی در انتظار آپلود جواب نیست." />
                        ) : (
                            <ResultList
                                rows={pending}
                                action={(r) => (
                                    <button
                                        type="button"
                                        onClick={() => pickFile(r)}
                                        disabled={uploading}
                                        className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-600 active:scale-95 transition disabled:opacity-50"
                                    >
                                        {uploading && targetRequest?.request_id === r.request_id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Upload className="h-3.5 w-3.5" />
                                        )}
                                        <span>آپلود فایل جواب</span>
                                    </button>
                                )}
                            />
                        )}
                    </section>

                    {/* بخش دوم: آپلود شده‌ها */}
                    <section className="space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                فایل‌های آپلود شده
                                <span className="text-[11px] font-medium text-slate-400">({uploaded.length})</span>
                            </h3>
                        </div>

                        {uploaded.length === 0 ? (
                            <EmptyState message="هنوز فایلی آپلود نشده است." />
                        ) : (
                            <ResultList
                                rows={uploaded}
                                action={(r) => (
                                    <button
                                        type="button"
                                        onClick={() => handleDownloadResult(r.request_id)}
                                        disabled={downloadingId === r.request_id}
                                        className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition disabled:opacity-50"
                                    >
                                        {downloadingId === r.request_id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                                        ) : (
                                            <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                                        )}
                                        <span>مشاهده فایل نتیجه</span>
                                    </button>
                                )}
                            />
                        )}
                    </section>
                </div>
            )}

            {/* مودال انتخاب تست (برای درخواست‌های با بیش از یک تست) */}
            {targetRequest && targetRequest.tests && targetRequest.tests.length > 1 && !targetTestPackId && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-2xs p-0 sm:p-4">
                    <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">انتخاب تست جهت آپلود جواب</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">درخواست #{targetRequest.request_id} ({targetRequest.user_name})</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTargetRequest(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            این پرونده شامل چند تست مجزاست. لطفاً مشخص کنید فایل مورد نظر مربوط به کدام تست است:
                        </p>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-0.5">
                            {targetRequest.tests.map((test) => (
                                <button
                                    key={test.lab_request_test_pack_id || test.test_pack_id}
                                    type="button"
                                    onClick={() => proceedWithTestPack(test.lab_request_test_pack_id || test.test_pack_id)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-amber-50/80 hover:border-amber-300 text-xs font-semibold text-slate-800 transition active:scale-[0.99] text-right"
                                >
                                    <div className="flex items-center gap-2">
                                        <FlaskConical className="h-4 w-4 text-amber-500 shrink-0" />
                                        <span>{test.test_name}</span>
                                    </div>
                                    <Upload className="h-4 w-4 text-slate-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/** کامپوننت مشترک نمایش لیست (کارت در موبایل و جدول در دسکتاپ) */
function ResultList({
                        rows,
                        action,
                    }: {
    rows: ApiLabRequestItem[];
    action: (r: ApiLabRequestItem) => React.ReactNode;
}) {
    return (
        <div>
            {/* 📱 حالت موبایل: کارت‌های تعاملی و سبک */}
            <div className="space-y-2.5 sm:hidden">
                {rows.map((r) => {
                    const statusKey = String(r.request_status);
                    const testNames =
                        r.tests && r.tests.length > 0
                            ? r.tests.map((t) => t.test_name).join('، ')
                            : 'نسخه بدون پکیج / نسخه پزشک';

                    return (
                        <div
                            key={r.request_id}
                            className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-3"
                        >
                            {/* سطر بالا: کد پرونده و نشان وضعیت */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                        #{r.request_id}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800">{r.user_name}</span>
                                </div>
                                <StatusBadge
                                    label={staffLabStatusLabels[statusKey] || `وضعیت ${statusKey}`}
                                    className={staffLabStatusStyles[statusKey] || 'bg-slate-100 text-slate-700'}
                                />
                            </div>

                            {/* جزئیات آزمایش */}
                            <div className="rounded-xl bg-slate-50/80 p-2.5 text-xs space-y-1">
                                <span className="font-semibold text-slate-500 block text-[11px]">آزمایش‌ها:</span>
                                <p className="text-slate-700 font-medium leading-relaxed" dir="rtl">
                                    {testNames}
                                </p>
                            </div>

                            {/* اکشن کارت در موبایل */}
                            <div className="pt-1">{action(r)}</div>
                        </div>
                    );
                })}
            </div>

            {/* 💻 حالت دسکتاپ و تبلت: جدول کامل */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-100">
                    <tr>
                        <th className="px-4 py-3 text-right font-semibold">کد</th>
                        <th className="px-4 py-3 text-right font-semibold">بیمار</th>
                        <th className="px-4 py-3 text-right font-semibold">آزمایش‌ها</th>
                        <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                        <th className="px-4 py-3 text-left font-semibold">عملیات</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {rows.map((r) => {
                        const statusKey = String(r.request_status);
                        const testNames =
                            r.tests && r.tests.length > 0
                                ? r.tests.map((t) => t.test_name).join('، ')
                                : 'نسخه بدون پکیج / نسخه پزشک';

                        return (
                            <tr key={r.request_id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-500">#{r.request_id}</td>
                                <td className="px-4 py-3.5 font-medium text-slate-800">{r.user_name}</td>
                                <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate text-xs" dir="rtl">
                                    {testNames}
                                </td>
                                <td className="px-4 py-3.5">
                                    <StatusBadge
                                        label={staffLabStatusLabels[statusKey] || `وضعیت ${statusKey}`}
                                        className={staffLabStatusStyles[statusKey] || 'bg-slate-100 text-slate-700'}
                                    />
                                </td>
                                <td className="px-4 py-3.5 text-left">{action(r)}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
