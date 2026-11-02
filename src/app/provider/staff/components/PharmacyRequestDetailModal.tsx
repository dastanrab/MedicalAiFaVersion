import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Loader2, FileText, Pill, MessageSquare, ExternalLink, FileQuestion,
    Plus, Trash2, Send, Unlock, AlertCircle, Lock, MapPin, Navigation,
    Search, CheckCircle2,
} from 'lucide-react';
import { ProviderModal, formatFaNumber } from '../../components';
import { showProviderSuccess, showProviderError } from '../../utils/toast';
import { useStaffCan } from './StaffGates';
import { useStaffSession, useStaffActivityLogger } from '../store/staffStore';
import {
    API_BASE,
    pharmacyDeliveryTypeLabels,
    isAssignedToUs,
    extractAddress,
    extractCoords,
    openNeshanMap,
    type DetailedPharmacyRequest,
    type ParsedPrescriptionDetails,
} from '../types/pharmacyShared';
import { DetailRow } from './StaffUi';

// تطابق دقیق با خروجی GET /medicines/search
interface SearchedMedicineItem {
    id: number;
    name: string;
    generic_name?: string | null;
    slug?: string;
    base_price?: string | number | null;
    pharmacy_medicine_id?: number | null;
    pharmacy_price?: string | number | null;
    pharmacy_unit?: string | null;
    stock?: number | null;
}

interface PharmacyRequestDetailModalProps {
    requestId: number | null;
    onClose: () => void;
    onMutated: () => void;
}

export function PharmacyRequestDetailModal({
                                               requestId,
                                               onClose,
                                               onMutated,
                                           }: PharmacyRequestDetailModalProps) {
    const can = useStaffCan('pharmacy');
    const log = useStaffActivityLogger('pharmacy');
    const session = useStaffSession('pharmacy');

    const [detail, setDetail] = useState<DetailedPharmacyRequest | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [activeFileName, setActiveFileName] = useState<string | null>(null);

    // فیلدهای فرم افزودن قلم
    const [newMedName, setNewMedName] = useState('');
    const [newMedQty, setNewMedQty] = useState('1');
    const [newMedUnit, setNewMedUnit] = useState('عدد');
    const [newMedPrice, setNewMedPrice] = useState('');
    const [addingItem, setAddingItem] = useState(false);

    // جستجوی زنده دارو
    const [searchResults, setSearchResults] = useState<SearchedMedicineItem[]>([]);
    const [searchingMed, setSearchingMed] = useState(false);
    const [showMedDropdown, setShowMedDropdown] = useState(false);
    const searchWrapperRef = useRef<HTMLDivElement | null>(null);

    const [actionLoading, setActionLoading] = useState(false);
    const lastBlobRef = useRef<string | null>(null);

    const setBlobUrlSafely = (url: string | null) => {
        if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
        lastBlobRef.current = url;
        setPreviewBlobUrl(url);
    };

    const cleanupPreview = useCallback(() => {
        if (lastBlobRef.current) {
            URL.revokeObjectURL(lastBlobRef.current);
            lastBlobRef.current = null;
        }
        setPreviewBlobUrl(null);
        setActiveFileName(null);
    }, []);

    const parsedDetails = useMemo<ParsedPrescriptionDetails | null>(() => {
        if (!detail?.prescription_details) return null;
        try {
            if (typeof detail.prescription_details === 'object') {
                return detail.prescription_details as ParsedPrescriptionDetails;
            }
            return JSON.parse(detail.prescription_details);
        } catch {
            return null;
        }
    }, [detail?.prescription_details]);

    // آدرس و مختصات
    const addressText = useMemo(() => extractAddress(detail), [detail]);
    const coords = useMemo(() => extractCoords(detail), [detail]);
    const isAssigned = !!detail && isAssignedToUs(detail);

    // بستن دراپ‌داون در کلیک بیرون از فیلد
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchWrapperRef.current &&
                !searchWrapperRef.current.contains(event.target as Node)
            ) {
                setShowMedDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // ---------- جستجوی زنده دارو (Debounced) ----------
    useEffect(() => {
        const query = newMedName.trim();
        if (query.length < 2) {
            setSearchResults([]);
            setShowMedDropdown(false);
            setSearchingMed(false);
            return;
        }

        setSearchingMed(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/staff/pharmacy/medicines/search?q=${encodeURIComponent(query)}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.token}`,
                            'Accept': 'application/json',
                        },
                    }
                );
                if (response.ok) {
                    const resJson = await response.json();
                    const list: SearchedMedicineItem[] = Array.isArray(resJson.data)
                        ? resJson.data
                        : Array.isArray(resJson)
                            ? resJson
                            : [];
                    setSearchResults(list);
                    setShowMedDropdown(true);
                } else {
                    setSearchResults([]);
                }
            } catch {
                setSearchResults([]);
            } finally {
                setSearchingMed(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [newMedName]);

    // انتخاب دارو از دراپ‌داون
    const handleSelectSearchedMedicine = (med: SearchedMedicineItem) => {
        setNewMedName(med.name);

        // استفاده اولویت‌دار از قیمت داروخانه (pharmacy_price) و در صورت نبود، قیمت پایه
        const rawPrice = med.pharmacy_price ?? med.base_price;
        if (rawPrice !== null && rawPrice !== undefined && rawPrice !== '') {
            const numericPrice = Math.round(Number(rawPrice));
            if (!Number.isNaN(numericPrice)) {
                setNewMedPrice(String(numericPrice));
            }
        }

        // واحد شمارش ثبت شده در انبار داروخانه
        if (med.pharmacy_unit) {
            setNewMedUnit(med.pharmacy_unit);
        }

        setShowMedDropdown(false);
    };

    // ---------- fetch detail ----------
    const fetchDetail = useCallback(
        async (id: number) => {
            if (!session?.token) return;
            setLoadingDetail(true);
            try {
                const response = await fetch(`${API_BASE}/staff/pharmacy/requests/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${session.token}`,
                        'Accept': 'application/json',
                    },
                });
                const result = await response.json();
                if (response.ok && result.data) {
                    const reqData = result.data.request;
                    setDetail({ ...reqData, items: result.data.items || [] });
                } else {
                    showProviderError(result.message || 'خطا در دریافت جزئیات');
                    onClose();
                }
            } catch {
                showProviderError('خطا در ارتباط با سرور');
                onClose();
            } finally {
                setLoadingDetail(false);
            }
        },
        [session?.token, onClose]
    );

    // ---------- fetch image ----------
    const fetchPrescriptionImage = useCallback(
        async (id: number, rawFilePath: string) => {
            if (!session?.token) return;
            setPreviewLoading(true);
            setActiveFileName(rawFilePath);
            try {
                const cleanFileName = rawFilePath.replace(/^prescriptions\//, '');
                const encodedFile = cleanFileName.split('/').map(encodeURIComponent).join('/');
                const response = await fetch(
                    `${API_BASE}/staff/pharmacy/requests/${id}/prescription-file/${encodedFile}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.token}`,
                            'Accept': 'application/json',
                        },
                    }
                );
                if (!response.ok) {
                    showProviderError('خطا در لود فایل نسخه');
                    setBlobUrlSafely(null);
                    return;
                }
                const blob = await response.blob();
                setBlobUrlSafely(URL.createObjectURL(blob));
            } catch {
                showProviderError('برقراری ارتباط با فایل نسخه ناموفق بود');
                setBlobUrlSafely(null);
            } finally {
                setPreviewLoading(false);
            }
        },
        [session?.token]
    );

    useEffect(() => {
        if (requestId === null) {
            setDetail(null);
            cleanupPreview();
            return;
        }
        cleanupPreview();
        fetchDetail(requestId);
    }, [requestId, fetchDetail, cleanupPreview]);

    // لود خودکار اولین تصویر
    useEffect(() => {
        if (!detail?.id || !detail.prescription_details) return;
        if (activeFileName) return;

        let files: string[] = [];
        try {
            const parsed =
                typeof detail.prescription_details === 'object'
                    ? detail.prescription_details
                    : JSON.parse(detail.prescription_details);
            if (Array.isArray(parsed?.files) && parsed.files.length > 0) {
                files = parsed.files;
            }
        } catch {
            /* ignore */
        }
        if (files.length > 0) {
            fetchPrescriptionImage(detail.id, files[0]);
        }
    }, [detail?.id, detail?.prescription_details, activeFileName, fetchPrescriptionImage]);

    const handleClose = () => {
        cleanupPreview();
        onClose();
    };

    // ---------- add item ----------
    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!detail || !newMedName.trim() || !newMedPrice) {
            showProviderError('نام دارو و قیمت الزامی است');
            return;
        }
        setAddingItem(true);
        setShowMedDropdown(false);
        try {
            const response = await fetch(`${API_BASE}/staff/pharmacy/requests/${detail.id}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    medicine_name: newMedName.trim(),
                    quantity: Number(newMedQty),
                    unit: newMedUnit.trim() || 'عدد',
                    unit_price: Number(newMedPrice),
                }),
            });
            const result = await response.json();
            if (response.ok) {
                showProviderSuccess('دارو به نسخه اضافه شد');
                setNewMedName('');
                setNewMedPrice('');
                setNewMedQty('1');
                setNewMedUnit('عدد');
                setSearchResults([]);
                await fetchDetail(detail.id);
                onMutated();
            } else {
                showProviderError(result.message || 'خطا در ثبت دارو');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط با سرور');
        } finally {
            setAddingItem(false);
        }
    };

    // ---------- remove item ----------
    const handleRemoveItem = async (itemId: number) => {
        if (!detail || !session?.token) return;
        try {
            const response = await fetch(
                `${API_BASE}/staff/pharmacy/requests/${detail.id}/items/${itemId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${session.token}`,
                        'Accept': 'application/json',
                    },
                }
            );
            if (response.ok) {
                showProviderSuccess('قلم دارو حذف شد');
                await fetchDetail(detail.id);
                onMutated();
            } else {
                const res = await response.json();
                showProviderError(res.message || 'خطا در حذف قلم دارو');
            }
        } catch {
            showProviderError('خطا در حذف قلم دارو');
        }
    };

    // ---------- accept-invoice ----------
    const handleAcceptAndIssueInvoice = async () => {
        if (!detail || !session?.token) return;
        setActionLoading(true);
        try {
            const response = await fetch(
                `${API_BASE}/staff/pharmacy/requests/${detail.id}/accept-invoice`,
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
                showProviderSuccess('نسخه تأیید و فاکتور برای پرداخت بیمار ارسال شد');
                log('تأیید نسخه و صدور فاکتور', `درخواست #${detail.id}`);
                onMutated();
                handleClose();
            } else {
                showProviderError(result.message || 'خطا در صدور فاکتور');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط با سرور');
        } finally {
            setActionLoading(false);
        }
    };

    // ---------- release ----------
    const handleReleaseRequest = async () => {
        if (!detail || !session?.token) return;
        setActionLoading(true);
        try {
            const response = await fetch(
                `${API_BASE}/staff/pharmacy/requests/${detail.id}/release`,
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
                log('آزادسازی درخواست نسخه', `درخواست #${detail.id}`);
                onMutated();
                handleClose();
            } else {
                showProviderError(result.message || 'خطا در آزادسازی درخواست');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط');
        } finally {
            setActionLoading(false);
        }
    };

    // ---------- reserve ----------
    const handleReserve = async () => {
        if (!detail || !session?.token) return;
        setActionLoading(true);
        try {
            const response = await fetch(
                `${API_BASE}/staff/pharmacy/requests/${detail.id}/accept`,
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
                showProviderSuccess('درخواست برای داروخانه شما رزرو شد');
                log('رزرو درخواست نسخه', `درخواست #${detail.id}`);
                await fetchDetail(detail.id);
                onMutated();
            } else {
                showProviderError(result.message || 'خطا در رزرو درخواست');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط');
        } finally {
            setActionLoading(false);
        }
    };

    if (requestId === null) return null;

    return (
        <ProviderModal
            open
            onClose={handleClose}
            title={detail ? `مدیریت نسخه و اقلام #${detail.id}` : 'در حال بارگذاری...'}
        >
            {loadingDetail || !detail ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6 text-sm">
                    {/* هشدار وضعیت رزرو */}
                    {!isAssigned && detail.status === 0 && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1 text-amber-800">
                                <p className="font-bold mb-1">
                                    این درخواست هنوز به داروخانه‌ای اختصاص نیافته است.
                                </p>
                                <p className="leading-relaxed">
                                    برای افزودن اقلام و قیمت‌گذاری ابتدا باید درخواست را رزرو کنید.
                                </p>
                                {can('pharmacy.requests.status') && (
                                    <button
                                        type="button"
                                        onClick={handleReserve}
                                        disabled={actionLoading}
                                        className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Lock className="w-3.5 h-3.5" />
                                        )}
                                        <span>رزرو درخواست برای داروخانه من</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* اطلاعات بیمار */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                        <DetailRow label="نام بیمار" value={detail.user_name || 'ناشناس'} />
                        <DetailRow
                            label="شماره تماس"
                            value={
                                <span dir="ltr" className="font-mono text-teal-700">
                                    {detail.user_mobile}
                                </span>
                            }
                        />
                        <DetailRow
                            label="نحوه تحویل"
                            value={pharmacyDeliveryTypeLabels[String(detail.delivery_type)]}
                        />
                        <DetailRow
                            label="پوشش بیمه"
                            value={
                                parsedDetails?.has_insurance === '1' ||
                                parsedDetails?.has_insurance === 1
                                    ? 'دارد'
                                    : 'آزاد (بدون بیمه)'
                            }
                        />
                    </div>

                    {/* آدرس و موقعیت */}
                    {(addressText || coords) && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-xs">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        {detail.delivery_type === 1
                                            ? 'آدرس مقصد تحویل'
                                            : 'آدرس و موقعیت مکانی'}
                                    </span>
                                </div>

                                {coords && (
                                    <button
                                        type="button"
                                        onClick={() => openNeshanMap(coords.lat, coords.lng)}
                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                        title="باز کردن موقعیت در نقشه نشان"
                                    >
                                        <Navigation className="w-3.5 h-3.5" />
                                        <span>مسیریابی در نشان</span>
                                    </button>
                                )}
                            </div>

                            {addressText && (
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {addressText}
                                </p>
                            )}

                            {coords && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono" dir="ltr">
                                    <MapPin className="w-3 h-3 text-indigo-500" />
                                    <span>
                                        {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* کادر تصویر نسخه */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-teal-600" />
                                <span className="font-bold text-xs text-slate-800">
                                    اطلاعات و محتوای نسخه (
                                    {detail.prescription_type_name || 'نسخه درخواستی'})
                                </span>
                            </div>
                            {parsedDetails?.code && (
                                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-mono font-semibold">
                                    کد رهگیری: {parsedDetails.code}
                                </span>
                            )}
                        </div>

                        {parsedDetails?.files && parsedDetails.files.length > 0 ? (
                            <div className="space-y-2.5">
                                {parsedDetails.files.length > 1 && (
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                        <span className="text-xs text-slate-500 shrink-0">
                                            تصاویر نسخه:
                                        </span>
                                        {parsedDetails.files.map((filePath, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() =>
                                                    fetchPrescriptionImage(detail.id, filePath)
                                                }
                                                className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition ${
                                                    activeFileName === filePath
                                                        ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                تصویر {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col items-center justify-center min-h-[170px] max-h-[380px] overflow-hidden rounded-xl border border-slate-200 bg-white relative">
                                    {previewLoading ? (
                                        <div className="flex flex-col items-center gap-2 text-slate-400 py-8">
                                            <Loader2 className="w-7 h-7 animate-spin text-teal-600" />
                                            <span className="text-xs">
                                                در حال بارگذاری فایل نسخه...
                                            </span>
                                        </div>
                                    ) : previewBlobUrl ? (
                                        <div className="relative w-full h-full flex items-center justify-center p-2 group">
                                            <img
                                                src={previewBlobUrl}
                                                alt="نسخه بیمار"
                                                className="max-h-[350px] w-auto object-contain rounded-lg shadow-xs cursor-zoom-in"
                                                onClick={() =>
                                                    window.open(previewBlobUrl, '_blank')
                                                }
                                                title="جهت مشاهده در اندازه بزرگ کلیک کنید"
                                            />
                                            <a
                                                href={previewBlobUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute bottom-3 left-3 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 opacity-90 transition"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span>مشاهده تمام صفحه</span>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 px-4 text-xs text-slate-400">
                                            تصویر برای نمایش انتخاب نشده است.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {(parsedDetails?.medicines || parsedDetails?.description) && (
                            <div className="space-y-2 pt-1">
                                {parsedDetails.medicines && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-1">
                                        <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                                            <Pill className="w-3.5 h-3.5" />
                                            <span>داروهای درخواستی کاربر (متنی):</span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                            {parsedDetails.medicines}
                                        </p>
                                    </div>
                                )}
                                {parsedDetails.description && (
                                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                                            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                                            <span>توضیحات و یادداشت بیمار:</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {parsedDetails.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!parsedDetails?.files?.length &&
                            !parsedDetails?.medicines &&
                            !parsedDetails?.description && (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center space-y-1">
                                    <FileQuestion className="w-6 h-6 text-slate-400 mx-auto" />
                                    <p className="text-xs text-slate-600 font-medium">
                                        {parsedDetails?.code
                                            ? `نسخه آنلاین است. لطفاً کد رهگیری (${parsedDetails.code}) را در سامانه بیمه استعلام فرمایید.`
                                            : 'فایل تصویری یا شرح متنی ضمیمه نشده است.'}
                                    </p>
                                </div>
                            )}
                    </div>

                    {/* فرم افزودن دارو با جستجوی Autocomplete */}
                    {isAssigned && detail.status <= 1 && can('pharmacy.requests.status') && (
                        <form
                            onSubmit={handleAddItem}
                            className="rounded-xl border border-teal-200 bg-teal-50/40 p-3.5 space-y-3"
                        >
                            <h4 className="font-semibold text-teal-900 text-xs flex items-center gap-1">
                                <Plus className="w-4 h-4" /> افزودن دارو به این نسخه:
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                {/* نام دارو با جستجو */}
                                <div className="sm:col-span-2 relative" ref={searchWrapperRef}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newMedName}
                                            onChange={(e) => {
                                                setNewMedName(e.target.value);
                                                setShowMedDropdown(true);
                                            }}
                                            onFocus={() => {
                                                if (searchResults.length > 0) setShowMedDropdown(true);
                                            }}
                                            placeholder="نام دارو (مثال: استامینوفن)"
                                            className="w-full text-xs rounded-lg border border-slate-300 p-2 pl-8 bg-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                                            required
                                            autoComplete="off"
                                        />
                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            {searchingMed ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                                            ) : (
                                                <Search className="w-3.5 h-3.5" />
                                            )}
                                        </div>
                                    </div>

                                    {/* دراپ‌داون نتایج جستجو */}
                                    {showMedDropdown && (
                                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl divide-y divide-slate-100">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((med) => {
                                                    const priceVal = med.pharmacy_price ?? med.base_price;
                                                    const displayPrice = priceVal
                                                        ? Math.round(Number(priceVal))
                                                        : null;
                                                    const hasStock = (med.stock ?? 0) > 0;

                                                    return (
                                                        <button
                                                            key={med.id}
                                                            type="button"
                                                            onClick={() => handleSelectSearchedMedicine(med)}
                                                            className="w-full text-right p-2.5 hover:bg-teal-50/70 transition flex items-center justify-between gap-2 group"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-xs font-semibold text-slate-800 group-hover:text-teal-900 truncate">
                                                                    {med.name}
                                                                </div>
                                                                {med.generic_name && (
                                                                    <div className="text-[10px] text-slate-400 truncate">
                                                                        {med.generic_name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-left shrink-0">
                                                                {displayPrice !== null ? (
                                                                    <div className="text-[11px] font-mono font-bold text-teal-700">
                                                                        {formatFaNumber(displayPrice)} تومان
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-[10px] text-slate-400">
                                                                        بدون نرخ قبلی
                                                                    </div>
                                                                )}
                                                                {hasStock ? (
                                                                    <span className="text-[9px] text-emerald-600 flex items-center justify-end gap-0.5">
                                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                                        موجود در انبار ({formatFaNumber(med.stock!)})
                                                                    </span>
                                                                ) : med.pharmacy_medicine_id ? (
                                                                    <span className="text-[9px] text-slate-400 block text-left">
                                                                        تعریف‌شده در انبار
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                !searchingMed &&
                                                newMedName.trim().length >= 2 && (
                                                    <div className="p-3 text-center text-xs text-slate-400">
                                                        دارویی یافت نشد. می‌توانید با همین نام جدید ثبت نمایید.
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* فیلد تعداد */}
                                <div>
                                    <input
                                        type="number"
                                        value={newMedQty}
                                        onChange={(e) => setNewMedQty(e.target.value)}
                                        placeholder="تعداد"
                                        min="1"
                                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white outline-none focus:border-teal-500 font-mono"
                                        required
                                    />
                                </div>

                                {/* فیلد قیمت */}
                                <div>
                                    <input
                                        type="number"
                                        value={newMedPrice}
                                        onChange={(e) => setNewMedPrice(e.target.value)}
                                        placeholder="قیمت واحد (تومان)"
                                        className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white outline-none focus:border-teal-500 font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-slate-500">واحد شمارش:</span>
                                    <input
                                        type="text"
                                        value={newMedUnit}
                                        onChange={(e) => setNewMedUnit(e.target.value)}
                                        placeholder="عدد / بسته"
                                        className="w-20 text-center text-xs rounded-lg border border-slate-300 py-1 bg-white outline-none focus:border-teal-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={addingItem}
                                    className="flex items-center gap-1 bg-teal-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 transition shadow-xs"
                                >
                                    {addingItem ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Plus className="w-3.5 h-3.5" />
                                    )}
                                    <span>ثبت در پیش‌فاکتور</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* جدول اقلام */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-slate-800 text-xs">
                            اقلام فاکتور نسخه:
                        </h4>
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                            {detail.items && detail.items.length > 0 ? (
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                    <tr>
                                        <th className="p-2.5 text-right">نام دارو</th>
                                        <th className="p-2.5 text-center">تعداد / واحد</th>
                                        <th className="p-2.5 text-left">قیمت کل</th>
                                        {isAssigned && detail.status <= 1 && (
                                            <th className="p-2.5 text-center w-12">حذف</th>
                                        )}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {detail.items.map((it) => (
                                        <tr key={it.id}>
                                            <td className="p-2.5 font-medium">
                                                {it.medicine_name}
                                            </td>
                                            <td className="p-2.5 text-center font-mono">
                                                {formatFaNumber(it.quantity)}{' '}
                                                {it.unit || 'عدد'}
                                            </td>
                                            <td className="p-2.5 text-left font-mono">
                                                {it.total_price
                                                    ? `${formatFaNumber(it.total_price)} ت`
                                                    : '-'}
                                            </td>
                                            {isAssigned && detail.status <= 1 && (
                                                <td className="p-2.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(it.id)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition"
                                                        title="حذف قلم"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-400">
                                    {isAssigned
                                        ? 'هنوز دارویی ثبت نشده است. لطفاً اقلام نسخه را از فرم بالا وارد کنید.'
                                        : 'برای افزودن اقلام، ابتدا درخواست را رزرو کنید.'}
                                </div>
                            )}

                            <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-800">
                                <span>مجموع مبلغ نسخه:</span>
                                <span className="text-teal-700 text-sm">
                                    {detail.total_price
                                        ? `${formatFaNumber(detail.total_price)} تومان`
                                        : '۰ تومان'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* اکشن‌های پایانی */}
                    {isAssigned && detail.status === 0 && can('pharmacy.requests.status') && (
                        <div className="pt-2 space-y-2">
                            <button
                                type="button"
                                onClick={handleAcceptAndIssueInvoice}
                                disabled={actionLoading || !detail.items?.length}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-xs transition"
                            >
                                {actionLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                <span>تأیید داروها و ارسال فاکتور برای پرداخت بیمار</span>
                            </button>
                            {!detail.items?.length && (
                                <p className="text-[11px] text-amber-600 text-center font-medium">
                                    جهت تأیید نسخه ابتدا باید حداقل یک قلم دارو به جدول اقلام اضافه کنید.
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={handleReleaseRequest}
                                disabled={actionLoading}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition"
                            >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>آزادسازی درخواست (بازگشت به لیست عمومی)</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </ProviderModal>
    );
}
