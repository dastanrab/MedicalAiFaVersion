import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, User, Calendar, FileText, Activity } from 'lucide-react';
// فرض بر این است که توکن از استوری مثل useLabAuthStore دریافت می‌شود
import { formatPrice } from '../../components';
import { labStatusLabels, labStatusStyles } from '../../config/statusOptions';
import {useProviderSession} from "../../store/providerAuthStore";

// تعریف تایپ (Interface) برای درخواست
interface LabRequest {
    id: number;
    code: string;
    status: 'pending' | 'completed' | 'canceled';
    type: 'home' | 'in-person';
    scheduledDate: string;
    patientName: string;
    patientPhone: string;
    prescriptionType: 'digital' | 'file' | 'none';
    prescriptionCode?: string;
    prescriptionFiles?: string[];
    tests: { name: string; price: number }[];
    totalPrice: number;
}

export function LabRequestDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // دریافت اطلاعات نشست کاربری برای ارسال توکن
    const labSession = useProviderSession('lab');

    // تعریف State ها
    const [request, setRequest] = useState<LabRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

                    // تبدیل تاریخ میلادی به شمسی
                    const dateObj = new Date(item.scheduledDate);
                    const jalaliDate = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(dateObj);

                    // مپ کردن وضعیت‌های عددی بک‌اند به رشته‌های فرانت‌اند
                    const statusMap: Record<number, 'pending' | 'completed' | 'canceled'> = {
                        0: 'pending',
                        1: 'completed', // یا confirmed بر اساس تنظیمات شما
                        2: 'canceled'   // یا rejected
                    };

                    setRequest({
                        ...item,
                        scheduledDate: jalaliDate,
                        status: statusMap[item.status] || 'pending'
                    });
                } else {
                    setError(result.message || 'خطا در دریافت اطلاعات');
                }
            } catch (err) {
                setError('خطا در ارتباط با سرور');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRequestDetails();
        }
    }, [id, labSession?.token]);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                در حال بارگذاری اطلاعات...
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error || 'درخواست مورد نظر یافت نشد.'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-amber-600 hover:underline"
                >
                    بازگشت
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
                >
                    <ArrowRight className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        جزئیات درخواست {request.code}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        وضعیت فعلی:{' '}
                        <span className={`font-medium ${labStatusStyles[request.status]}`}>
                            {labStatusLabels[request.status]}
                        </span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* اطلاعات بیمار */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                        <User className="h-5 w-5 text-amber-500" />
                        اطلاعات بیمار
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">نام و نام خانوادگی:</span>
                            <span className="font-medium text-slate-800">{request.patientName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">شماره تماس:</span>
                            <span className="font-medium text-slate-800" dir="ltr">{request.patientPhone}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">تاریخ درخواست:</span>
                            <span className="font-medium text-slate-800" dir="ltr">{request.scheduledDate}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-slate-500">نوع مراجعه:</span>
                            <span className="font-medium text-slate-800">
                                {request.type === 'home' ? 'در منزل' : 'حضوری'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* اطلاعات نسخه */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                        <FileText className="h-5 w-5 text-amber-500" />
                        اطلاعات نسخه
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">نوع نسخه:</span>
                            <span className="font-medium text-slate-800">
                                {request.prescriptionType === 'digital' ? 'نسخه دیجیتال' :
                                    request.prescriptionType === 'file' ? 'تصویر نسخه' : 'بدون نسخه'}
                            </span>
                        </div>

                        {request.prescriptionType === 'digital' && request.prescriptionCode && (
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">کد پیگیری نسخه:</span>
                                <span className="font-medium text-slate-800 font-mono tracking-wider">
                                    {request.prescriptionCode}
                                </span>
                            </div>
                        )}

                        {request.prescriptionType === 'file' && request.prescriptionFiles && request.prescriptionFiles.length > 0 && (
                            <div className="pt-2">
                                <span className="text-slate-500 mb-2 block">فایل‌های پیوست:</span>
                                <div className="flex flex-wrap gap-2">
                                    {request.prescriptionFiles.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={`http://185.222.163.113:7000${file}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                                        >
                                            <FileText className="h-4 w-4" />
                                            مشاهده فایل {idx + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* لیست آزمایش‌ها */}
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                        <Activity className="h-5 w-5 text-amber-500" />
                        لیست آزمایش‌های درخواستی
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-2 text-right font-semibold rounded-r-lg">ردیف</th>
                                <th className="px-4 py-2 text-right font-semibold">نام آزمایش / پکیج</th>
                                <th className="px-4 py-2 text-left font-semibold rounded-l-lg">هزینه (تومان)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {request.tests.map((test, index) => (
                                <tr key={index} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{test.name}</td>
                                    <td className="px-4 py-3 text-left">{formatPrice(test.price)}</td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50">
                                <td colSpan={2} className="px-4 py-3 text-left font-bold text-slate-800 rounded-r-lg">مجموع:</td>
                                <td className="px-4 py-3 text-left font-bold text-amber-600 rounded-l-lg">
                                    {formatPrice(request.totalPrice)}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
