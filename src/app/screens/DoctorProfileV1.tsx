// DoctorProfileV1.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import {
    Star, MapPin, Clock, Video, MessageSquare, Calendar,
    CheckCircle, Heart, Loader2, CreditCard, ShieldCheck,
    Check, ThumbsUp, Phone, ChevronRight, Info, X, User, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { AppBar } from '../components/AppBar';
import { PageLoader } from '../components/PageLoader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DoctorData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    gender: number;
    specialty_id: number;
    specialty_name: string;
    visit_price: number;
    experience: string;
    address: string;
    rating: string;
    visit_count: number;
    image_url: string;
    is_vip: boolean;
    bio: string;
    lat: number | null;
    lng: number | null;
    appointments: number;
    medical_code: string | null;
    rank: number | null;
    reviews: number;
    recommendation: number;
    city: string | null;
    province: string | null;
    tags: string[];
}

interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    datetime: string;
    status: string;
}

interface UserProfile {
    id: number;
    name: string;
    phone: string;
    national_code?: string;
}

interface ApiResponse {
    success: boolean;
    data: {
        doctor: DoctorData;
        available_slots: Record<string, TimeSlot[]>;
        stats: {
            total_slots: number;
            available_days: number;
            date_range: { start: string; end: string };
        };
    };
}

interface OtherPatient {
    fullName: string;
    nationalCode: string;
    phone: string;
}

type ViewState = 'profile' | 'patient_info' | 'payment';
type Gateway = 'saman' | 'zarinpal';

// ─── Validation helpers ───────────────────────────────────────────────────────

function isValidNationalCode(code: string): boolean {
    if (!/^\d{10}$/.test(code)) return false;
    if (/^(\d)\1{9}$/.test(code)) return false;
    const digits = code.split('').map(Number);
    const check = digits[9];
    const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0);
    const remainder = sum % 11;
    return remainder < 2 ? check === remainder : check === 11 - remainder;
}

function isValidIranPhone(phone: string): boolean {
    return /^09[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

const formatPrice = (price: number) =>
    `${new Intl.NumberFormat('fa-IR').format(price)} تومان`;

const formatDate = (dateString: string) => {
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            weekday: 'long', day: 'numeric', month: 'long',
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
};

const getShortDay = (dateString: string) => {
    try {
        return new Intl.DateTimeFormat('fa-IR', { weekday: 'long' })
            .format(new Date(dateString));
    } catch {
        return '';
    }
};

const getShortDate = (dateString: string) => {
    try {
        return new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' })
            .format(new Date(dateString));
    } catch {
        return dateString;
    }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StepperProps { step: 2 | 3 }
function Stepper({ step }: StepperProps) {
    return (
        <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute inset-x-0 top-4 h-0.5 bg-gray-200 -z-10" />
                <div
                    className="absolute right-0 top-4 h-0.5 bg-blue-600 -z-10 transition-all duration-300"
                    style={{ width: step === 2 ? '50%' : '100%' }}
                />
                <StepBubble label="ثبت نوبت" state="done" />
                <StepBubble label="اطلاعات مراجعه‌کننده" state={step >= 2 ? (step > 2 ? 'done' : 'active') : 'pending'} number="۲" />
                <StepBubble label="ایجاد حساب / پرداخت" state={step === 3 ? 'active' : 'pending'} number="۳" />
            </div>
        </div>
    );
}

type BubbleState = 'done' | 'active' | 'pending';
function StepBubble({ label, state, number }: { label: string; state: BubbleState; number?: string }) {
    const bg = state === 'pending'
        ? 'bg-white border-2 border-gray-300'
        : 'bg-blue-600';
    const text = state === 'pending' ? 'text-gray-400' : 'text-white';
    return (
        <div className="flex flex-col items-center bg-[#f8f9fa] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 shadow-sm font-bold text-xs ${bg} ${text}`}>
                {state === 'done' ? <Check className="w-4 h-4" /> : number}
            </div>
            <span className={`text-xs font-semibold ${state === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>
                {label}
            </span>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DoctorProfileV1() {
    const { accessToken } = useAuthStore();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const abortRef = useRef<AbortController | null>(null);

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
    const [bookingFor, setBookingFor] = useState<'myself' | 'other'>('myself');
    const [otherPatient, setOtherPatient] = useState<OtherPatient>({
        fullName: '', nationalCode: '', phone: '',
    });

    const [patientErrors, setPatientErrors] = useState<Partial<OtherPatient>>({});

    const [selectedGateway, setSelectedGateway] = useState<Gateway>('saman');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

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

            setSelectedSlot(null);
            setSelectedDate('');
            setView('profile');

            setDoctorData(result.data.doctor);
            const slots = result.data.available_slots ?? {};
            setAvailableSlots(slots);
            const firstDate = Object.keys(slots)[0];
            if (firstDate) setSelectedDate(firstDate);
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            setError(err instanceof Error ? err.message : 'خطای ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    }, [id, accessToken]);

    useEffect(() => {
        fetchDoctorData();
        return () => { abortRef.current?.abort(); };
    }, [fetchDoctorData]);

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

    const handleStartChat = async () => {
        if (!accessToken) { alert('لطفاً ابتدا وارد حساب کاربری خود شوید'); return; }
        setIsStartingChat(true);
        try {
            const res = await fetch('https://api.mediraai.com/api/user/chat/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ doctor_id: id }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            navigate(`/consultation/${data.room_id ?? data.data?.room_id}`);
        } catch {
            alert('خطا در برقراری ارتباط چت');
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

    const handleProceedToPayment = async () => {
        if (!selectedSlot || !accessToken) {
            if (!accessToken) alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            return;
        }

        setIsPaying(true);
        setPaymentError(null);

        const idempotencyKey = `${selectedSlot.id}-${Date.now()}`;

        const endpoint = selectedGateway === 'zarinpal'
            ? 'https://api.mediraai.com/api/user/reservations/reserve-zarinpal'
            : 'https://api.mediraai.com/api/user/reservations/reserve-saman';

        const payload: Record<string, unknown> = {
            slot_id: selectedSlot.id,
            session_id: sessionId,
            gateway: selectedGateway,
            for_other: bookingFor === 'other',
        };

        if (bookingFor === 'other') {
            payload.patient_name = otherPatient.fullName.trim();
            payload.patient_national_code = otherPatient.nationalCode;
            payload.patient_phone = otherPatient.phone.replace(/\s/g, '');
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                    'Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok || !result.success) {
                throw new Error(result.message ?? 'خطا در اتصال به درگاه پرداخت');
            }

            const paymentUrl =
                result.data?.payment?.payment_url ?? result.data?.payment_url;
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                throw new Error('آدرس درگاه پرداخت دریافت نشد');
            }
        } catch (err) {
            setPaymentError(
                err instanceof Error ? err.message : 'خطا در عملیات پرداخت'
            );
            setIsPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center bg-gray-50">
                <PageLoader />
            </div>
        );
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

    const firstAvailableDate = Object.keys(availableSlots)[0];
    const firstAvailableSlot = firstAvailableDate
        ? availableSlots[firstAvailableDate][0]
        : null;

    const displayTax = Math.round(doctorData.visit_price * 0.1);
    const displayTotal = doctorData.visit_price + displayTax;

    return (
        <div
            className="min-h-full bg-[#f8f9fa] text-gray-800 pb-28 font-[YekanBakhFaNum]"
            dir="rtl"
        >
            <AppBar backTo="/doctors" />

            {/* ══════════════════════════════════════════════════════════════════════
                مرحله ۱: پروفایل پزشک
            ══════════════════════════════════════════════════════════════════════ */}
            {view === 'profile' && (
                <div className="pt-20 pb-6 px-4 sm:px-6 lg:px-8
                        max-w-6xl xl:max-w-[1400px] mx-auto
                        flex flex-col lg:flex-row gap-6 lg:gap-8
                        animate-in fade-in duration-200">

                    {/* ستون راست (اطلاعات پزشک) */}
                    <div className="w-full lg:w-[62%] xl:w-[65%] space-y-6 order-1 lg:order-none">
                        <Card className="bg-white p-6 lg:p-7 shadow-sm border border-gray-100 rounded-2xl relative">
                            <button
                                onClick={() => setIsFavorite(f => !f)}
                                aria-label={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                                className="absolute top-4 left-4 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-50 transition"
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <img
                                    src={doctorData.image_url || 'https://placehold.co/112x112/e2e8f0/64748b?text=Dr'}
                                    alt={`دکتر ${doctorData.name}`}
                                    className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover ring-4 ring-blue-50 shadow-sm flex-shrink-0"
                                />
                                <div className="flex-1 text-center sm:text-right min-w-0">
                                    <h1 className="text-xl lg:text-2xl xl:text-3xl font-black text-gray-900 mb-1">
                                        دکتر {doctorData.name}
                                    </h1>
                                    <p className="text-blue-700 font-bold text-sm lg:text-base mb-3">
                                        {doctorData.specialty_name}
                                    </p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs lg:text-sm text-gray-500 mb-3">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{doctorData.city ?? 'تهران'}</span>
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-start gap-1 text-xs lg:text-sm text-blue-700 bg-blue-50 w-fit mx-auto sm:mx-0 px-3 py-1 rounded-full font-medium">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>کد نظام پزشکی: {doctorData.medical_code ?? '---'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 divide-x divide-x-reverse border border-gray-100 rounded-xl p-4 lg:p-5 bg-gray-50/50 mt-5">
                                <div className="text-center flex flex-col items-center">
                                    <div className="flex items-center text-amber-500 font-black text-base lg:text-lg">
                                        <span>{doctorData.rating ?? '۵.۰'}</span>
                                        <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-amber-400 mr-1" />
                                    </div>
                                    <span className="text-[11px] lg:text-xs text-gray-500 mt-0.5">
                                        ({doctorData.reviews ?? 0} نظر)
                                    </span>
                                </div>
                                <div className="text-center flex flex-col items-center">
                                    <div className="flex items-center text-emerald-600 font-black text-base lg:text-lg">
                                        <span>{doctorData.recommendation ?? 95}٪</span>
                                        <ThumbsUp className="w-4 h-4 lg:w-5 lg:h-5 mr-1" />
                                    </div>
                                    <span className="text-[11px] lg:text-xs text-gray-500 mt-0.5">پیشنهاد کاربران</span>
                                </div>
                                <div className="text-center flex flex-col items-center">
                                    <div className="flex items-center text-blue-600 font-black text-base lg:text-lg">
                                        <span>
                                            {new Intl.NumberFormat('fa-IR').format(
                                                doctorData.visit_count || doctorData.appointments || 0
                                            )}
                                        </span>
                                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-1" />
                                    </div>
                                    <span className="text-[11px] lg:text-xs text-gray-500 mt-0.5">نوبت موفق</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white p-6 lg:p-7 shadow-sm border border-gray-100 rounded-2xl space-y-3">
                            <h2 className="text-base lg:text-lg font-bold text-gray-900">
                                درباره دکتر {doctorData.name}
                            </h2>
                            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-xs lg:text-sm text-blue-900 leading-relaxed">
                                <strong className="font-bold">تذکر مهم:</strong> زمان انتخابی شما ساعت مراجعه به مطب است، نه زمان ملاقات فوری با پزشک. زمان دقیق ملاقات توسط منشی تعیین می‌شود.
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                                {doctorData.bio || 'پزشک متعهد و متخصص در تشخیص و درمان نوین بیماری‌ها.'}
                            </p>
                        </Card>
                    </div>

                    {/* ستون چپ (کارت‌های رزرو) */}
                    <div className="w-full lg:w-[38%] xl:w-[35%] space-y-4 order-2 lg:order-none">
                        {/* رزرو مطب */}
                        <Card className="bg-white p-5 lg:p-6 shadow-sm border border-gray-100 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3 text-gray-900">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-sm lg:text-base">نوبت‌دهی اینترنتی مطب</h3>
                            </div>
                            <div className="bg-gray-50 p-3.5 rounded-xl mb-4 border border-gray-100 space-y-2.5 text-xs lg:text-sm">
                                <div className="flex items-start text-gray-700">
                                    <MapPin className="w-3.5 h-3.5 ml-1.5 mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span>{doctorData.address || 'آدرس مطب ثبت نشده است'}</span>
                                </div>
                                {firstAvailableDate && (
                                    <div className="flex items-center text-gray-700 font-medium">
                                        <Clock className="w-3.5 h-3.5 ml-1.5 text-blue-600 flex-shrink-0" />
                                        <span>
                                            اولین نوبت: {getShortDay(firstAvailableDate)}{' '}
                                            {getShortDate(firstAvailableDate)}
                                            {firstAvailableSlot?.start_time &&
                                                ` - ساعت ${firstAvailableSlot.start_time}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={() => setIsTimeModalOpen(true)}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs lg:text-sm shadow flex items-center justify-center gap-1"
                            >
                                نوبت بگیرید
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </Button>
                        </Card>

                        {/* مشاوره آنلاین */}
                        <Card className="bg-white p-5 lg:p-6 shadow-sm border border-gray-100 rounded-2xl">
                            <div className="flex items-center justify-between mb-3 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    <h3 className="font-bold text-sm lg:text-base whitespace-nowrap">مشاوره آنلاین</h3>
                                </div>
                                <span className="text-xs lg:text-sm font-bold text-emerald-700 whitespace-nowrap">
                                    {formatPrice(doctorData.visit_price)}
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-500 mb-4 leading-relaxed">
                                پاسخ‌گویی سریع، ارسال تصویر آزمایش و نسخه الکترونیک
                            </p>

                            <div className="grid grid-cols-2 gap-2.5">
                                <Button
                                    onClick={handleStartChat}
                                    disabled={isStartingChat}
                                    variant="outline"
                                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50
                                               py-2.5 min-h-[42px] lg:min-h-[48px] px-3 rounded-xl
                                               text-xs lg:text-sm font-bold
                                               flex items-center justify-center gap-1.5
                                               whitespace-nowrap overflow-hidden"
                                >
                                    {isStartingChat
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                                        : <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />}
                                    <span className="truncate">چت متنی</span>
                                </Button>
                                <Button
                                    onClick={() => navigate(`/consultation/${id}`)}
                                    variant="outline"
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50
                                               py-2.5 min-h-[42px] lg:min-h-[48px] px-3 rounded-xl
                                               text-xs lg:text-sm font-bold
                                               flex items-center justify-center gap-1.5
                                               whitespace-nowrap overflow-hidden"
                                >
                                    <Video className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">تصویری</span>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
                مودال انتخاب نوبت
            ══════════════════════════════════════════════════════════════════════ */}
            {isTimeModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
                    dir="rtl"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsTimeModalOpen(false); }}
                >
                    <div
                        className="bg-white w-full sm:max-w-xl lg:max-w-2xl
                                   rounded-t-2xl sm:rounded-2xl shadow-2xl
                                   flex flex-col
                                   h-[90dvh] sm:h-auto sm:max-h-[88vh]"
                    >
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2 min-w-0">
                                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span className="truncate">انتخاب نوبت مطب دکتر {doctorData.name}</span>
                            </h3>
                            <button
                                onClick={() => setIsTimeModalOpen(false)}
                                aria-label="بستن"
                                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition flex-shrink-0"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
                            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 mb-5 text-xs lg:text-sm text-blue-900 leading-relaxed flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold">تذکر مهم:</strong> زمان انتخابی ساعت مراجعه به مطب است. زمان ملاقات با پزشک توسط منشی تعیین می‌شود.
                                </div>
                            </div>

                            {Object.keys(availableSlots).length > 0 ? (
                                <>
                                    <div
                                        className="flex gap-2 overflow-x-auto pb-3 mb-2
                                                   [-webkit-overflow-scrolling:touch]
                                                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                    >
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
                                                    <span className="text-[11px] text-gray-500 my-1">
                                                        {getShortDate(date)}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                        isSelected
                                                            ? 'bg-blue-50 text-blue-600 font-bold'
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {slotsForDate.length} نوبت
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-gray-100">
                                        {availableSlots[selectedDate]?.map((slot) => (
                                            <button
                                                key={slot.id}
                                                onClick={() => {
                                                    setSelectedSlot(slot);
                                                    setIsTimeModalOpen(false);
                                                    setView('patient_info');
                                                }}
                                                className="py-2.5 rounded-xl border border-teal-500 text-teal-700
                                                           font-bold text-xs lg:text-sm bg-teal-50/40
                                                           hover:bg-teal-600 hover:text-white
                                                           active:scale-95
                                                           transition-all text-center flex items-center justify-center gap-1"
                                            >
                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                <span dir="ltr">{slot.start_time}</span>
                                            </button>
                                        ))}
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

            {/* ══════════════════════════════════════════════════════════════════════
                مرحله ۲: اطلاعات مراجعه‌کننده
            ══════════════════════════════════════════════════════════════════════ */}
            {view === 'patient_info' && (
                <div className="pt-20 pb-6 animate-in fade-in duration-200">
                    <Stepper step={2} />
                    <div className="max-w-xl mx-auto px-4 space-y-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white flex items-center justify-between p-4 gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={doctorData.image_url}
                                    alt={doctorData.name}
                                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                        دکتر {doctorData.name}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                        {formatDate(selectedDate)} - ساعت{' '}
                                        <strong className="text-blue-700 font-mono text-xs">
                                            {selectedSlot?.start_time}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => setIsTimeModalOpen(true)}
                                className="text-xs text-blue-600 whitespace-nowrap flex-shrink-0"
                            >
                                تغییر زمان
                            </Button>
                        </Card>

                        <Card className="p-5 border-0 shadow-sm rounded-2xl bg-white space-y-4">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-blue-600" />
                                نوبت برای چه کسی ثبت می‌شود؟
                            </h3>

                            <div className="space-y-2.5">
                                <label
                                    onClick={() => setBookingFor('myself')}
                                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all gap-3 ${
                                        bookingFor === 'myself'
                                            ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-400'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">
                                            {currentUser?.name || 'خودم'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                            {currentUser?.phone || 'شماره تلفن حساب'}
                                        </p>
                                    </div>
                                    <input
                                        type="radio"
                                        readOnly
                                        checked={bookingFor === 'myself'}
                                        className="text-blue-600 flex-shrink-0"
                                    />
                                </label>

                                <label
                                    onClick={() => setBookingFor('other')}
                                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all gap-3 ${
                                        bookingFor === 'other'
                                            ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-400'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900">شخص دیگر</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            ثبت نوبت برای آشنایان یا اعضای خانواده
                                        </p>
                                    </div>
                                    <input
                                        type="radio"
                                        readOnly
                                        checked={bookingFor === 'other'}
                                        className="text-blue-600 flex-shrink-0"
                                    />
                                </label>
                            </div>

                            {bookingFor === 'other' && (
                                <div className="pt-3 border-t border-gray-100 space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            نام و نام خانوادگی بیمار:
                                        </label>
                                        <input
                                            type="text"
                                            value={otherPatient.fullName}
                                            onChange={(e) => {
                                                setOtherPatient(p => ({ ...p, fullName: e.target.value }));
                                                setPatientErrors(err => ({ ...err, fullName: undefined }));
                                            }}
                                            placeholder="مثال: سارا محمدی"
                                            className={`w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                                                patientErrors.fullName ? 'border-red-400' : ''
                                            }`}
                                        />
                                        {patientErrors.fullName && (
                                            <p className="text-red-500 text-[11px] mt-1">{patientErrors.fullName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            کد ملی بیمار:
                                        </label>
                                        <input
                                            type="text"
                                            dir="ltr"
                                            maxLength={10}
                                            inputMode="numeric"
                                            value={otherPatient.nationalCode}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/\D/g, '');
                                                setOtherPatient(p => ({ ...p, nationalCode: v }));
                                                setPatientErrors(err => ({ ...err, nationalCode: undefined }));
                                            }}
                                            placeholder="1234567890"
                                            className={`w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                                                patientErrors.nationalCode ? 'border-red-400' : ''
                                            }`}
                                        />
                                        {patientErrors.nationalCode && (
                                            <p className="text-red-500 text-[11px] mt-1">{patientErrors.nationalCode}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            شماره تماس بیمار:
                                        </label>
                                        <input
                                            type="tel"
                                            dir="ltr"
                                            inputMode="numeric"
                                            value={otherPatient.phone}
                                            onChange={(e) => {
                                                setOtherPatient(p => ({ ...p, phone: e.target.value }));
                                                setPatientErrors(err => ({ ...err, phone: undefined }));
                                            }}
                                            placeholder="09123456789"
                                            className={`w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                                                patientErrors.phone ? 'border-red-400' : ''
                                            }`}
                                        />
                                        {patientErrors.phone && (
                                            <p className="text-red-500 text-[11px] mt-1">{patientErrors.phone}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setView('profile')}
                                    className="w-1/3 rounded-xl h-11 text-xs"
                                >
                                    بازگشت
                                </Button>
                                <Button
                                    onClick={() => { if (validatePatient()) setView('payment'); }}
                                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-bold"
                                >
                                    مرحله بعد (پرداخت)
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
                مرحله ۳: فاکتور و پرداخت
            ══════════════════════════════════════════════════════════════════════ */}
            {view === 'payment' && (
                <div className="pt-20 pb-6 animate-in fade-in duration-200">
                    <Stepper step={3} />
                    <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-5">

                        <div className="w-full md:w-1/2 space-y-4 order-1 md:order-none">
                            <div className="bg-amber-50 text-amber-900 p-3.5 rounded-xl border border-amber-200 flex items-start gap-2 text-xs font-medium">
                                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <span>نوبت شما هنوز قطعی نشده؛ برای تکمیل فرآیند روی دکمه پرداخت کلیک کنید.</span>
                            </div>

                            <Card className="bg-white p-5 shadow-sm border-0 rounded-2xl space-y-3 text-xs">
                                <h3 className="font-bold text-gray-900 text-sm border-b pb-2">خلاصه اطلاعات نوبت</h3>
                                {[
                                    ['پزشک معالج', `دکتر ${doctorData.name}`],
                                    ['تخصص', doctorData.specialty_name],
                                    ['نوع ویزیت', 'حضوری در مطب'],
                                    ['زمان نوبت', `${formatDate(selectedDate)} - ${selectedSlot?.start_time}`],
                                    ['بیمار', bookingFor === 'myself' ? (currentUser?.name ?? 'حساب اصلی') : otherPatient.fullName],
                                    ['آدرس', doctorData.address],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between gap-3 py-1">
                                        <span className="text-gray-500 flex-shrink-0">{label}:</span>
                                        <span className="font-medium text-gray-800 text-left max-w-[220px] truncate">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </Card>

                            <Card className="bg-emerald-50/60 p-4 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold mb-1">با اطمینان نوبت خود را ثبت کنید</h4>
                                    <p className="text-emerald-700 text-[11px] leading-relaxed">
                                        بازگشت ۱۰۰٪ وجه در صورت عدم حضور پزشک یا لغو نوبت تا ۲۴ ساعت قبل از ویزیت.
                                    </p>
                                </div>
                            </Card>
                        </div>

                        <div className="w-full md:w-1/2 space-y-4 order-2 md:order-none">
                            <Card className="bg-white p-5 shadow-sm border-0 rounded-2xl space-y-4">
                                <h3 className="font-bold text-xs sm:text-sm text-gray-900 border-b border-gray-100 pb-2.5">
                                    جزئیات پرداخت
                                </h3>

                                <div className="space-y-2.5 text-xs text-gray-600">
                                    <div className="flex justify-between">
                                        <span>هزینه ویزیت:</span>
                                        <span className="font-bold text-gray-900">
                                            {formatPrice(doctorData.visit_price)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>۱۰٪ مالیات بر ارزش افزوده (تخمینی):</span>
                                        <span>{formatPrice(displayTax)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-sm text-gray-900">
                                        <span>مبلغ تقریبی:</span>
                                        <span className="text-blue-700 font-extrabold">
                                            {formatPrice(displayTotal)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                        * مبلغ نهایی پس از اتصال به درگاه توسط سرور تأیید می‌شود.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        درگاه پرداخت:
                                    </label>
                                    <select
                                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={selectedGateway}
                                        onChange={(e) => setSelectedGateway(e.target.value as Gateway)}
                                    >
                                        <option value="saman">پرداخت آنلاین با کارت بانکی (سامان - سپ)</option>
                                        <option value="zarinpal">زرین‌پال</option>
                                    </select>
                                </div>

                                {paymentError && (
                                    <div className="text-red-600 text-xs text-center bg-red-50 p-3 rounded-xl border border-red-100">
                                        {paymentError}
                                    </div>
                                )}

                                <div className="pt-2 flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setView('patient_info')}
                                        className="w-1/3 rounded-xl h-11 text-xs"
                                    >
                                        بازگشت
                                    </Button>
                                    <Button
                                        onClick={handleProceedToPayment}
                                        disabled={isPaying}
                                        className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-bold shadow flex items-center justify-center gap-1.5"
                                    >
                                        {isPaying
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <CreditCard className="w-4 h-4" />}
                                        پرداخت و ثبت نوبت
                                    </Button>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}