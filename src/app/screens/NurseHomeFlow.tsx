import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useWizardStep } from "../navigation/appHistory";
import { AppBar } from "../components/AppBar";
import { CardGridSkeleton } from "../components/PageSkeleton";
import { Button } from "../components/ui/button";
import { AddressSelector } from "../components/AddressSelector"; // <--- کامپوننت مجزای آدرس
import {
    ProviderDetailsDialog,
    type ProviderDetails,
} from "../components/ProviderDetailsDialog";
import {
    Syringe,
    Bandage,
    UserRound,
    Baby,
    Dumbbell,
    HeartHandshake,
    Check,
    ListChecks,
    MapPin,
    ArrowLeft,
    PartyPopper,
    Users,
    Zap,
    Home as HomeIcon,
    Building2,
    Star,
    Loader2,
    Info,
    CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = "https://api.mediraai.com/api/user";

// نگاشت آیکون‌ها بر اساس slug خدمات دریافتی از دیتابیس
const getServiceIcon = (slug: string) => {
    const icons: Record<string, any> = {
        'injection': Syringe,
        'wound': Bandage,
        'elderly': UserRound,
        'baby': Baby,
        'physio': Dumbbell
    };
    return icons[slug] || HeartHandshake;
};

const getClinicDetails = (
    clinic: any,
    selectedServices: { name: string; price?: number }[],
): ProviderDetails => {
    const seed = Number(clinic.id || 0) % 4;
    const phones = ["۰۵۱-۳۷۲۰ ۱۱۲۲", "۰۵۱-۳۸۴۱ ۲۲۳۳", "۰۵۱-۳۷۶۸ ۴۴۵۵", "۰۵۱-۳۸۵۰ ۶۶۷۷"];
    const hours = ["۸ صبح تا ۸ شب", "۷ صبح تا ۹ شب", "شبانه‌روزی", "۸ صبح تا ۱۰ شب"];
    const descriptions = [
        "درمانگاه ارائه‌دهنده خدمات پرستاری در منزل با پرسنل مجرب و امکان اعزام سریع.",
        "مرکز مراقبت در منزل با پوشش تزریقات، پانسمان و مراقبت سالمندان در محدوده شهری.",
        "درمانگاه همکار با امکان انتخاب جنسیت پرستار و هماهنگی زمان مراجعه.",
        "ارائه‌دهنده خدمات پرستاری تخصصی در منزل با پشتیبانی و پیگیری پس از مراجعه.",
    ];
    const reviewsPool = [
        [
            { name: "مریم احمدی", date: "۱۲ تیر ۱۴۰۵", rating: 5, comment: "پرستار به‌موقع رسید و بسیار حرفه‌ای بود." },
            { name: "علی رضایی", date: "۲۸ خرداد ۱۴۰۵", rating: 4, comment: "خدمات خوب و هماهنگی مناسب بود." },
        ],
        [
            { name: "زهرا کریمی", date: "۹ تیر ۱۴۰۵", rating: 5, comment: "از کیفیت مراقبت و رفتار پرستار راضی بودم." },
            { name: "رضا محمدی", date: "۲۰ خرداد ۱۴۰۵", rating: 5, comment: "اعزام سریع و خدمات کامل داشتند." },
        ],
        [
            { name: "سارا حسینی", date: "۵ تیر ۱۴۰۵", rating: 4, comment: "همه چیز مرتب بود، فقط کمی در هماهنگی تأخیر داشت." },
            { name: "امیر جعفری", date: "۱۶ خرداد ۱۴۰۵", rating: 4, comment: "پرستار دقیق و دلسوز بود." },
        ],
        [
            { name: "نرگس صادقی", date: "۲ تیر ۱۴۰۵", rating: 5, comment: "خدمات در منزل عالی و بدون دردسر انجام شد." },
            { name: "حسین مرادی", date: "۱۰ خرداد ۱۴۰۵", rating: 4, comment: "پشتیبانی خوب و هزینه شفاف بود." },
        ],
    ];

    return {
        name: clinic.name,
        address: clinic.address || "آدرس ثبت نشده",
        description: descriptions[seed],
        hours: clinic.work_hours || hours[seed],
        phone: clinic.phone || phones[seed],
        rating: Number(clinic.rating) || [4.8, 4.9, 4.6, 4.7][seed],
        reviews: Number(clinic.reviews_count) || [156, 132, 98, 114][seed],
        lat: clinic.lat ?? null,
        lng: clinic.lng ?? null,
        services:
            selectedServices.length > 0
                ? selectedServices.map((service) => ({
                    name: service.name,
                    price: service.price ?? (Number(clinic.total_estimated_price) || 0),
                }))
                : [{ name: "خدمات پرستاری در منزل", price: Number(clinic.total_estimated_price) || 0 }],
        recentReviews: reviewsPool[seed],
    };
};

const genderOptions: { value: "any" | "female" | "male"; label: string }[] = [
    { value: "any", label: "فرقی ندارد" },
    { value: "female", label: "پرستار خانم" },
    { value: "male", label: "پرستار آقا" },
];

const stepsData = [
    { id: 1, title: "نوع خدمت", icon: ListChecks },
    { id: 2, title: "اطلاعات بیمار", icon: MapPin },
    { id: 3, title: "انتخاب درمانگاه", icon: Building2 },
];

export function NurseHomeFlow() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    const [step, setStep] = useWizardStep(1);
    const [submitted, setSubmitted] = useState(false);

    // Data states
    const [servicesList, setServicesList] = useState<any[]>([]);
    const [clinicsList, setClinicsList] = useState<any[]>([]);

    // Loading states
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [isLoadingClinics, setIsLoadingClinics] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [genderPref, setGenderPref] = useState<"any" | "female" | "male">("any");

    // فیلد آدرس
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [condition, setCondition] = useState("");
    const [urgent, setUrgent] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
    const [clinicDetails, setClinicDetails] = useState<ProviderDetails | null>(null);

    // مرحله ۱: دریافت خدمات از API
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/medical/services`, {
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                const json = await response.json();
                if (json.success) {
                    setServicesList(json.data);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setIsLoadingServices(false);
            }
        };

        if (accessToken) {
            fetchServices();
        }
    }, [accessToken]);

    // مرحله ۳: واکشی درمانگاه‌ها هنگام رفتن به استپ ۳
    const fetchClinicsAndProceed = async () => {
        setIsLoadingClinics(true);
        try {
            const response = await fetch(`${API_BASE_URL}/medical/centers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({ service_ids: selectedServices })
            });
            const json = await response.json();
            if (json.success) {
                setClinicsList(json.data);
                setStep(3);
                // ریست کردن کلینیک انتخابی قبلی اگر کاربر به مراحل قبل برگشته باشد
                setSelectedClinic(null);
            }
        } catch (error) {
            console.error("Error fetching clinics:", error);
        } finally {
            setIsLoadingClinics(false);
        }
    };

    // ثبت نهایی درخواست و هدایت به درگاه
    const submitFinalRequest = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/medical/requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    medical_center_id: selectedClinic,
                    service_ids: selectedServices,
                    gender_pref: genderPref,
                    condition: condition,
                    is_urgent: urgent ? 1 : 0,
                    user_address_id: selectedAddressId, // <--- ارسال شناسه آدرس
                    time_type_id: 1 // فرض بر بازه زمانی پیش‌فرض
                })
            });
            const json = await response.json();

            if (json.success && json.data && json.data.payment_url) {
                // هدایت مستقیم کاربر به درگاه پرداخت
                window.location.href = json.data.payment_url;
            } else {
                alert("خطا در ثبت درخواست: " + (json.message || "لطفاً مجدداً تلاش کنید"));
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error submitting request:", error);
            setIsSubmitting(false);
            alert("خطا در ارتباط با سرور");
        }
    };

    const toggleService = (id: number) => {
        setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    };

    const selectedServiceItems = servicesList.filter((s) => selectedServices.includes(s.id));
    const clinic = clinicsList.find((c) => c.id === selectedClinic) ?? null;

    // استخراج قیمت نهایی کلینیک انتخاب شده از API
    const finalPrice = clinic ? parseFloat(clinic.total_estimated_price) : 0;

    const openClinicDetails = (clinicItem: any) => {
        const total = Number(clinicItem.total_estimated_price) || 0;
        const items = selectedServiceItems.map((service) => ({
            name: service.name,
            price:
                selectedServiceItems.length > 0
                    ? Math.round(total / selectedServiceItems.length)
                    : total,
        }));
        setClinicDetails(getClinicDetails(clinicItem, items));
    };

    // بررسی تکمیل بودن مرحله ۲ بر اساس نوشتن شرح حال (آدرس دیگر در مرحله ۱ بررسی می‌شود)
    const isStep2Valid = condition.trim().length > 0;
    const isStep3Valid = selectedClinic !== null;

    if (submitted) {
        return (
            <div className="flex h-[100dvh] flex-col bg-gradient-to-b from-rose-50 to-white text-right font-[YekanBakhFaNum]" dir="rtl">
                <AppBar backTo="/services" />
                <div className="flex flex-1 flex-col items-center justify-center px-6 pt-20">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-200">
                        <PartyPopper className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="mb-2 text-xl font-black text-slate-800">درخواست شما ثبت شد</h1>
                    <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-slate-500">
                        درخواست پرستار در منزل شما برای <span className="font-bold text-slate-700">{clinic?.name}</span> ثبت شد. به‌محض تخصیص پرستار، مشخصات و زمان دقیق مراجعه برای شما پیامک می‌شود.
                    </p>
                    <Button
                        className="h-12 rounded-2xl bg-rose-600 px-8 text-white hover:bg-rose-700"
                        onClick={() => navigate("/services")}
                    >
                        بازگشت به خدمات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-rose-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/services" />

            <div className="relative z-10 px-5 pb-4 pt-24 text-right sm:px-6">

                {/* ---------- فراخوانی کامپوننت مجزای آدرس در بالای صفحه ---------- */}
                <AddressSelector
                    selectedAddressId={selectedAddressId}
                    onSelect={setSelectedAddressId}
                />
                {/* ---------------------------------------------------------------- */}

                <div className="mb-8 mt-6 shrink-0">
                    <div className="mb-6 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 shadow-lg shadow-rose-200">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                            <HomeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-lg font-black tracking-tight text-white">درخواست پرستار در منزل</h1>
                            <p className="mt-0.5 text-[11px] text-white/80">
                                مرحله {step} از {stepsData.length} · {stepsData[step - 1].title}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-black text-white ring-1 ring-white/25">
                            {step}/{stepsData.length}
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between px-2">
                        <div className="absolute left-6 right-6 top-5 -z-10 h-1 overflow-hidden rounded-full bg-rose-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-l from-rose-500 to-pink-600 transition-all duration-500 ease-out"
                                style={{ width: `${((step - 1) / (stepsData.length - 1)) * 100}%`, marginRight: "auto" }}
                            />
                        </div>
                        {stepsData.map((s) => {
                            const isCompleted = step > s.id;
                            const isCurrent = step === s.id;
                            const StepIcon = isCompleted ? Check : s.icon;
                            return (
                                <div key={s.id} className="z-10 flex flex-col items-center gap-2 bg-transparent">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                            isCompleted
                                                ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200"
                                                : isCurrent
                                                    ? "scale-110 border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-200 ring-4 ring-white"
                                                    : "border-rose-200 bg-white text-rose-300 ring-4 ring-white"
                                        }`}
                                    >
                                        <StepIcon className={`h-5 w-5 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
                                    </div>
                                    <span
                                        className={`text-[11px] font-bold transition-colors duration-300 ${
                                            isCompleted ? "text-emerald-600" : isCurrent ? "text-rose-700" : "text-slate-400"
                                        }`}
                                    >
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-1 flex-col pb-4">
                    {/* STEP 1: Service type */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col duration-500">
                            <h2 className="mb-1 text-lg font-bold text-slate-800">نوع خدمات مورد نیاز را انتخاب کنید</h2>
                            <p className="mb-4 text-xs text-slate-500">می‌توانید بیش از یک خدمت انتخاب کنید</p>

                            {isLoadingServices ? (
                                <CardGridSkeleton count={6} />
                            ) : (
                                <div className="mb-6 grid grid-cols-2 gap-3">
                                    {servicesList.map((svc) => {
                                        const isSelected = selectedServices.includes(svc.id);
                                        const Icon = getServiceIcon(svc.slug);
                                        return (
                                            <div
                                                key={svc.id}
                                                onClick={() => toggleService(svc.id)}
                                                className={`flex h-full cursor-pointer flex-col rounded-3xl border-2 p-4 transition-all ${
                                                    isSelected ? "border-rose-500 bg-rose-50/80 shadow-sm" : "border-slate-100 bg-white shadow-sm hover:border-rose-200"
                                                }`}
                                            >
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className={`rounded-2xl p-2.5 ${isSelected ? "bg-rose-600" : "bg-rose-50"}`}>
                                                        <Icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-rose-600"}`} />
                                                    </div>
                                                    <div
                                                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                                            isSelected ? "border-rose-600 bg-rose-600" : "border-slate-200"
                                                        }`}
                                                    >
                                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                                    </div>
                                                </div>

                                                <h3 className="mt-2 text-sm font-bold text-slate-800">{svc.name}</h3>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Patient info */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col duration-500">
                            <h2 className="mb-4 text-lg font-bold text-slate-800">اطلاعات بیمار</h2>

                            <div className="mb-5">
                                <label className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold text-slate-600">
                                    <Users className="h-3.5 w-3.5" />
                                    ترجیح جنسیت پرستار
                                </label>
                                <div className="flex rounded-2xl border border-rose-50 bg-white p-1.5 shadow-sm">
                                    {genderOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setGenderPref(opt.value)}
                                            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                                                genderPref === opt.value ? "bg-rose-50 text-rose-700" : "text-slate-500"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="mb-2 block px-1 text-xs font-bold text-slate-600">شرح وضعیت بیمار</label>
                                <textarea
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    rows={3}
                                    placeholder="سن بیمار، شرایط حرکتی و نکات لازم برای پرستار را بنویسید"
                                    className="w-full resize-none rounded-2xl border border-rose-100 bg-white p-4 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500"
                                />
                            </div>

                            <button
                                onClick={() => setUrgent((v) => !v)}
                                className={`mb-5 flex items-center justify-between rounded-2xl border-2 p-4 shadow-sm transition-all ${
                                    urgent ? "border-rose-500 bg-rose-50/80" : "border-slate-100 bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Zap className={`h-5 w-5 ${urgent ? "text-rose-600" : "text-slate-400"}`} />
                                    <div className="text-right">
                                        <span className="block text-sm font-semibold text-slate-700">درخواست فوری</span>
                                        <span className="text-[11px] text-slate-400">اعزام پرستار در کمتر از ۲ ساعت</span>
                                    </div>
                                </div>
                                <div className={`relative h-6 w-11 rounded-full transition-colors ${urgent ? "bg-rose-500" : "bg-slate-200"}`}>
                                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${urgent ? "right-0.5" : "right-5"}`} />
                                </div>
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Clinic selection + summary */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col duration-500">
                            <h2 className="mb-1 text-lg font-bold text-slate-800">درمانگاه ارائه‌دهنده خدمت را انتخاب کنید</h2>
                            <p className="mb-4 text-xs text-slate-500">لیست درمانگاه‌هایی که خدمات انتخابی را ارائه می‌دهند</p>

                            {clinicsList.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                                    درمانگاهی برای خدمات انتخابی یافت نشد.
                                </div>
                            ) : (
                                <div className="mb-6 flex flex-col gap-3">
                                    {clinicsList.map((c) => {
                                        const isSelected = selectedClinic === c.id;
                                        return (
                                            <div
                                                key={c.id}
                                                className={`rounded-3xl border-2 p-4 shadow-sm transition-all ${
                                                    isSelected ? "border-rose-500 bg-rose-50/80" : "border-slate-100 bg-white hover:border-rose-200"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isSelected ? "bg-rose-600" : "bg-rose-50"}`}>
                                                        <Building2 className={`h-5 w-5 ${isSelected ? "text-white" : "text-rose-600"}`} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h3 className="truncate text-sm font-bold text-slate-800">{c.name}</h3>
                                                            <div
                                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                                    isSelected ? "border-rose-600 bg-rose-600" : "border-slate-200"
                                                                }`}
                                                            >
                                                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                                            </div>
                                                        </div>
                                                        <p className="mt-1 truncate text-[11px] text-slate-500">{c.address}</p>
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                <span className="font-bold text-slate-700">۵.۰</span>
                                                            </div>
                                                            <div className="text-[12px] font-bold text-rose-600">
                                                                {parseFloat(c.total_estimated_price).toLocaleString("fa-IR")} تومان
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                                                    <Button
                                                        type="button"
                                                        onClick={() => setSelectedClinic(c.id)}
                                                        className={`h-10 rounded-full text-xs font-bold transition-all ${
                                                            isSelected
                                                                ? "bg-rose-700 text-white shadow-md shadow-rose-200 hover:bg-rose-800"
                                                                : "bg-gradient-to-l from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200 hover:from-rose-600 hover:to-pink-700"
                                                        }`}
                                                    >
                                                        {isSelected ? (
                                                            <>
                                                                <CheckCircle2 className="ml-1.5 h-4 w-4" />
                                                                انتخاب شده
                                                            </>
                                                        ) : (
                                                            "انتخاب درمانگاه"
                                                        )}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => openClinicDetails(c)}
                                                        className="h-10 rounded-full border-rose-200 bg-white text-xs font-bold text-rose-700 shadow-sm hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800"
                                                    >
                                                        <Info className="ml-1.5 h-4 w-4" />
                                                        جزئیات درمانگاه
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedClinic && (
                                <div className="animate-in fade-in zoom-in space-y-3 rounded-3xl border border-rose-50 bg-white p-5 shadow-sm duration-300">
                                    <div className="flex items-start justify-between gap-3 text-sm">
                                        <span className="shrink-0 text-slate-500">خدمات انتخابی</span>
                                        <span className="text-left font-bold leading-relaxed text-slate-800">
                                            {selectedServiceItems.map((s) => s.name).join("، ")}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
                                        <span className="text-slate-500">ترجیح جنسیت</span>
                                        <span className="font-bold text-slate-800">
                                            {genderOptions.find((g) => g.value === genderPref)?.label}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between pt-2">
                                        <span className="text-sm font-bold text-slate-800">مبلغ قابل پرداخت</span>
                                        <div className="text-left">
                                            <span className="text-2xl font-black tracking-tight text-rose-600">
                                                {finalPrice.toLocaleString("fa-IR")}
                                            </span>
                                            <span className="mr-1 text-xs text-slate-500">تومان</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="sticky bottom-0 z-10 mt-auto bg-gradient-to-t from-white via-white/95 to-transparent pb-2 pt-6">
                    <div className="flex items-center justify-center gap-3">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                className="h-12 w-12 shrink-0 rounded-full border-rose-100 bg-white p-0 text-rose-600 shadow-md shadow-rose-100/80 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => setStep(step - 1)}
                                disabled={isLoadingClinics || isSubmitting}
                            >
                                <ArrowLeft className="h-5 w-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button
                                className="flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-10 text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition-all hover:shadow-xl hover:shadow-rose-600/40"
                                disabled={selectedServices.length === 0 || isLoadingServices || !selectedAddressId}
                                onClick={() => setStep(2)}
                            >
                                مرحله بعد
                                {selectedServices.length > 0 && ` (${selectedServices.length.toLocaleString("fa-IR")} مورد)`}
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-10 text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition-all hover:shadow-xl hover:shadow-rose-600/40"
                                disabled={!isStep2Valid || isLoadingClinics}
                                onClick={fetchClinicsAndProceed}
                            >
                                {isLoadingClinics && <Loader2 className="h-4 w-4 animate-spin" />}
                                مرحله بعد
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}

                        {step === 3 && (
                            <Button
                                className="flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-10 text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition-all hover:shadow-xl hover:shadow-rose-600/40"
                                disabled={!isStep3Valid || isSubmitting}
                                onClick={submitFinalRequest}
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                ثبت نهایی درخواست
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <ProviderDetailsDialog
                key={clinicDetails?.name ?? "clinic-details"}
                open={clinicDetails !== null}
                onOpenChange={(open) => {
                    if (!open) setClinicDetails(null);
                }}
                details={clinicDetails}
                accent="rose"
                infoTitle="اطلاعات درمانگاه"
                servicesTitle="خدمات پرستاری"
                servicesIcon={HeartHandshake}
                reviewPlaceholder="نظر خود را درباره خدمات این درمانگاه بنویسید"
            />
        </div>
    );
}