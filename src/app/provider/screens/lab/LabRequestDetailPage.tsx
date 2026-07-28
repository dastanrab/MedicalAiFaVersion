import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, User, FileText, Activity, Upload, Image as ImageIcon, Trash2, CheckSquare, PlusCircle, Info, FileCheck } from 'lucide-react';
import { formatPrice } from '../../components';
import { Spinner } from '../../../components/PageLoader';
import { useProviderSession } from "../../store/providerAuthStore";

const statusLabels: Record<number, string> = {
    0: 'درخواست جدید', 1: 'در انتظار پرداخت', 2: 'در انتظار نمونه‌گیری',
    3: 'در انتظار اعلام نتیجه', 4: 'تکمیل شده', 5: 'انجام شده', 6: 'لغو شده'
};

const statusColors: Record<number, string> = {
    0: 'bg-blue-100 text-blue-700', 1: 'bg-orange-100 text-orange-700',
    2: 'bg-amber-100 text-amber-700', 3: 'bg-purple-100 text-purple-700',
    4: 'bg-green-100 text-green-700', 5: 'bg-teal-100 text-teal-700',
    6: 'bg-red-100 text-red-700'
};

interface LabRequest {
    id: number;
    code: string;
    is_assigned: boolean;
    status: number;
    type: 'home' | 'in-person';
    scheduledDate: string;
    patientName: string;
    patientPhone: string;
    prescriptionType: 'digital' | 'file' | 'none';
    prescriptionCode?: string;
    prescriptionFiles?: string[];
    tests: { test_pack_id: number; name: string; price: number; result_file?: string | null }[];
    totalPrice: number;
}

interface AvailableTest {
    lab_test_id: number;
    name: string;
    price: number;
}

export function LabRequestDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const labSession = useProviderSession('lab');

    const [request, setRequest] = useState<LabRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadingTestId, setUploadingTestId] = useState<number | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // استیت مربوط به پذیرش درخواست
    const [isAccepting, setIsAccepting] = useState(false);

    // استیت‌های مربوط به انتخاب و تخصیص آزمایش‌ها
    const [availableTests, setAvailableTests] = useState<AvailableTest[]>([]);
    const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
    const [assigning, setAssigning] = useState(false);
    const [loadingTests, setLoadingTests] = useState(false);

    const fetchRequestDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://185.222.163.113:7000/api/owner/lab/requests/${id}`, {
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.status && result.data) {
                const item = result.data;
                const dateObj = new Date(item.scheduledDate);
                const jalaliDate = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                }).format(dateObj);

                const parsedRequest: LabRequest = {
                    ...item,
                    scheduledDate: jalaliDate,
                    status: Number(item.status),
                    tests: item.tests || [],
                    is_assigned: Boolean(item.is_assigned)
                };

                setRequest(parsedRequest);

                // اگر تستی تخصیص داده نشده بود، لیست آزمایش‌های قابل انتخاب آزمایشگاه را دریافت کن
                if (parsedRequest.is_assigned && (!parsedRequest.tests || parsedRequest.tests.length === 0)) {
                    fetchAvailableTests();
                }
            } else {
                setError(result.message || 'خطا در دریافت اطلاعات');
            }
        } catch (err) {
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableTests = async () => {
        try {
            setLoadingTests(true);
            const response = await fetch(`http://185.222.163.113:7000/api/owner/lab/tests/available`, {
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                }
            });
            const result = await response.json();
            if (response.ok && result.status) {
                setAvailableTests(result.data || []);
            }
        } catch (err) {
            console.error('خطا در دریافت لیست آزمایش‌های در دسترس', err);
        } finally {
            setLoadingTests(false);
        }
    };

    useEffect(() => {
        if (id && labSession?.token) {
            fetchRequestDetails();
        }
    }, [id, labSession?.token]);

    const handleAcceptRequest = async () => {
        setIsAccepting(true);
        try {
            const response = await fetch(`http://185.222.163.113:7000/api/owner/lab/requests/${id}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                }
            });
            const result = await response.json();

            if (response.ok && result.status) {
                alert(result.message || 'درخواست با موفقیت پذیرفته شد.');
                setRequest(prev => prev ? { ...prev, is_assigned: true } : null);
                fetchAvailableTests();
            } else {
                alert(result.message || 'خطا در پذیرش درخواست');
            }
        } catch (error) {
            alert('خطا در ارتباط با سرور');
        } finally {
            setIsAccepting(false);
        }
    };

    const handleStatusChange = async (newStatus: number) => {
        if (!confirm('آیا از تغییر وضعیت این درخواست اطمینان دارید؟')) return;
        setUpdatingStatus(true);
        try {
            const response = await fetch(`http://185.222.163.113:7000/api/owner/lab/requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await response.json();
            if (response.ok && result.status) {
                setRequest(prev => prev ? { ...prev, status: newStatus } : null);
                alert('وضعیت با موفقیت تغییر کرد.');
            } else {
                alert(result.message || 'خطا در تغییر وضعیت');
            }
        } catch (error) {
            alert('خطا در ارتباط با سرور');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleUploadResult = async (testPackId: number, file: File) => {
        setUploadingTestId(testPackId);
        const formData = new FormData();
        formData.append('test_pack_id', String(testPackId));
        formData.append('file', file);

        try {
            const response = await fetch(`http://185.222.163.113:7000/api/owner/lab/requests/${id}/results`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                setRequest(prev => prev ? { ...prev, status: 4 } : null);
                fetchRequestDetails();
                console.log('done')
                alert('نتیجه با موفقیت آپلود شد.');

               // دریافت مجدد داده‌ها برای بروزرسانی لینک فایل نتیجه
            } else {
                alert(result.message || 'خطا در آپلود فایل');
            }
        } catch (error) {
            alert('خطا در ارتباط با سرور');
        } finally {
            setUploadingTestId(null);
        }
    };

    const toggleTestSelection = (testId: number) => {
        setSelectedTestIds(prev =>
            prev.includes(testId)
                ? prev.filter(id => id !== testId)
                : [...prev, testId]
        );
    };

    const handleAssignTests = async () => {
        if (selectedTestIds.length === 0) {
            alert('لطفاً حداقل یک آزمایش را انتخاب کنید.');
            return;
        }

        setAssigning(true);
        try {
            const response = await fetch(`http://185.222.163.113:7000/api/owner/lab/requests/${id}/assign-tests`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ lab_test_ids: selectedTestIds })
            });
            const result = await response.json();
            if (response.ok && result.status) {
                alert('آزمایش‌ها با موفقیت تخصیص داده شدند.');
                setSelectedTestIds([]);
                fetchRequestDetails();
            } else {
                alert(result.message || 'خطا در تخصیص آزمایش‌ها');
            }
        } catch (error) {
            alert('خطا در ارتباط با سرور');
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassignTests = async () => {
        if (!window.confirm('آیا از حذف لیست آزمایش‌ها جهت انتخاب مجدد مطمئن هستید؟')) return;

        try {
            const response = await fetch(`http://185.222.163.113:7000/api/owner/lab/requests/${id}/assign-tests`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                }
            });
            const result = await response.json();
            if (response.ok && result.status) {
                if (request?.tests) {
                    setSelectedTestIds(request.tests.map(t => t.test_pack_id));
                }
                fetchRequestDetails();
            } else {
                alert(result.message || 'خطا در حذف آزمایش‌ها');
            }
        } catch (error) {
            alert('خطا در ارتباط با سرور');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;
    if (error || !request) return <div className="p-8 text-center text-red-500">{error}</div>;

    const currentSelectionTotalPrice = availableTests
        .filter(t => selectedTestIds.includes(t.lab_test_id))
        .reduce((sum, t) => sum + Number(t.price), 0);

    return (
        <div className="space-y-6">

            {/* بنر وضعیت درخواست برای نمایش دکمه پذیرش */}
            {!request.is_assigned && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start md:items-center gap-3 text-amber-800">
                        <Info className="h-6 w-6 text-amber-600 mt-1 md:mt-0 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-base">درخواست جدید (در انتظار پذیرش)</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                این درخواست هنوز توسط آزمایشگاهی پذیرفته نشده است. برای تخصیص آزمایش و بارگذاری نتایج، ابتدا باید متصدی انجام آن شوید.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleAcceptRequest}
                        disabled={isAccepting}
                        className="shrink-0 w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isAccepting ? "در حال پردازش..." : "پذیرش این درخواست"}
                    </button>
                </div>
            )}

            {/* هدر و مدیریت وضعیت */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 transition-colors">
                        <ArrowRight className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">جزئیات درخواست {request.code}</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            وضعیت فعلی:{' '}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[request.status]}`}>
                                {statusLabels[request.status]}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">تغییر وضعیت:</span>
                    <select
                        disabled={updatingStatus || !request.is_assigned}
                        value={request.status}
                        onChange={(e) => handleStatusChange(Number(e.target.value))}
                        className="p-2 text-sm border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:bg-slate-50"
                    >
                        {Object.entries(statusLabels).map(([val, label]) => {
                            const numVal = Number(val);
                            // غیرفعال کردن وضعیت 1 (در انتظار پرداخت) اگر تستی انتخاب و ثبت نشده است
                            const isPendingPaymentDisabled = numVal === 1 && (!request.tests || request.tests.length === 0);
                            return (
                                <option key={val} value={val} disabled={isPendingPaymentDisabled}>
                                    {label} {isPendingPaymentDisabled ? '(نیازمند ثبت آزمایش)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* کارت اطلاعات بیمار */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800"><User className="h-5 w-5 text-amber-500" />اطلاعات بیمار</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">نام:</span><span className="font-medium text-slate-800">{request.patientName}</span></div>
                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">موبایل:</span><span className="font-medium text-slate-800" dir="ltr">{request.patientPhone}</span></div>
                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">تاریخ مراجعه:</span><span className="font-medium text-slate-800" dir="ltr">{request.scheduledDate}</span></div>
                        <div className="flex justify-between pt-1"><span className="text-slate-500">نوع نمونه‌گیری:</span><span className="font-medium text-slate-800">{request.type === 'home' ? 'در محل' : 'حضوری'}</span></div>
                        <div className="flex justify-between pt-1"><span className="text-slate-500">آدرس:</span><span className="font-medium text-slate-800">{request.type === 'home' ? request.address ?? '-'  : 'حضوری'}</span></div>

                    </div>
                </div>

                {/* کارت اطلاعات نسخه */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800"><FileText className="h-5 w-5 text-amber-500" />اطلاعات نسخه</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">نوع نسخه:</span>
                            <span className="font-medium text-slate-800">
                                {request.prescriptionType === 'digital' ? 'دیجیتال' : request.prescriptionType === 'file' ? 'فایل (عکس/PDF)' : 'بدون نسخه'}
                            </span>
                        </div>
                        {request.prescriptionType === 'digital' && request.prescriptionCode && (
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-500">کد رهگیری/ملی:</span>
                                <span className="font-mono tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">{request.prescriptionCode}</span>
                            </div>
                        )}

                        {request.prescriptionType === 'file' && request.prescriptionFiles && request.prescriptionFiles.length > 0 && (
                            <div className="pt-2">
                                <span className="text-slate-500 mb-3 flex items-center gap-2 font-medium">
                                    <ImageIcon className="w-4 h-4" /> فایل‌های ضمیمه شده:
                                </span>
                                <div className="flex flex-wrap gap-3">
                                    {request.prescriptionFiles.map((fileUrl, index) => (
                                        <a
                                            key={index}
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block border rounded-xl overflow-hidden hover:shadow-md transition-all relative group bg-slate-50"
                                        >
                                            <img
                                                src={fileUrl}
                                                alt={`نسخه ${index + 1}`}
                                                className="h-24 w-24 object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=PDF/File';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-medium bg-black/40 px-2 py-1 rounded">مشاهده</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* کارت مدیریت آزمایش‌ها و آپلود نتایج */}
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800"><Activity className="h-5 w-5 text-amber-500" />لیست آزمایش‌ها و نتایج</h2>

                    {!request.is_assigned ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                            <CheckSquare className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-sm font-medium">برای تخصیص آزمایش‌ها و بارگذاری نتایج، ابتدا درخواست را از کادر بالا بپذیرید.</p>
                        </div>
                    ) : (
                        (!request.tests || request.tests.length === 0) ? (
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                    هنوز آزمایشی برای این درخواست ثبت نشده است. لطفاً آزمایش‌های مربوط به این نسخه را انتخاب کنید:
                                </h3>

                                {loadingTests ? (
                                    <div className="flex justify-center p-6"><Spinner /></div>
                                ) : availableTests.length === 0 ? (
                                    <p className="text-sm text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">هیچ آزمایشی در لیست آزمایشگاه شما تعریف نشده است. ابتدا از بخش مدیریت تست‌ها، آزمایش‌های خود را تعریف کنید.</p>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4 max-h-60 overflow-y-auto p-1">
                                            {availableTests.map((test) => {
                                                const isSelected = selectedTestIds.includes(test.lab_test_id);
                                                return (
                                                    <div
                                                        key={test.lab_test_id}
                                                        onClick={() => toggleTestSelection(test.lab_test_id)}
                                                        className={`p-3 rounded-xl border text-sm cursor-pointer transition-all flex items-center justify-between ${
                                                            isSelected ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}}
                                                                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                                                            />
                                                            <span className="font-medium text-slate-700 truncate" title={test.name}>{test.name}</span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-500 shrink-0">{formatPrice(Number(test.price))} تومان</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                                            <div className="text-sm">
                                                <span className="text-slate-500">تعداد انتخاب شده: </span>
                                                <span className="font-bold text-slate-800">{selectedTestIds.length} مورد</span>
                                                <span className="mx-2 text-slate-300">|</span>
                                                <span className="text-slate-500">جمع مبلغ: </span>
                                                <span className="font-bold text-amber-600 text-base">{formatPrice(currentSelectionTotalPrice)} تومان</span>
                                            </div>
                                            <button
                                                onClick={handleAssignTests}
                                                disabled={assigning || selectedTestIds.length === 0}
                                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                {assigning ? 'در حال ثبت...' : 'ثبت و تخصیص آزمایش‌ها'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 text-right rounded-r-lg font-medium">نام آزمایش</th>
                                        <th className="px-4 py-3 text-left font-medium">هزینه (تومان)</th>
                                        <th className="px-4 py-3 text-center rounded-l-lg font-medium">نتیجه و آپلود</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {request.tests.map((test, index) => (
                                        <tr key={index} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3.5 font-medium text-slate-800">{test.name}</td>
                                            <td className="px-4 py-3.5 text-left text-slate-600 font-mono">{formatPrice(test.price)}</td>
                                            <td className="px-4 py-3.5 flex items-center justify-center gap-2">
                                                {/* اگر فایلی وجود داشته باشد دکمه مشاهده نتیجه نمایش داده میشود */}
                                                {test.result_file && (
                                                    <a
                                                        href={test.result_file}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-green-50 px-3.5 py-2 text-xs font-medium text-green-600 hover:bg-green-100 transition-colors shadow-sm"
                                                    >
                                                        <FileCheck className="h-4 w-4" />
                                                        مشاهده نتیجه
                                                    </a>
                                                )}

                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors shadow-sm">
                                                    {uploadingTestId === test.test_pack_id ? (
                                                        <span>در حال آپلود...</span>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-4 w-4" />
                                                            {test.result_file ? 'تغییر فایل' : 'آپلود فایل'}
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleUploadResult(test.test_pack_id, file);
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                <div className="mt-4 flex flex-wrap justify-between items-center gap-4 px-2 border-t border-slate-100 pt-4">
                                    <button
                                        onClick={handleUnassignTests}
                                        className="text-xs text-red-600 flex items-center gap-1.5 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-red-200"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                        <span className="font-medium">انتخاب مجدد آزمایش‌ها (حذف لیست فعلی)</span>
                                    </button>

                                    <div className="font-bold text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
                                        <span className="text-slate-500 font-normal ml-2">جمع کل:</span>
                                        {formatPrice(request.totalPrice)} <span className="text-xs font-normal text-slate-500">تومان</span>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
