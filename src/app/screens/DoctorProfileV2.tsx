import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import {
    Clock, AlertCircle, AlertTriangle, Calendar, X, Info, Loader2
} from 'lucide-react';

// ایمپورت کامپوننت‌های پایه (بر اساس ساختار قبلی شما)
import { Button } from '../components/ui/button';
import { AppBar } from '../components/AppBar';
import { PageLoader } from '../components/PageLoader';
import { useAuthStore } from '../store/authStore';

// ایمپورت فایل‌ها و کامپوننت‌هایی که به تازگی در پوشه components ساختید
import { DoctorData, TimeSlot, UserProfile, OtherPatient, ViewState, Gateway, ApiResponse } from '../components/types';
import { getShortDay, getShortDate, isValidNationalCode, isValidIranPhone, CountdownTimer } from '../components/shared';
import { DoctorProfileInfo } from '../components/DoctorProfileInfo';
import { PatientReservationForm } from '../components/PatientReservationForm';
import { PaymentSummaryView } from '../components/PaymentSummaryView';

export function DoctorProfileV2() {
    const { accessToken } = useAuthStore();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const abortRef = useRef<AbortController | null>(null);

    // ─── State Management ───────────────────────────────────────────────
    const [orderType, setOrderType] = useState<'appointment' | 'chat'>('appointment');
    const [chatRoomId, setChatRoomId] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
    const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);

    const [view, setView] = useState<ViewState>('profile');
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    const [showConflictModal, setShowConflictModal] = useState(false);
    const [targetNewSlot, setTargetNewSlot] = useState<TimeSlot | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);

    const [orderId, setOrderId] = useState<number | null>(null);
    const [bookingFor, setBookingFor] = useState<'myself' | 'other'>('myself');
    const [otherPatient, setOtherPatient] = useState<OtherPatient>({
        fullName: '', nationalCode: '', phone: '',
    });

    const [patientErrors, setPatientErrors] = useState<Partial<OtherPatient>>({});
    const [orderError, setOrderError] = useState<string | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const [selectedGateway, setSelectedGateway] = useState<Gateway>('saman');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // ─── Computed Values ────────────────────────────────────────────────
    const activeTempReservation = useMemo(() => {
        let tempActiveSlot: TimeSlot | null = null;
        Object.values(availableSlots).forEach((daySlots) => {
            daySlots.forEach((s) => {
                if (s.is_my_temp_reservation) {
                    tempActiveSlot = s;
                }
            });
        });
        return tempActiveSlot;
    }, [availableSlots]);

    const firstAvailableDate = Object.keys(availableSlots)[0];
    const firstAvailableSlot = firstAvailableDate ? availableSlots[firstAvailableDate][0] : null;

    // ─── API Calls & Effects ────────────────────────────────────────────

    useEffect(() => {
        let sid = (location.state as { sessionId?: string } | null)?.sessionId ?? null;
        if (!sid && id) {
            try {
                const raw = sessionStorage.getItem(`diagnosis_doctor_context_${id}`);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (!parsed.expiry || Date.now() < parsed.expiry) {
                        sid = parsed.sessionId;
                    } else {
                        sessionStorage.removeItem(`diagnosis_doctor_context_${id}`);
                    }
                }
            } catch {
                sessionStorage.removeItem(`diagnosis_doctor_context_${id}`);
            }
        }
        setSessionId(sid);
    }, [location.state, id]);

    const fetchDoctorData = useCallback(async () => {
        if (!id) return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);
        try {
            const headers: Record<string, string> = { Accept: 'application/json' };
            if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
            const res = await fetch(
                `https://api.mediraai.com/api/user/doctors/${id}/schedule`,
                { headers, signal: controller.signal }
            );
            if (!res.ok) throw new Error('اطلاعات پزشک دریافت نشد');

            const result: ApiResponse = await res.json();

            setDoctorData(result.data.doctor);
            const slots = result.data.available_slots ?? {};
            setAvailableSlots(slots);

            if (!selectedDate) {
                const firstDate = Object.keys(slots)[0];
                if (firstDate) setSelectedDate(firstDate);
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            setError(err instanceof Error ? err.message : 'خطای ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    }, [id, accessToken, selectedDate]);

    useEffect(() => {
        fetchDoctorData();
        return () => { abortRef.current?.abort(); };
    }, [fetchDoctorData]);
// ─── Auto Open Payment Hook ─────────────────────────────────────────
    useEffect(() => {
        // خواندن state ارسال شده از React Router (از صفحه Home)
        const state = location.state as { autoOpenPayment?: boolean } | null;

        // اگر دستور باز شدن خودکار صادر شده بود و اطلاعات نوبت موقت هم از سرور دریافت شده است
        if (state?.autoOpenPayment && activeTempReservation && view !== 'payment') {

            // فراخوانی متد هندل کردن نوبت قبلی برای رفتن به تب پرداخت
            handleContinueOld();

            // پاک کردن state از history تا در صورت رفرش صفحه توسط کاربر، مجدداً اجرا نشود
            window.history.replaceState({}, document.title);
        }
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTempReservation, location.state]); // به محض اینکه activeTempReservation مقدار گرفت اجرا می‌شود
    useEffect(() => {
        if (!accessToken) return;
        (async () => {
            try {
                const res = await fetch('https://api.mediraai.com/api/user/profile', {
                    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.data ?? data);
                }
            } catch { /* non-critical */ }
        })();
    }, [accessToken]);

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleMainBookClick = () => {
        setIsTimeModalOpen(true);
    };

    const handleSlotClick = (slot: TimeSlot) => {
        if (activeTempReservation) {
            if (slot.id === activeTempReservation.id) {
                handleContinueOld();
            } else {
                setTargetNewSlot(slot);
                setShowConflictModal(true);
            }
        } else {
            setSelectedSlot(slot);
            setView('patient_info');
            setIsTimeModalOpen(false);
        }
    };

    const handleCancelAndNew = async () => {
        if (!activeTempReservation || !accessToken) return;
        setIsCanceling(true);
        try {
            const res = await fetch('https://api.mediraai.com/api/user/appointments/cancel-temp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ slot_id: activeTempReservation.id })
            });

            if (!res.ok) throw new Error();

            await fetchDoctorData();
            setShowConflictModal(false);

            if (targetNewSlot) {
                setSelectedSlot(targetNewSlot);
                setView('patient_info');
                setIsTimeModalOpen(false);
            } else {
                setIsTimeModalOpen(true);
            }
        } catch (error) {
            alert('خطا در لغو نوبت قبلی. لطفاً مجدداً تلاش کنید.');
        } finally {
            setIsCanceling(false);
        }
    };

    const handleContinueOld = () => {
        if (!activeTempReservation) return;

        let slotDateStr = '';
        Object.keys(availableSlots).forEach(date => {
            if (availableSlots[date].find(s => s.id === activeTempReservation.id)) {
                slotDateStr = date;
            }
        });

        if (slotDateStr) setSelectedDate(slotDateStr);
        setSelectedSlot(activeTempReservation);
        setOrderId(activeTempReservation.temp_order_id!);
        setShowConflictModal(false);
        setIsTimeModalOpen(false);
        setView('payment');
    };

    const handleStartChat = async () => {
        if (!accessToken) {
            alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            return;
        }

        setIsStartingChat(true);
        setOrderError(null); // پاک کردن ارورهای قبلی پرداخت (اگر وجود داشت)

        try {
            // تغییر آدرس وب‌سرویس به روت جدید رزرو/ایجاد چت
            const res = await fetch('https://api.mediraai.com/api/user/chat/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ doctor_id: id }),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'خطا در بررسی یا ایجاد اتاق چت');
            }

            // ۱. اگر بیمار از قبل چت فعال داشت (بدون نیاز به پرداخت)
            if (result.data?.is_active) {
                navigate(`/consultation/${result.data.room_id}`);
                return;
            }

            // ۲. اگر چت فعال نبود و نیاز به پرداخت داشت (سفارش جدید ساخته شده)
            const generatedOrderId = result.data?.order_id;
            if (!generatedOrderId) {
                throw new Error('شناسه سفارش از سرور دریافت نشد');
            }

            // ذخیره اطلاعات سفارش و انتقال به صفحه پرداخت
            setOrderId(generatedOrderId);
            setOrderType('chat'); // مشخص می‌کنیم که این فاکتور برای چت است نه نوبت حضوری
            setView('payment');

        } catch (err) {
            alert(err instanceof Error ? err.message : 'خطا در برقراری ارتباط چت');
        } finally {
            setIsStartingChat(false);
        }
    };
    const validatePatient = (): boolean => {
        if (bookingFor === 'myself') return true;
        const errs: Partial<OtherPatient> = {};
        if (!otherPatient.fullName.trim()) errs.fullName = 'نام الزامی است';
        if (!isValidNationalCode(otherPatient.nationalCode))
            errs.nationalCode = 'کد ملی معتبر نیست';
        if (!isValidIranPhone(otherPatient.phone))
            errs.phone = 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲...)';
        setPatientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCreateOrder = async () => {
        if (!validatePatient()) return;
        if (!selectedSlot || !accessToken) {
            if (!accessToken) alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            return;
        }

        setIsCreatingOrder(true);
        setOrderError(null);

        try {
            const reservePayload: Record<string, any> = {
                slot_id: selectedSlot.id,
                session_id: sessionId,
                is_for_other: bookingFor === 'other',
            };

            if (bookingFor === 'other') {
                reservePayload.other_patient = {
                    last_name: otherPatient.fullName.trim(),
                    national_code: otherPatient.nationalCode,
                    phone: otherPatient.phone.replace(/\s/g, ''),
                };
            }

            const reserveResponse = await fetch('https://api.mediraai.com/api/user/appointments/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(reservePayload),
            });

            const reserveResult = await reserveResponse.json();
            if (!reserveResponse.ok || !reserveResult.success) {
                throw new Error(reserveResult.message ?? 'خطا در رزرو موقت نوبت');
            }

            const generatedOrderId = reserveResult.data?.order_id;
            if (!generatedOrderId) {
                throw new Error('شناسه سفارش از سرور دریافت نشد');
            }

            await fetchDoctorData();

            setOrderId(generatedOrderId);
            setOrderType('appointment');
            setView('payment');
        } catch (err) {
            setOrderError(err instanceof Error ? err.message : 'خطا در ثبت نوبت');
            await fetchDoctorData();
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handleProceedToPayment = async () => {
        if (!orderId || !accessToken) return;

        setIsPaying(true);
        setPaymentError(null);

        try {
            const paymentPayload = {
                order_id: orderId,
                gateway: selectedGateway,
            };

            const paymentResponse = await fetch('https://api.mediraai.com/api/user/payments/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify(paymentPayload),
            });

            const paymentResult = await paymentResponse.json();
            if (!paymentResponse.ok || !paymentResult.success) {
                throw new Error(paymentResult.message ?? 'خطا در اتصال به درگاه پرداخت');
            }

            const paymentUrl = paymentResult.data?.payment_url;
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                throw new Error('آدرس درگاه پرداخت دریافت نشد');
            }
        } catch (err) {
            setPaymentError(err instanceof Error ? err.message : 'خطا در عملیات پرداخت');
            await fetchDoctorData();
        } finally {
            setIsPaying(false);
        }
    };

    // ─── Renders ────────────────────────────────────────────────────────

    if (loading && Object.keys(availableSlots).length === 0) {
        return <div className="min-h-full flex items-center justify-center bg-gray-50"><PageLoader /></div>;
    }

    if (error || !doctorData) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 p-4" dir="rtl">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <p className="text-gray-800 font-bold mb-4">{error ?? 'پزشک مورد نظر یافت نشد'}</p>
                <Button onClick={() => navigate('/doctors')} className="bg-blue-600 text-white rounded-xl">
                    بازگشت به لیست پزشکان
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#f8f9fa] text-gray-800 pb-28 font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/doctors" />

            {/* ── بنر نمایش رزرو فعال در بالای صفحه (سراسری) ── */}
            {activeTempReservation && view !== 'payment' && (
                <div className="pt-20 pb-2 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-[1400px] mx-auto animate-in fade-in slide-in-from-top-4">
                    <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3 text-pink-800">
                            <Clock className="w-6 h-6 animate-pulse flex-shrink-0" />
                            <div>
                                <p className="font-bold text-sm">شما یک نوبت رزرو شده دارید!</p>
                                <p className="text-xs mt-0.5 flex items-center">
                                    زمان باقیمانده برای تکمیل پرداخت:
                                    {activeTempReservation.expires_at && (
                                        <CountdownTimer
                                            expiresAt={activeTempReservation.expires_at}
                                            onExpire={() => fetchDoctorData()}
                                        />
                                    )}
                                </p>
                            </div>
                        </div>
                        {view !== 'payment' && (
                            <Button
                                onClick={handleContinueOld}
                                className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl"
                            >
                                تکمیل پرداخت نوبت
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* ── مرحله ۱: پروفایل پزشک ── */}
            {view === 'profile' && (
                <DoctorProfileInfo
                    doctorData={doctorData}
                    isFavorite={isFavorite}
                    setIsFavorite={setIsFavorite}
                    activeTempReservation={activeTempReservation}
                    firstAvailableDate={firstAvailableDate}
                    firstAvailableSlot={firstAvailableSlot}
                    handleMainBookClick={handleMainBookClick}
                    handleStartChat={handleStartChat}
                    isStartingChat={isStartingChat}
                    navigate={navigate}
                    id={id!}
                />
            )}

            {/* ── مرحله ۲: اطلاعات مراجعه‌کننده ── */}
            {view === 'patient_info' && (
                <PatientReservationForm
                    doctorData={doctorData}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    activeTempReservation={activeTempReservation}
                    bookingFor={bookingFor}
                    setBookingFor={setBookingFor}
                    currentUser={currentUser}
                    otherPatient={otherPatient}
                    setOtherPatient={setOtherPatient}
                    patientErrors={patientErrors}
                    setPatientErrors={setPatientErrors}
                    orderError={orderError}
                    isCreatingOrder={isCreatingOrder}
                    handleCreateOrder={handleCreateOrder}
                    setView={setView}
                    setIsTimeModalOpen={setIsTimeModalOpen}
                />
            )}

            {/* ── مرحله ۳: فاکتور و پرداخت ── */}
            {view === 'payment' && (
                <PaymentSummaryView
                    doctorData={doctorData}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    activeTempReservation={activeTempReservation}
                    bookingFor={bookingFor}
                    currentUser={currentUser}
                    otherPatient={otherPatient}
                    fetchDoctorData={fetchDoctorData}
                    selectedGateway={selectedGateway}
                    setSelectedGateway={setSelectedGateway}
                    paymentError={paymentError}
                    isPaying={isPaying}
                    handleProceedToPayment={handleProceedToPayment}
                    setView={setView}
                    orderType={orderType} // <--- این پراپ اضافه شد تا نوع فاکتور (نوبت یا چت) مشخص شود
                />
            )}

            {/* ── مودال اخطار تداخل رزرو ── */}
            {showConflictModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" dir="rtl">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-center font-bold text-gray-900 text-lg mb-2">شما یک نوبت در حال انتظار دارید!</h3>
                        <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
                            شما قبلاً ساعت <strong className="text-gray-900" dir="ltr">{activeTempReservation?.start_time}</strong> را رزرو کرده‌اید که منتظر پرداخت است. آیا می‌خواهید همان نوبت را ادامه دهید یا آن را لغو کرده و نوبت <strong className="text-gray-900">{targetNewSlot?.start_time}</strong> را جایگزین کنید؟
                        </p>

                        <div className="space-y-2">
                            <Button
                                onClick={handleContinueOld}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11"
                            >
                                ادامه و پرداخت نوبت قبلی
                            </Button>
                            <Button
                                onClick={handleCancelAndNew}
                                disabled={isCanceling}
                                variant="outline"
                                className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-11"
                            >
                                {isCanceling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'لغو قبلی و انتخاب نوبت جدید'}
                            </Button>
                            <Button
                                onClick={() => setShowConflictModal(false)}
                                variant="ghost"
                                className="w-full text-gray-500 rounded-xl h-10"
                            >
                                انصراف
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── مودال انتخاب نوبت ── */}
            {isTimeModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
                    dir="rtl"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsTimeModalOpen(false); }}
                >
                    <div className="bg-white w-full sm:max-w-xl lg:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[88vh]">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2 min-w-0">
                                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span className="truncate">انتخاب نوبت مطب دکتر {doctorData.name}</span>
                            </h3>
                            <button
                                onClick={() => setIsTimeModalOpen(false)}
                                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition flex-shrink-0"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
                            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 mb-5 text-xs lg:text-sm text-blue-900 leading-relaxed flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div><strong className="font-bold">تذکر مهم:</strong> زمان انتخابی ساعت مراجعه به مطب است. زمان ملاقات با پزشک توسط منشی تعیین می‌شود.</div>
                            </div>

                            {Object.keys(availableSlots).length > 0 ? (
                                <>
                                    <div className="flex gap-2 overflow-x-auto pb-3 mb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                        {Object.keys(availableSlots).map((date) => {
                                            const slotsForDate = availableSlots[date];
                                            const isSelected = selectedDate === date;
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`flex flex-col items-center justify-center min-w-[100px] p-2.5 rounded-xl border transition-all flex-shrink-0 ${
                                                        isSelected
                                                            ? 'border-blue-600 bg-white ring-2 ring-blue-500 shadow-sm'
                                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                                                        {getShortDay(date)}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 my-1">{getShortDate(date)}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-50 text-blue-600 font-bold' : 'bg-gray-200 text-gray-600'}`}>
                                                        {slotsForDate.length} نوبت
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-gray-100">
                                        {availableSlots[selectedDate]?.map((slot) => {
                                            const isMine = slot.is_my_temp_reservation;
                                            return (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => handleSlotClick(slot)}
                                                    className={`py-2.5 rounded-xl border font-bold text-xs lg:text-sm flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 text-center
                                                        ${isMine
                                                        ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-600 hover:text-white shadow-sm ring-1 ring-pink-500'
                                                        : 'border-teal-500 bg-teal-50/40 text-teal-700 hover:bg-teal-600 hover:text-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                                        <span dir="ltr">{slot.start_time}</span>
                                                    </div>
                                                    {isMine && <span className="text-[9px] opacity-90 font-medium">رزرو شما</span>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-gray-400 text-xs font-medium">
                                    نوبت آزادی در این بازه یافت نشد.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}