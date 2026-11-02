import React, { useEffect, useState } from 'react';
import {
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    Clock,
    XCircle,
    FileText,
    Loader2,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDoctorAuthStore } from '../store/doctorAuthStore';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // ۱۰ مگابایت

interface ExistingDoc {
    exists: boolean;
    type: 'image' | 'pdf' | null;
    download_url: string | null;
}

// به‌روزرسانی اینترفیس StatusResponse برای شامل کردن کد ملی و کد نظام پزشکی
interface StatusResponse {
    status: 'not_uploaded' | 'pending' | 'approved' | 'rejected';
    national_code?: string | null; // کد ملی از بک‌اند
    medical_code?: string | null;   // کد نظام پزشکی از بک‌اند
    rejection_reason?: string | null;
    documents?: {
        national_card: ExistingDoc;
        medical_council_card: ExistingDoc;
        clinic_license: ExistingDoc;
    };
}

export function DoctorDocumentsUploadPage() {
    const navigate = useNavigate();
    const { token, fetchProfile, setProfile } = useDoctorAuthStore();

    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [docStatus, setDocStatus] = useState<StatusResponse['status']>('not_uploaded');
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [serverDocs, setServerDocs] = useState<StatusResponse['documents'] | null>(null);

    // state های جدید برای نگهداری کد ملی و کد نظام پزشکی
    const [loadedNationalCode, setLoadedNationalCode] = useState('');
    const [loadedMedicalCode, setLoadedMedicalCode] = useState('');
    const [nationalCode, setNationalCode] = useState('');
    const [medicalCode, setMedicalCode] = useState('');
    // فیلدهای متنی برای آپلود جدید
    const [nationalCard, setNationalCard] = useState<File | null>(null);
    const [medicalCouncilCard, setMedicalCouncilCard] = useState<File | null>(null);
    const [clinicLicense, setClinicLicense] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // مشکل سینتکسی در نام متغیر: GAPGPTMASKTOKEN8gysx9bgg94X0X
    // اصلاح شده به authHeader
    const authHeader = token ? `Bearer ${token}` : '';

    // دریافت وضعیت مدارک از سرور
    const fetchDocumentsStatus = async () => {
        try {
            setIsLoadingStatus(true);
            const res = await fetch('https://api.mediraai.com/api/doctor/documents/status', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': authHeader,
                }
            });

            if (!res.ok) throw new Error('خطا در دریافت وضعیت مدارک');

            const data: StatusResponse = await res.json();

            setDocStatus(data.status);
            setRejectionReason(data.rejection_reason || null);
            setServerDocs(data.documents || null);

            // **مقداردهی state های جدید با داده‌های دریافت شده**
            setLoadedNationalCode(data.national_code || '');
            setLoadedMedicalCode(data.medical_code || '');

            // بروزرسانی وضعیت در zustand
            setProfile({ document_status: data.status });

            // در صورت تایید نهایی، انتقال مستقیم به داشبورد
            if (data.status === 'approved') {
                await fetchProfile();
                navigate('/provider/doctor/dashboard', { replace: true });
            }
        } catch (err) {
            console.error('Error fetching document status:', err);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    useEffect(() => {
        fetchDocumentsStatus();
    }, []);

    // دانلود و مشاهده امن مدارک
    const handleViewFile = async (url: string | null, docKey: string) => {
        if (!url || downloadingKey) return;

        try {
            setDownloadingKey(docKey);
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/pdf, image/jpeg, image/png, */*',
                },
            });

            if (!res.ok) {
                throw new Error(`عدم دسترسی به فایل (کد ${res.status})`);
            }

            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const newWindow = window.open(blobUrl, '_blank');
            if (!newWindow) {
                const link = document.createElement('a');
                link.href = blobUrl;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 60000);

        } catch (err) {
            console.error('Download error:', err);
            alert('خطا در بارگذاری یا دریافت فایل مدرک.');
        } finally {
            setDownloadingKey(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        // اعتبارسنجی فیلدهای متنی برای آپلود جدید
        if (!nationalCode.trim() || !medicalCode.trim()) {
            setErrorMessage('لطفاً کد ملی و شماره نظام پزشکی را به درستی وارد نمایید.');
            return;
        }

        // اعتبارسنجی فایل‌ها
        if (!nationalCard || !medicalCouncilCard || !clinicLicense) {
            setErrorMessage('لطفاً تمامی مدارک خواسته‌شده (هر ۳ مدرک) را بارگذاری نمایید.');
            return;
        }

        const filesToCheck = [
            { label: 'کارت ملی', file: nationalCard },
            { label: 'کارت نظام پزشکی', file: medicalCouncilCard },
            { label: 'پروانه مطب', file: clinicLicense },
        ];

        for (const item of filesToCheck) {
            if (item.file.size > MAX_FILE_SIZE) {
                setErrorMessage(`حجم فایل «${item.label}» بیشتر از حد مجاز (۱۰ مگابایت) است.`);
                return;
            }
        }

        const formData = new FormData();
        formData.append('national_code', nationalCode.trim());
        formData.append('medical_code', medicalCode.trim());
        formData.append('national_card_image', nationalCard);
        formData.append('medical_council_card_image', medicalCouncilCard);
        formData.append('clinic_license_image', clinicLicense);

        try {
            setIsSubmitting(true);
            const res = await fetch('https://api.mediraai.com/api/doctor/documents/upload', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': authHeader,
                },
                body: formData,
            });

            if (res.status === 413) {
                throw new Error('مجموع حجم فایل‌های ارسالی فراتر از حد مجاز سرور است. لطفاً فایل‌های کم‌حجم‌تری انتخاب فرمایید.');
            }

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'خطا در بارگذاری مدارک');
            }

            // بازنشانی فایل‌های لوکال و فیلدهای متنی برای آپلود جدید
            setNationalCard(null);
            setMedicalCouncilCard(null);
            setClinicLicense(null);
            // در صورت ارسال مجدد، فیلدهای فرم را خالی می‌کنیم
            setNationalCode('');
            setMedicalCode('');

            // بروزرسانی فوری استور و بازخوانی مجدد استعلام
            setProfile({ has_uploaded_documents: 1, document_status: 'pending' });
            await fetchDocumentsStatus();
        } catch (err: any) {
            setErrorMessage(err.message || 'مشکلی رخ داده است. مجدداً تلاش کنید.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingStatus) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-600">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>در حال بارگذاری وضعیت مدارک...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center" dir="rtl">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">

                {/* هدر صفحه */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">وضعیت مدارک هویتی و پروانه طبابت</h2>
                            <p className="text-xs text-slate-500 mt-1">تایید هویت جهت فعال‌سازی پنل نوبت‌دهی و نسخه الکترونیک</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={fetchDocumentsStatus}
                        title="بروزرسانی وضعیت"
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* وضعیت: در انتظار بررسی ادمین */}
                {docStatus === 'pending' && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-2.5 text-amber-800 font-semibold text-sm">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <span>مدارک شما بارگذاری شده و هم‌اکنون در انتظار بررسی کارشناسان است.</span>
                        </div>
                        <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                            کارشناسان در اسرع وقت مدارک شما را بررسی خواهند کرد. پس از تأیید نهایی، دسترسی به تمام امکانات پنل به صورت خودکار فعال می‌گردد.
                        </p>

                        {/* **نمایش کد ملی و کد نظام پزشکی در حالت pending** */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 bg-amber-100/70 p-3 rounded-lg text-xs border border-amber-200">
                            <div>
                                <span className="text-amber-700">کد ملی: </span>
                                <span className="font-semibold text-amber-800 font-mono">{loadedNationalCode || '---'}</span>
                            </div>
                            <div>
                                <span className="text-amber-700">کد نظام پزشکی: </span>
                                <span className="font-semibold text-amber-800 font-mono">{loadedMedicalCode || '---'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* وضعیت: رد مدارک */}
                {docStatus === 'rejected' && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                        <div className="flex items-center gap-2.5 text-rose-800 font-semibold text-sm">
                            <XCircle className="w-5 h-5 text-rose-600" />
                            <span>مدارک شما رد شده است. لطفاً مدارک اصلاح‌شده را مجدداً ارسال فرمایید.</span>
                        </div>
                        {rejectionReason && (
                            <div className="mt-2 text-xs text-rose-700 bg-rose-100/60 p-2.5 rounded-lg border border-rose-200">
                                <strong>علت رد شدن:</strong> {rejectionReason}
                            </div>
                        )}
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* نمایش مدارک ثبت‌شده با امکان مشاهده اختصاصی (این بخش تغییر نمی‌کند) */}
                {docStatus === 'pending' && serverDocs && (
                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-700 mb-2">مدارک ثبت‌شده شما:</h4>

                        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-700">تصویر کارت ملی</span>
                            </div>
                            <button
                                type="button"
                                disabled={downloadingKey === 'national_card'}
                                onClick={() => handleViewFile(serverDocs.national_card.download_url, 'national_card')}
                                className="text-blue-600 hover:text-blue-700 disabled:text-blue-300 text-xs flex items-center gap-1 font-medium"
                            >
                                {downloadingKey === 'national_card' ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <ExternalLink className="w-3.5 h-3.5" />
                                )}
                                مشاهده فایل
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-700">کارت نظام پزشکی</span>
                            </div>
                            <button
                                type="button"
                                disabled={downloadingKey === 'medical_council_card'}
                                onClick={() => handleViewFile(serverDocs.medical_council_card.download_url, 'medical_council_card')}
                                className="text-blue-600 hover:text-blue-700 disabled:text-blue-300 text-xs flex items-center gap-1 font-medium"
                            >
                                {downloadingKey === 'medical_council_card' ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <ExternalLink className="w-3.5 h-3.5" />
                                )}
                                مشاهده فایل
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-700">مجوز / پروانه مطب</span>
                            </div>
                            <button
                                type="button"
                                disabled={downloadingKey === 'clinic_license'}
                                onClick={() => handleViewFile(serverDocs.clinic_license.download_url, 'clinic_license')}
                                className="text-blue-600 hover:text-blue-700 disabled:text-blue-300 text-xs flex items-center gap-1 font-medium"
                            >
                                {downloadingKey === 'clinic_license' ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <ExternalLink className="w-3.5 h-3.5" />
                                )}
                                مشاهده فایل
                            </button>
                        </div>
                    </div>
                )}

                {/* فرم بارگذاری مدارک */}
                {(docStatus === 'not_uploaded' || docStatus === 'rejected') && (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* فیلدهای متنی کد ملی و کد نظام پزشکی (برای آپلود جدید) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-slate-700">کد ملی</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={nationalCode} // مقدار دریافتی برای آپلود
                                    onChange={(e) => setNationalCode(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white transition-colors"
                                    placeholder="مثال: 0123456789"
                                    dir="ltr"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-slate-700">شماره نظام پزشکی</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={medicalCode} // مقدار دریافتی برای آپلود
                                    onChange={(e) => setMedicalCode(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white transition-colors"
                                    placeholder="مثال: 123456"
                                    dir="ltr"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <DocUploadField
                                title="عکس کارت ملی"
                                description="تصویر خوانا از روی کارت ملی"
                                file={nationalCard}
                                onChange={setNationalCard}
                            />
                            <DocUploadField
                                title="عکس نظام پزشکی"
                                description="کارت معتبر سازمان نظام پزشکی"
                                file={medicalCouncilCard}
                                onChange={setMedicalCouncilCard}
                            />
                            <DocUploadField
                                title="عکس پروانه مطب"
                                description="پروانه طبابت یا مجوز تأسیس"
                                file={clinicLicense}
                                onChange={setClinicLicense}
                            />
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{docStatus === 'rejected' ? 'ارسال مجدد اطلاعات و مدارک' : 'ثبت و ارسال مدارک'}</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* دکمه بررسی و استعلام مجدد */}
                {docStatus === 'pending' && (
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="button"
                            onClick={fetchDocumentsStatus}
                            className="px-5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl transition flex items-center gap-2"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            استعلام مجدد وضعیت تایید
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function DocUploadField({ title, description, file, onChange }: {
    title: string;
    description: string;
    file: File | null;
    onChange: (f: File | null) => void;
}) {
    return (
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
            <div>
                <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">{description}</p>
            </div>

            <label className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                file ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 hover:border-blue-400 bg-slate-50'
            }`}>
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            onChange(e.target.files[0]);
                        }
                    }}
                />
                {file ? (
                    <div className="flex flex-col items-center text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-1" />
                        <span className="text-xs font-medium text-emerald-700 truncate max-w-[150px]">{file.name}</span>
                        <span className="text-[11px] text-slate-400 mt-1">تغییر فایل</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-600">انتخاب فایل</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">JPG یا PDF حداکثر ۱۰MB</span>
                    </div>
                )}
            </label>
        </div>
    );
}
