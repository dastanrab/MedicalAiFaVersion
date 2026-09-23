import React, { useState, useEffect } from 'react';
import { Loader2, CalendarClock, User, FileText, Download, CreditCard, Star, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { useAuthStore } from '../../store/authStore';
import { formatOrderPrice, serviceTypeLabels, UserRequestOrder } from '../../data/userOrdersMockData';
import { DoctorAppointmentDetail, NurseRequestDetail, PharmacyRequestDetail, LabRequestDetail } from './types';
import { serviceIcons, serviceIconStyles, getStatusClass, toJalaliDate, reverseServiceTypeMap } from './utils';

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-2xl bg-white border border-gray-100 px-3 py-2.5">
            <span className="shrink-0 text-[11px] font-medium text-gray-500">{label}</span>
            <span className="text-left text-sm text-gray-800 font-medium">{value}</span>
        </div>
    );
}

interface OrderDetailSheetProps {
    order: UserRequestOrder | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOrderUpdate?: (updated: UserRequestOrder) => void;
    refreshOrders?: () => void;
}

export function OrderDetailSheet({ order, open, onOpenChange, onOrderUpdate, refreshOrders }: OrderDetailSheetProps) {
    const { accessToken } = useAuthStore();

    const [doctorData, setDoctorData] = useState<DoctorAppointmentDetail | null>(null);
    const [detailData, setDetailData] = useState<PharmacyRequestDetail | null>(null);
    const [nurseData, setNurseData] = useState<NurseRequestDetail | null>(null);
    const [labData, setLabData] = useState<LabRequestDetail | null>(null);

    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [paying, setPaying] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const [downloadingTestId, setDownloadingTestId] = useState<number | null>(null);

    const [selectedGateway, setSelectedGateway] = useState<'saman' | 'zarinpal'>('saman');

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!order) return;
        setRating(0); setComment(''); setReviewMessage(null); setSelectedGateway('saman'); setDetailError(null);

        const fetchData = async () => {
            setDetailLoading(true); setDetailError(null);
            try {
                let url = '';
                if (order.serviceType === 'pharmacy') url = `https://api.mediraai.com/api/user/pharmacy-requests/${order.id}`;
                else if (order.serviceType === 'nurse') url = `https://api.mediraai.com/api/user/medical-requests/${order.id}`;
                else if (order.serviceType === 'lab') url = `https://api.mediraai.com/api/user/labs-requests/${order.id}`;
                else if (order.serviceType === 'consultation') url = `https://api.mediraai.com/api/user/appointments-requests/${order.id}`;
                else { setDetailLoading(false); return; }

                const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
                if (!res.ok) throw new Error('خطا در دریافت اطلاعات فاکتور یا نوبت');
                const json = await res.json();
                if (!json.success) throw new Error(json.message || 'پاسخ نامعتبر');

                if (order.serviceType === 'pharmacy') setDetailData(json.data);
                if (order.serviceType === 'nurse') setNurseData(json.data);
                if (order.serviceType === 'lab') setLabData(json.data);
                if (order.serviceType === 'consultation') setDoctorData(json.data);
            } catch (err: any) {
                setDetailError(err.message);
            } finally {
                setDetailLoading(false);
            }
        };

        setDetailData(null); setNurseData(null); setLabData(null); setDoctorData(null);
        fetchData();
    }, [order?.id, order?.serviceType, accessToken]);

    const getDoctorPatientInfo = () => {
        if (!doctorData?.extra_detail) return null;
        let details = doctorData.extra_detail;
        if (typeof details === 'string') {
            try { details = JSON.parse(details); } catch { return null; }
        }
        return details?.is_for_other && details?.patient ? details.patient : null;
    };

    const handleDoctorPay = async () => {
        if (!order) return;
        setPaying(true); setDetailError(null);
        try {
            const res = await fetch(`https://api.mediraai.com/api/user/appointments/pay-order`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order.order_id, gateway: selectedGateway }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                if (refreshOrders) refreshOrders();
                throw new Error(json.message || 'خطا در ایجاد لینک پرداخت. ممکن است مهلت رزرو تمام شده باشد.');
            }
            if (json.payment_url) window.location.href = json.payment_url;
            else throw new Error('آدرس پرداخت از سرور دریافت نشد.');
        } catch (err: any) {
            setDetailError(err.message); setPaying(false);
        }
    };

    const handleViewResult = async (fileUrl: string, testId: number) => {
        if (!fileUrl) return;
        setDownloadingTestId(testId);
        try {
            const response = await fetch(fileUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!response.ok) throw new Error('خطا در دریافت فایل نتیجه. دسترسی مجاز نیست.');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch {
            alert('مشکلی در باز کردن فایل نتیجه رخ داد. لطفاً دوباره تلاش کنید.');
        } finally {
            setDownloadingTestId(null);
        }
    };

    // ----- پرداخت آزمایشگاه -----
    const handleLabPay = async () => {
        console.log(order)
        if (!order || !order.order_id) {
            setDetailError('شماره سفارش برای پرداخت یافت نشد.');
            return;
        }
        setPaying(true); setDetailError(null);
        try {
            const res = await fetch(`https://api.mediraai.com/api/user/payments/initiate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order.order_id, gateway: selectedGateway })
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                if (refreshOrders) refreshOrders();
                throw new Error(json.message || 'خطا در ایجاد لینک پرداخت. ممکن است مهلت پرداخت تمام شده باشد.');
            }

            if (json.data && json.data.payment_url) {
                window.location.href = json.data.payment_url;
            } else {
                throw new Error('آدرس درگاه پرداخت دریافت نشد.');
            }
        } catch (err: any) {
            setDetailError(err.message);
            setPaying(false);
        }
    };

    // ----- لغو درخواست آزمایشگاه -----
    const handleCancelLabRequest = async () => {
        if (!order) return;
        if (!window.confirm('آیا از لغو این درخواست آزمایشگاه اطمینان دارید؟')) return;

        setCanceling(true); setDetailError(null);
        try {
            const res = await fetch(`https://api.mediraai.com/api/user/labs-requests/${order.id}/cancel`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || 'خطا در لغو درخواست');
            }

            const updatedOrder: UserRequestOrder = { ...order, status: 'cancelled', status_label: 'لغو شده' };
            if (onOrderUpdate) onOrderUpdate(updatedOrder);
            setLabData((prev) => prev ? { ...prev, status: 4, status_label: 'لغو شده' } : null);
            if (refreshOrders) refreshOrders();
        } catch (err: any) {
            setDetailError(err.message);
        } finally {
            setCanceling(false);
        }
    };

    // ----- پرداخت داروخانه -----
    const handlePharmacyPay = async () => {
        if (!order || !order.order_id) {
            setDetailError('شماره سفارش برای پرداخت یافت نشد.');
            return;
        }
        setPaying(true); setDetailError(null);
        try {
            const res = await fetch(`https://api.mediraai.com/api/user/payments/initiate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order.order_id, gateway: selectedGateway })
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                if (refreshOrders) refreshOrders();
                throw new Error(json.message || 'خطا در ایجاد لینک پرداخت. ممکن است مهلت پرداخت تمام شده باشد.');
            }

            if (json.data && json.data.payment_url) {
                window.location.href = json.data.payment_url;
            } else {
                throw new Error('آدرس درگاه پرداخت دریافت نشد.');
            }
        } catch (err: any) {
            setDetailError(err.message);
            setPaying(false);
        }
    };

    // ----- لغو درخواست داروخانه -----
    const handleCancelPharmacyRequest = async () => {
        if (!order) return;
        if (!window.confirm('آیا از لغو این درخواست داروخانه اطمینان دارید؟')) return;

        setCanceling(true); setDetailError(null);
        try {
            const res = await fetch(`https://api.mediraai.com/api/user/pharmacy-requests/${order.id}/cancel`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || 'خطا در لغو درخواست');
            }

            const updatedOrder: UserRequestOrder = { ...order, status: 'cancelled', status_label: 'لغو شده' };
            if (onOrderUpdate) onOrderUpdate(updatedOrder);
            setDetailData((prev) => prev ? { ...prev, status: 7, status_label: 'لغو شده' } : null);
            if (refreshOrders) refreshOrders();
        } catch (err: any) {
            setDetailError(err.message);
        } finally {
            setCanceling(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!order || rating === 0) return;
        setReviewLoading(true); setReviewMessage(null);
        try {
            const apiOrderType = reverseServiceTypeMap[order.serviceType] || order.serviceType;
            const res = await fetch('https://api.mediraai.com/api/user/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
                body: JSON.stringify({ order_id: order.id, order_type: apiOrderType, rating, comment })
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'خطا در ثبت نظر');
            setReviewMessage({ type: 'success', text: 'نظر شما با موفقیت ثبت شد.' });
        } catch (err: any) { setReviewMessage({ type: 'error', text: err.message }); } finally { setReviewLoading(false); }
    };

    if (!order) return null;

    const Icon = serviceIcons[order.serviceType];
    const statusClass = getStatusClass(order.status);

    // شروط دکمه پرداخت
    const showDoctorPayButton = order.serviceType === 'consultation' && String(order.rawStatus).toLowerCase() === 'available' && order.order_id !== null;
    const showLabPayButton = order.serviceType === 'lab' && labData && labData.status === 1 && order.order_id !== null;
    const showPharmacyPayButton = order.serviceType === 'pharmacy' && detailData && detailData.status === 1 && order.order_id !== null;

    // شروط دکمه لغو
    const showLabCancelButton = order.serviceType === 'lab' && labData && (labData.status === 0 || labData.status === 1);
    const showPharmacyCancelButton = order.serviceType === 'pharmacy' && detailData && (detailData.status === 0 || detailData.status === 1);

    const isCompleted = order.status === 'completed';
    const patientInfo = getDoctorPatientInfo();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-gray-100 px-4 pb-8 pt-4 font-[YekanBakhFaNum]" dir="rtl">
                <SheetHeader className="text-right">
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
                    <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${serviceIconStyles[order.serviceType]}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                    {serviceTypeLabels[order.serviceType]}
                                </span>
                                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusClass}`}>
                                    {order.status_label}
                                </span>
                            </div>
                            <SheetTitle className="mt-2 text-base font-bold text-gray-900">{order.title}</SheetTitle>
                            <SheetDescription className="mt-1 text-xs text-gray-500">{order.providerName}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="mt-5 space-y-3">
                    {detailLoading && <div className="flex items-center justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>}
                    {detailError && <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{detailError}</div>}

                    {order.summary && order.serviceType !== 'consultation' && <DetailRow label="خلاصه درخواست" value={order.summary} />}
                    <DetailRow label="کد پیگیری" value={order.code} />
                    <DetailRow label="تاریخ ثبت" value={order.createdAt} />

                    {order.serviceType === 'consultation' && doctorData && !detailLoading && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm space-y-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarClock className="h-4 w-4 text-blue-600" />
                                <h4 className="font-semibold text-gray-800">جزئیات نوبت</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <span className="block text-[11px] text-gray-500 mb-1">تاریخ مراجعه</span>
                                    <span className="font-semibold text-gray-900">{toJalaliDate(doctorData.slot_date) || '-'}</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <span className="block text-[11px] text-gray-500 mb-1">ساعت نوبت</span>
                                    <span className="font-semibold text-blue-700" dir="ltr">{doctorData.start_time ? doctorData.start_time.substring(0, 5) : '-'}</span>
                                </div>
                            </div>
                            {patientInfo && (
                                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2.5">
                                    <div className="flex items-center gap-2 mb-1"><User className="h-4 w-4 text-gray-500" /><h4 className="font-semibold text-gray-700 text-xs">اطلاعات بیمار</h4></div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs"><span className="text-gray-500">نام بیمار:</span><span className="font-medium text-gray-900">{patientInfo.last_name || '-'}</span></div>
                                        <div className="flex justify-between items-center text-xs"><span className="text-gray-500">کد ملی:</span><span className="font-medium text-gray-900">{patientInfo.national_code || '-'}</span></div>
                                        <div className="flex justify-between items-center text-xs"><span className="text-gray-500">شماره تماس:</span><span className="font-medium text-gray-900">{patientInfo.phone || '-'}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {order.serviceType === 'nurse' && nurseData && !detailLoading && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-3 text-sm space-y-2">
                            <h4 className="mb-2 font-semibold text-gray-800">جزئیات خدمات پرستاری</h4>
                            {nurseData.services.map((svc, idx) => (
                                <div key={idx} className="flex justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                    <span className="text-gray-700">{svc.service_name}</span>
                                    <span className="text-gray-900 font-medium">{formatOrderPrice(svc.price)} ت</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {order.serviceType === 'pharmacy' && detailData && !detailLoading && (
                        <>
                            <div className="rounded-2xl border border-gray-100 bg-white p-3 text-sm space-y-2">
                                <h4 className="mb-2 font-semibold text-gray-800">داروهای سفارش‌داده‌شده</h4>
                                {detailData.medicines.map((med) => (
                                    <div key={med.id} className="flex justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                        <span className="text-gray-700">{med.medicine_name} ({med.quantity} {med.unit})</span>
                                        <span className="text-gray-900 font-medium">{formatOrderPrice(med.total_price)} ت</span>
                                    </div>
                                ))}
                            </div>
                            <DetailRow label="داروخانه" value={detailData.pharmacy_name} />
                        </>
                    )}

                    {order.serviceType === 'lab' && labData && !detailLoading && (
                        <>
                            <div className="rounded-2xl border border-gray-100 bg-white p-3 text-sm space-y-2">
                                <h4 className="mb-2 font-semibold text-gray-800">آزمایش‌های درخواستی</h4>
                                {labData.tests.map((test) => (
                                    <div key={test.id} className="flex flex-col gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                                        <div className="flex justify-between"><span className="text-gray-700">{test.test_name}</span><span className="text-gray-900 font-medium">{formatOrderPrice(test.price)} ت</span></div>
                                        {test.result_file && (
                                            <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                                                <FileText className="h-4 w-4" /><span>نتیجه: </span>
                                                <button onClick={() => handleViewResult(test.result_file!, test.id)} disabled={downloadingTestId === test.id} className="underline hover:text-blue-800 flex items-center gap-1 disabled:opacity-60 disabled:cursor-wait disabled:no-underline">
                                                    {downloadingTestId === test.id ? <><Loader2 className="h-3 w-3 animate-spin" /><span>در حال باز کردن...</span></> : <><Download className="h-3 w-3" /><span>دانلود / مشاهده</span></>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <DetailRow label="آزمایشگاه" value={labData.lab_name} />
                        </>
                    )}

                    {order.amount != null && !detailLoading && (
                        <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-3 py-3 mt-4 border border-blue-100">
                            <span className="text-xs font-medium text-blue-700">مبلغ نهایی پرداخت</span>
                            <span className="text-sm font-bold text-blue-800">
                                {formatOrderPrice(
                                    order.serviceType === 'pharmacy' && detailData ? detailData.total_price :
                                        order.serviceType === 'nurse' && nurseData ? nurseData.total_price :
                                            order.serviceType === 'lab' && labData ? labData.total_price : order.amount
                                )} تومان
                            </span>
                        </div>
                    )}

                    {showDoctorPayButton && (
                        <div className="mt-4 space-y-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700">انتخاب درگاه پرداخت:</label>
                                <select className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={selectedGateway} onChange={(e) => setSelectedGateway(e.target.value as 'saman' | 'zarinpal')} disabled={paying}>
                                    <option value="saman">پرداخت آنلاین با کارت بانکی (سامان کیش)</option>
                                    <option value="zarinpal">زرین‌پال</option>
                                </select>
                            </div>
                            <button onClick={handleDoctorPay} disabled={paying} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors">
                                {paying ? <><Loader2 className="h-5 w-5 animate-spin" /><span>در حال بررسی و اتصال…</span></> : <><CreditCard className="h-5 w-5" /><span>پرداخت و نهایی کردن نوبت</span></>}
                            </button>
                        </div>
                    )}

                    {showLabPayButton && (
                        <div className="mt-4 space-y-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700">انتخاب درگاه پرداخت:</label>
                                <select className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={selectedGateway} onChange={(e) => setSelectedGateway(e.target.value as 'saman' | 'zarinpal')} disabled={paying || canceling}>
                                    <option value="saman">پرداخت آنلاین با کارت بانکی (سامان کیش)</option>
                                    <option value="zarinpal">زرین‌پال</option>
                                </select>
                            </div>
                            <button onClick={handleLabPay} disabled={paying || canceling} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors">
                                {paying ? <><Loader2 className="h-5 w-5 animate-spin" /><span>در حال بررسی و اتصال…</span></> : <><CreditCard className="h-5 w-5" /><span>پرداخت فاکتور آزمایشگاه</span></>}
                            </button>
                        </div>
                    )}

                    {showLabCancelButton && (
                        <button onClick={handleCancelLabRequest} disabled={paying || canceling} className="mt-2 w-full rounded-xl bg-white border border-red-200 text-red-600 py-3 text-sm font-semibold shadow-sm hover:bg-red-50 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors">
                            {canceling ? <><Loader2 className="h-5 w-5 animate-spin" />در حال لغو…</> : <><Trash2 className="h-5 w-5" />لغو درخواست آزمایشگاه</>}
                        </button>
                    )}

                    {showPharmacyPayButton && (
                        <div className="mt-4 space-y-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-700">انتخاب درگاه پرداخت:</label>
                                <select className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={selectedGateway} onChange={(e) => setSelectedGateway(e.target.value as 'saman' | 'zarinpal')} disabled={paying || canceling}>
                                    <option value="saman">پرداخت آنلاین با کارت بانکی (سامان کیش)</option>
                                    <option value="zarinpal">زرین‌پال</option>
                                </select>
                            </div>
                            <button onClick={handlePharmacyPay} disabled={paying || canceling} className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors">
                                {paying ? <><Loader2 className="h-5 w-5 animate-spin" /><span>در حال پردازش…</span></> : <><CreditCard className="h-5 w-5" /><span>پرداخت فاکتور داروخانه</span></>}
                            </button>
                        </div>
                    )}

                    {showPharmacyCancelButton && (
                        <button onClick={handleCancelPharmacyRequest} disabled={paying || canceling} className="mt-2 w-full rounded-xl bg-white border border-red-200 text-red-600 py-3 text-sm font-semibold shadow-sm hover:bg-red-50 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors">
                            {canceling ? <><Loader2 className="h-5 w-5 animate-spin" />در حال لغو…</> : <><Trash2 className="h-5 w-5" />لغو درخواست داروخانه</>}
                        </button>
                    )}

                    {isCompleted && !detailLoading && (
                        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">ثبت نظر درباره این سفارش</h4>
                            {reviewMessage?.type === 'success' ? (
                                <div className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">{reviewMessage.text}</div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                                <Star className={`h-7 w-7 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" rows={3} placeholder="نظر خود را درباره نحوه خدمت رسانی بنویسید (اختیاری)..." value={comment} onChange={(e) => setComment(e.target.value)} disabled={reviewLoading} />
                                    {reviewMessage?.type === 'error' && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center">{reviewMessage.text}</div>}
                                    <button onClick={handleSubmitReview} disabled={rating === 0 || reviewLoading} className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2">
                                        {reviewLoading && <Loader2 className="h-4 w-4 animate-spin" /> } ارسال نظر
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}