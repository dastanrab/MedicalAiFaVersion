import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
    ArrowRight,
    Save,
    FileText,
    CheckCircle,
    Download,
    ShieldCheck,
    Loader2,
    AlertCircle,
    Check,
    XCircle,
    X
} from 'lucide-react';
import { AdminPageSkeleton } from '../../components/AdminPageSkeleton';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAdminDataStore } from '../../store/adminDataStore';
import {
    fetchAdminUser,
    updateAdminUser,
    verifyAdminUser,
    verifyUserShahkar,
    downloadAdminDocument,
    rejectDoctorDocuments
} from '../../services/adminApi';
import {
    userTypeLabels,
    userStatusLabels,
    userStatusStyles,
    type UserStatus,
} from '../../config/userOptions';
import { iranCitiesByProvince, iranProvinces } from "../../../data/iranLocations";

export function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useAdminAuthStore((s) => s.token);
    const addActivity = useAdminDataStore((s) => s.addActivity);

    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [verifyingShahkar, setVerifyingShahkar] = useState(false);
    const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

    // وضعیت مودال رد مدارک
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReasonInput, setRejectReasonInput] = useState('');
    const [submittingReject, setSubmittingReject] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        province: '',
        city: '',
        status: 'active' as UserStatus,
        national_code: '',
        medical_code: '', // اضافه شدن فیلد نظام پزشکی
        is_national_code_verified: false,
        document_status: 'pending',
        document_rejection_reason: ''
    });

    const selectedProvinceObj = useMemo(() => {
        return iranProvinces.find(p => p.name === form.province);
    }, [form.province]);

    const availableCities = useMemo(() => {
        if (!selectedProvinceObj) return [];
        return iranCitiesByProvince[selectedProvinceObj.id] ?? [];
    }, [selectedProvinceObj]);

    const load = useCallback(async () => {
        if (!id || !token) return;
        setLoading(true);

        try {
            const response = await fetchAdminUser(Number(id));
            const data = response.data || response;

            const mappedStatus = (data.status === 1 || data.status === 'active') ? 'active' : 'inactive';
            const nameParts = (data.name || '').trim().split(' ');

            if (data) {
                setUser(data);
                const rejectionReason = data.doctor_info?.document_rejection_reason || '';
                setForm({
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    phone: data.phone || '',
                    province: data.province || '',
                    city: data.city || '',
                    status: mappedStatus,
                    national_code: data.doctor_info?.national_code || '',
                    medical_code: data.doctor_info?.medical_code || '', // دریافت و ست کردن نظام پزشکی
                    is_national_code_verified: Boolean(data.doctor_info?.is_national_code_verified),
                    document_status: data.doctor_info?.document_status || 'pending',
                    document_rejection_reason: rejectionReason
                });
                setRejectReasonInput(rejectionReason);
            }
        } catch (err) {
            console.error("خطا در دریافت اطلاعات کاربر:", err);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        load();
    }, [load]);

    const handleProvinceChange = (newProvince: string) => {
        setForm(prev => ({
            ...prev,
            province: newProvince,
            city: ''
        }));
    };

    // استعلام شاهکار
    const handleVerifyShahkar = async () => {
        // از همان کد ملی که در فرم قرار دارد و کاربر در صورت نیاز ویرایش کرده استفاده می‌شود
        if (!form.national_code || form.national_code.trim().length !== 10) {
            alert("لطفاً یک کد ملی معتبر ۱۰ رقمی وارد کنید.");
            return;
        }

        if (!user?.phone) {
            alert("شماره موبایل کاربر برای استعلام یافت نشد.");
            return;
        }

        setVerifyingShahkar(true);
        try {
            const res = await verifyUserShahkar(user.id, form.national_code.trim());

            if (res && res.success) {
                setForm(prev => ({ ...prev, is_national_code_verified: true }));
                alert(res.message || "احراز هویت شاهکار با موفقیت تایید شد.");
            } else {
                alert(res?.message || "اطلاعات با سامانه شاهکار تطابق ندارد.");
            }
        } catch (err: any) {
            const serverMessage = err?.response?.data?.message || err?.message || "خطا در ارتباط با سرویس شاهکار.";
            alert(serverMessage);
        } finally {
            setVerifyingShahkar(false);
        }
    };

    // دانلود امن مدارک
    const handleDownloadDocument = async (docKey: string, path: string | null) => {
        if (!path) {
            alert('مدرکی در این بخش بارگذاری نشده است.');
            return;
        }

        setDownloadingDoc(docKey);
        try {
            await downloadAdminDocument(path);
        } catch (err: any) {
            console.error("خطا در دانلود مدرک:", err);
            alert(err?.message || 'خطا در دریافت فایل مدرک.');
        } finally {
            setDownloadingDoc(null);
        }
    };

    // ثبت رد مدارک از طریق مودال اختصاصی
    const handleConfirmReject = async () => {
        if (!rejectReasonInput.trim()) {
            alert('لطفاً حتماً علت رد مدارک را وارد کنید.');
            return;
        }

        setSubmittingReject(true);
        try {
            await rejectDoctorDocuments(user.id, rejectReasonInput.trim());
            setForm(prev => ({
                ...prev,
                document_status: 'rejected',
                document_rejection_reason: rejectReasonInput.trim()
            }));
            setIsRejectModalOpen(false);
            addActivity({
                type: 'verification',
                message: `رد مدارک دکتر ${form.firstName} ${form.lastName} به علت: ${rejectReasonInput.trim()}`,
                link: `/admin/users/${user.id}`
            });
            alert('مدارک رد شد و علت رد در سیستم ثبت گردید.');
            await load();
        } catch (err: any) {
            alert(err?.response?.data?.message || err.message || 'خطا در رد مدارک.');
        } finally {
            setSubmittingReject(false);
        }
    };

    // ذخیره کلیه تنظیمات و تغییرات فرم
    const handleSave = async () => {
        if (!user) return;

        if (user.type === 'doctor' && form.document_status === 'rejected' && !form.document_rejection_reason.trim()) {
            alert("در صورت انتخاب وضعیت «رد شده»، درج علت رد مدارک الزامی است.");
            return;
        }

        setSaving(true);
        try {
            const payload: Record<string, any> = {
                name: `${form.firstName} ${form.lastName}`.trim(),
                phone: form.phone,
                province: form.province,
                city: form.city,
                status: form.status === 'active' ? 1 : 0,
            };

            if (user.type === 'doctor') {
                payload.national_code = form.national_code;
                payload.medical_code = form.medical_code; // ارسال نظام پزشکی آپدیت شده
                payload.is_national_code_verified = form.is_national_code_verified;
                payload.document_status = form.document_status;
                payload.document_rejection_reason = form.document_status === 'rejected'
                    ? form.document_rejection_reason.trim()
                    : null;
            }

            await updateAdminUser(user.id, payload);
            await load();
            addActivity({
                type: 'user',
                message: `ویرایش اطلاعات و مدارک ${form.firstName} ${form.lastName}`,
                link: `/admin/users/${user.id}`
            });
            alert("تغییرات با موفقیت ذخیره شد.");
        } catch (err: any) {
            console.error("خطا در ذخیره سازی:", err);
            alert(err?.response?.data?.message || "خطا در ذخیره اطلاعات.");
        } finally {
            setSaving(false);
        }
    };

    const handleVerify = async (approved: boolean) => {
        if (!user) return;
        try {
            await verifyAdminUser(user.id, approved);
            setUser({ ...user, isVerified: approved });
            addActivity({
                type: 'verification',
                message: approved ? `تأیید پروفایل ${form.firstName}` : `رد پروفایل ${form.firstName}`
            });
        } catch (err) {
            alert("خطا در تغییر وضعیت تأیید کاربر.");
        }
    };

    if (loading) return <AdminPageSkeleton />;
    if (!user) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500">کاربر یافت نشد</p>
                <Link to="/admin/users" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">
                    بازگشت به لیست کاربران
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* هدر صفحه */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <ArrowRight className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">{form.firstName} {form.lastName}</h2>
                    <p className="text-sm text-slate-500">{userTypeLabels[user.type] || user.type} — شناسه #{user.id}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* اطلاعات پایه */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-800">ویرایش اطلاعات پایه</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">نام</label>
                                <input
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    placeholder="نام"
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">نام خانوادگی</label>
                                <input
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    placeholder="نام خانوادگی"
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">شماره موبایل</label>
                                <input
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="۰۹۱۲..."
                                    dir="ltr"
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-right"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">وضعیت حساب</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 outline-none"
                                >
                                    {Object.entries(userStatusLabels).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>

                            {/* انتخاب استان */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">استان</label>
                                <select
                                    value={form.province}
                                    onChange={(e) => handleProvinceChange(e.target.value)}
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="">انتخاب استان</option>
                                    {iranProvinces.map((p) => (
                                        <option key={p.id} value={p.name}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* انتخاب شهر */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">شهر</label>
                                <select
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    disabled={!form.province}
                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 outline-none bg-white disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">انتخاب شهر</option>
                                    {form.city && !availableCities.some(c => c.name === form.city) && (
                                        <option value={form.city}>{form.city}</option>
                                    )}
                                    {availableCities.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* بخش اختصاصی بررسی مدارک برای پزشک */}
                    {user.type === 'doctor' && (
                        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-slate-800">احراز هویت و بررسی مدارک پزشک</h3>
                                </div>

                                {/* دکمه‌های اقدام سریع رد / تایید */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(prev => ({
                                                ...prev,
                                                document_status: 'approved',
                                                document_rejection_reason: ''
                                            }));
                                        }}
                                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        تأیید مدارک
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsRejectModalOpen(true)}
                                        className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        رد مدارک با ذکر علت
                                    </button>
                                </div>
                            </div>

                            {/* نمایش بنر علت رد در صورت رد بودن */}
                            {form.document_status === 'rejected' && form.document_rejection_reason && (
                                <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 flex items-start gap-2.5">
                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-red-800 space-y-1">
                                        <span className="font-semibold">مدارک این پزشک رد شده است:</span>
                                        <p className="leading-relaxed">{form.document_rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-6 sm:grid-cols-2 pt-2">
                                {/* فیلدهای اطلاعات هویتی و احراز شاهکار */}
                                <div className="space-y-4">
                                    {/* نمایش و ویرایش کد نظام پزشکی */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-700 font-medium">شماره نظام پزشکی</label>
                                        <input
                                            value={form.medical_code}
                                            onChange={(e) => setForm({ ...form, medical_code: e.target.value })}
                                            placeholder="وارد نشده..."
                                            dir="ltr"
                                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 outline-none font-mono"
                                        />
                                    </div>

                                    {/* نمایش و ویرایش کد ملی به همراه استعلام */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-700 font-medium">کد ملی</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={form.national_code}
                                                onChange={(e) => setForm({ ...form, national_code: e.target.value })}
                                                placeholder="کد ملی ۱۰ رقمی"
                                                dir="ltr"
                                                maxLength={10}
                                                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-indigo-500 outline-none font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyShahkar}
                                                disabled={verifyingShahkar || form.is_national_code_verified}
                                                className={`h-11 px-3.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                                                    form.is_national_code_verified
                                                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                                }`}
                                            >
                                                {verifyingShahkar ? (
                                                    <>
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        در حال استعلام...
                                                    </>
                                                ) : form.is_national_code_verified ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5" />
                                                        تایید شده
                                                    </>
                                                ) : (
                                                    'استعلام شاهکار'
                                                )}
                                            </button>
                                        </div>

                                        <label className="flex items-center gap-2 pt-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.is_national_code_verified}
                                                onChange={(e) => setForm({ ...form, is_national_code_verified: e.target.checked })}
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                            />
                                            <span className="text-xs text-slate-600">تایید دستی انطباق شماره و کد ملی</span>
                                        </label>
                                    </div>
                                </div>

                                {/* وضعیت کلی مدارک */}
                                <div className="space-y-3">
                                    <label className="text-sm text-slate-700 font-medium">وضعیت مدارک ارسالی</label>
                                    <select
                                        value={form.document_status}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setForm(prev => ({
                                                ...prev,
                                                document_status: val,
                                                // اگر تایید شد علت رد پاک شود
                                                document_rejection_reason: val === 'approved' ? '' : prev.document_rejection_reason
                                            }));
                                        }}
                                        className={`h-11 w-full rounded-xl border px-3 text-sm outline-none font-medium transition-colors ${
                                            form.document_status === 'approved'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : form.document_status === 'rejected'
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}
                                    >
                                        <option value="pending">در انتظار بررسی</option>
                                        <option value="approved">تایید شده</option>
                                        <option value="rejected">رد شده (نیاز به اصلاح)</option>
                                        <option value="not_uploaded">آپلود نشده</option>
                                    </select>

                                    {form.document_status === 'rejected' && (
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                علت رد مدارک (به پزشک اعلام می‌شود):
                                            </label>
                                            <textarea
                                                value={form.document_rejection_reason}
                                                onChange={(e) => setForm({ ...form, document_rejection_reason: e.target.value })}
                                                placeholder="دلایل عدم تایید یا نقص مدرک (مثلاً: عدم وضوح کارت ملی، انقضای پروانه مطب و ...)"
                                                className="w-full rounded-xl border border-red-300 bg-red-50/30 p-3 text-xs focus:border-red-500 outline-none h-20 resize-none text-slate-800"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* دانلود و مشاهده مدارک */}
                            <div className="mt-6 border-t border-slate-100 pt-5">
                                <h4 className="mb-3 text-sm font-medium text-slate-700">فایل‌های بارگذاری‌شده</h4>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[
                                        {
                                            key: 'national_card',
                                            label: 'کارت ملی',
                                            path: user.doctor_info?.documents?.national_card
                                        },
                                        {
                                            key: 'medical_council_card',
                                            label: 'کارت نظام پزشکی',
                                            path: user.doctor_info?.documents?.medical_council_card
                                        },
                                        {
                                            key: 'clinic_license',
                                            label: 'پروانه مطب',
                                            path: user.doctor_info?.documents?.clinic_license
                                        },
                                    ].map((doc) => {
                                        const hasFile = Boolean(doc.path);
                                        const isDownloading = downloadingDoc === doc.key;

                                        return (
                                            <button
                                                key={doc.key}
                                                type="button"
                                                onClick={() => handleDownloadDocument(doc.key, doc.path)}
                                                disabled={!hasFile || isDownloading}
                                                className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs border transition-colors ${
                                                    hasFile
                                                        ? 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-slate-700'
                                                        : 'bg-slate-50/50 border-dashed border-slate-200 text-slate-400 cursor-not-allowed'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                                                    <span className="truncate">{doc.label}</span>
                                                </span>
                                                {hasFile && (
                                                    isDownloading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                                    ) : (
                                                        <Download className="h-4 w-4 text-indigo-500" />
                                                    )
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* دکمه ذخیره کلی */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'در حال ثبت اطلاعات...' : 'ذخیره تمام تغییرات'}
                    </button>
                </div>

                {/* سایدبار اطلاعات و وضعیت کلی */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-800">وضعیت سیستمی</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset ${userStatusStyles[user.status] || ''}`}>
                                {userStatusLabels[user.status] || user.status}
                            </span>
                            {user.isVerified ? (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                    <CheckCircle className="h-3.5 w-3.5" /> تایید شده
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700 ring-1 ring-inset ring-amber-200">
                                    در انتظار تایید هویت
                                </span>
                            )}
                        </div>

                        {/*{!user.isVerified && ['doctor', 'pharmacy', 'lab', 'nurse'].includes(user.type) && (*/}
                        {/*    <div className="pt-2 flex gap-2">*/}
                        {/*        <button*/}
                        {/*            type="button"*/}
                        {/*            onClick={() => handleVerify(true)}*/}
                        {/*            className="flex-1 rounded-xl bg-emerald-50 py-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"*/}
                        {/*        >*/}
                        {/*            تایید نهایی کاربر*/}
                        {/*        </button>*/}
                        {/*        <button*/}
                        {/*            type="button"*/}
                        {/*            onClick={() => handleVerify(false)}*/}
                        {/*            className="flex-1 rounded-xl bg-red-50 py-2.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"*/}
                        {/*        >*/}
                        {/*            رد کاربر*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>
                </div>
            </div>

            {/* مودال ثبت رد مدارک با ذکر دلیل */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <h3 className="font-semibold text-slate-800">رد مدارک پزشک</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRejectModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            لطفاً علت عدم تأیید مدارک را به وضوح شرح دهید. این توضیح در پنل پزشک نمایش داده شده و به او اطلاع داده خواهد شد.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">توضیح / علت رد مدرک:</label>
                            <textarea
                                value={rejectReasonInput}
                                onChange={(e) => setRejectReasonInput(e.target.value)}
                                placeholder="مثال: عکس کارت ملی ناخوانا است؛ لطفاً اسکن واضح‌تری بارگذاری نمایید..."
                                rows={4}
                                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none text-slate-800"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsRejectModalOpen(false)}
                                disabled={submittingReject}
                                className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReject}
                                disabled={submittingReject || !rejectReasonInput.trim()}
                                className="h-10 px-5 rounded-xl bg-red-600 text-xs font-medium text-white shadow hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {submittingReject && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                ثبت رد مدارک
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
