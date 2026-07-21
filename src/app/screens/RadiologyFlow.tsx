import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AppBar } from "../components/AppBar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { LocationMap } from "../components/LocationMap";
import {
    UploadCloud,
    FileText,
    Check,
    ScanLine,
    Radiation,
    Waves,
    Bone,
    Brain,
    Camera,
    ArrowLeft,
    CheckCircle2,
    X,
    AlertTriangle,
    PartyPopper,
    ClipboardList,
    MapPin,
    Building2,
    Star,
    Info,
    Clock3,
    Smartphone,
    MessageCircleMore,
} from "lucide-react";

const mockExams = [
    { id: 1, name: "رادیوگرافی ساده", desc: "عکس‌برداری ساده (X-Ray)", price: 180000, icon: Radiation },
    { id: 2, name: "سونوگرافی", desc: "تصویربرداری با امواج صوتی", price: 320000, icon: Waves },
    { id: 3, name: "سی‌تی‌اسکن", desc: "برش‌نگاری کامپیوتری (CT)", price: 950000, icon: ScanLine },
    { id: 4, name: "ام‌آر‌آی (MRI)", desc: "تصویربرداری رزونانس مغناطیسی", price: 1850000, icon: Brain },
    { id: 5, name: "ماموگرافی", desc: "بررسی تخصصی سینه", price: 480000, icon: Camera },
    { id: 6, name: "دانسیتومتری استخوان", desc: "سنجش تراکم استخوان", price: 550000, icon: Bone },
];

const imagingCenters = [
    {
        id: 1,
        name: "مرکز تصویربرداری پارسیان",
        city: "مشهد",
        address: "بلوار وکیل‌آباد، نبش وکیل‌آباد ۳۰",
        rating: 4.9,
        reviews: 289,
        distanceKm: 2.4,
        hours: "۷ صبح تا ۱۰ شب",
        phone: "۰۵۱-۳۸۸۰ ۱۱۲۲",
        lat: 36.3192,
        lng: 59.5184,
        description: "مرکز مجهز تصویربرداری تشخیصی با دستگاه‌های MRI، CT و سونوگرافی پیشرفته و امکان نوبت‌دهی سریع.",
        recentReviews: [
            { name: "مریم احمدی", date: "۱۲ تیر ۱۴۰۵", rating: 5, comment: "نوبت‌دهی منظم بود و کیفیت تصاویر عالی بود." },
            { name: "علی رضایی", date: "۲۸ خرداد ۱۴۰۵", rating: 5, comment: "پرسنل حرفه‌ای و محیط تمیز و آرام داشتند." },
        ],
    },
    {
        id: 2,
        name: "مرکز تصویربرداری نور",
        city: "مشهد",
        address: "خیابان احمدآباد، پلاک ۵۵",
        rating: 4.7,
        reviews: 198,
        distanceKm: 3.8,
        hours: "۸ صبح تا ۹ شب",
        phone: "۰۵۱-۳۸۴۵ ۲۲۳۳",
        lat: 36.2991,
        lng: 59.5795,
        description: "ارائه‌دهنده خدمات رادیوگرافی، سونوگرافی و سی‌تی‌اسکن با گزارش‌دهی سریع توسط متخصصین رادیولوژی.",
        recentReviews: [
            { name: "زهرا کریمی", date: "۹ تیر ۱۴۰۵", rating: 5, comment: "نتیجه MRI سریع آماده شد و راهنمایی کاملی دادند." },
            { name: "رضا محمدی", date: "۲۰ خرداد ۱۴۰۵", rating: 4, comment: "خدمات خوب بود، فقط کمی شلوغ بود." },
        ],
    },
    {
        id: 3,
        name: "مرکز تصویربرداری رازی",
        city: "مشهد",
        address: "بلوار سجاد، نبش سجاد ۹",
        rating: 4.8,
        reviews: 176,
        distanceKm: 5.0,
        hours: "۷:۳۰ صبح تا ۱۱ شب",
        phone: "۰۵۱-۳۷۶۰ ۴۴۵۵",
        lat: 36.3211,
        lng: 59.5462,
        description: "مرکز تخصصی تصویربرداری با پوشش خدمات ماموگرافی، دانسیتومتری و MRI و پذیرش نسخه‌های الکترونیک.",
        recentReviews: [
            { name: "سارا حسینی", date: "۵ تیر ۱۴۰۵", rating: 5, comment: "هماهنگی نوبت عالی و برخورد پرسنل بسیار خوب بود." },
            { name: "امیر جعفری", date: "۱۶ خرداد ۱۴۰۵", rating: 4, comment: "کیفیت خدمات مناسب و هزینه شفاف بود." },
        ],
    },
    {
        id: 4,
        name: "مرکز تصویربرداری کوثر",
        city: "مشهد",
        address: "میدان راهنمایی، ابتدای کوهسنگی",
        rating: 4.6,
        reviews: 134,
        distanceKm: 6.5,
        hours: "۸ صبح تا ۸ شب",
        phone: "۰۵۱-۳۸۵۲ ۶۶۷۷",
        lat: 36.2882,
        lng: 59.5615,
        description: "مرکز تصویربرداری با تجهیزات به‌روز، فضای آرام برای بیماران و امکان پیگیری آنلاین نتایج.",
        recentReviews: [
            { name: "نرگس صادقی", date: "۲ تیر ۱۴۰۵", rating: 5, comment: "سونوگرافی دقیق و گزارش‌دهی سریع داشتند." },
            { name: "حسین مرادی", date: "۱۰ خرداد ۱۴۰۵", rating: 4, comment: "محیط مرتب و کارکنان خوش‌برخورد بودند." },
        ],
    },
];

const stepsData = [
    { id: 1, title: "نسخه", icon: FileText },
    { id: 2, title: "خدمات", icon: ScanLine },
    { id: 3, title: "ملاحظات", icon: ClipboardList },
    { id: 4, title: "انتخاب مرکز", icon: Building2 },
];

export function RadiologyFlow() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    const [prescriptionType, setPrescriptionType] = useState<"digital" | "paper">("digital");
    const [digitalCode, setDigitalCode] = useState("");
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);

    const [selectedExams, setSelectedExams] = useState<number[]>([]);

    const [isPregnant, setIsPregnant] = useState<"yes" | "no" | "">("");
    const [hasMetalImplant, setHasMetalImplant] = useState<"yes" | "no" | "">("");
    const [contrastAllergy, setContrastAllergy] = useState<"yes" | "no" | "">("");
    const [medicalNote, setMedicalNote] = useState("");
    const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
    const [centerDetails, setCenterDetails] = useState<(typeof imagingCenters)[number] | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const toggleExam = (id: number) => {
        setSelectedExams((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    };

    const openCenterDetails = (centerItem: (typeof imagingCenters)[number]) => {
        setReviewRating(0);
        setReviewText("");
        setReviewSubmitted(false);
        setCenterDetails(centerItem);
    };

    const submitReview = () => {
        if (reviewRating === 0 || reviewText.trim().length === 0) return;
        setReviewSubmitted(true);
    };

    const selectedItems = mockExams.filter((t) => selectedExams.includes(t.id));
    const totalPrice = selectedItems.reduce((sum, t) => sum + t.price, 0);
    const includesMRI = selectedItems.some((t) => t.name.includes("ام‌آر‌آی"));
    const center = imagingCenters.find((c) => c.id === selectedCenter) ?? null;

    const isStep1Valid = prescriptionType === "digital" ? digitalCode.trim().length > 0 : !!prescriptionFile;
    const isStep3Valid = isPregnant !== "" && contrastAllergy !== "" && (!includesMRI || hasMetalImplant !== "");
    const isStep4Valid = selectedCenter !== null;

    if (submitted) {
        return (
            <div className="h-[100dvh] bg-gradient-to-b from-violet-50 to-white text-right font-[YekanBakhFaNum] flex flex-col" dir="rtl">
                <AppBar backTo="/services" />
                <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200">
                        <PartyPopper className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="mb-2 text-xl font-black text-slate-800">نوبت شما ثبت شد</h1>
                    <p className="mb-8 max-w-sm text-center text-sm text-slate-500 leading-relaxed">
                        درخواست تصویربرداری شما برای <span className="font-bold text-slate-700">{center?.name}</span> ثبت شد. آدرس مرکز و یادآوری نوبت پیش از موعد برای شما پیامک می‌شود.
                    </p>
                    <Button
                        className="rounded-2xl h-12 px-8 bg-violet-600 text-white hover:bg-violet-700"
                        onClick={() => navigate("/services")}
                    >
                        بازگشت به خدمات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-violet-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/services" />

            <div className="relative z-10 px-5 pt-24 pb-4 text-right sm:px-6">
                <div className="mb-8 shrink-0">
                    <div className="mb-6 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 p-4 shadow-lg shadow-violet-200">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                            <ScanLine className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-lg font-black tracking-tight text-white">نوبت تصویربرداری</h1>
                            <p className="mt-0.5 text-[11px] text-white/80">
                                مرحله {step} از {stepsData.length} · {stepsData[step - 1].title}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-black text-white ring-1 ring-white/25">
                            {step}/{stepsData.length}
                        </div>
                    </div>

                    <div className="relative flex justify-between items-center px-1">
                        <div className="absolute top-5 left-5 right-5 -z-10 h-1 overflow-hidden rounded-full bg-violet-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-l from-violet-500 to-indigo-600 transition-all duration-500 ease-out"
                                style={{ width: `${((step - 1) / (stepsData.length - 1)) * 100}%`, marginRight: "auto" }}
                            />
                        </div>
                        {stepsData.map((s) => {
                            const isCompleted = step > s.id;
                            const isCurrent = step === s.id;
                            const StepIcon = isCompleted ? Check : s.icon;
                            return (
                                <div key={s.id} className="z-10 flex flex-col items-center gap-1.5 bg-transparent">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                            isCompleted
                                                ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200"
                                                : isCurrent
                                                    ? "scale-110 bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 ring-4 ring-white"
                                                    : "bg-white border-violet-200 text-violet-300 ring-4 ring-white"
                                        }`}
                                    >
                                        <StepIcon className={`w-4 h-4 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold transition-colors duration-300 ${
                                            isCompleted ? "text-violet-700" : isCurrent ? "text-violet-700" : "text-slate-400"
                                        }`}
                                    >
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 flex flex-col pb-4">
                    {/* STEP 1: Prescription */}
                    {step === 1 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex bg-white shadow-sm p-1.5 rounded-2xl mb-6 border border-violet-50">
                                <button
                                    onClick={() => setPrescriptionType("digital")}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        prescriptionType === "digital" ? "bg-violet-50 text-violet-700" : "text-slate-500"
                                    }`}
                                >
                                    <FileText className="w-4 h-4" />
                                    کد دیجیتال
                                </button>
                                <button
                                    onClick={() => setPrescriptionType("paper")}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        prescriptionType === "paper" ? "bg-violet-50 text-violet-700" : "text-slate-500"
                                    }`}
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    عکس نسخه
                                </button>
                            </div>

                            {prescriptionType === "digital" ? (
                                <div className="space-y-4">
                                    <Input
                                        value={digitalCode}
                                        onChange={(e) => setDigitalCode(e.target.value)}
                                        className="h-14 rounded-2xl border border-violet-100 bg-white text-left px-5 text-lg placeholder:text-right placeholder:text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                                        dir="ltr"
                                        placeholder="کد ملی یا کد رهگیری بیمه"
                                    />
                                    <p className="text-xs text-slate-500 leading-relaxed px-2">
                                        در صورت داشتن نسخه الکترونیک تامین اجتماعی یا بیمه سلامت، کد ملی خود را وارد کنید.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,application/pdf"
                                        className="hidden"
                                        onChange={(e) => setPrescriptionFile(e.target.files?.[0] ?? null)}
                                    />
                                    {!prescriptionFile ? (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-48 border-2 border-dashed border-violet-200 bg-white/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-violet-50 transition-colors shadow-sm"
                                        >
                                            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-3">
                                                <UploadCloud className="w-6 h-6 text-violet-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">آپلود تصویر نسخه</span>
                                            <span className="text-xs text-slate-400 mt-1">حداکثر ۵ مگابایت (JPG, PNG, PDF)</span>
                                        </div>
                                    ) : (
                                        <div className="h-48 border-2 border-violet-200 bg-white rounded-3xl flex flex-col items-center justify-center shadow-sm relative px-6">
                                            <button
                                                onClick={() => setPrescriptionFile(null)}
                                                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-3">
                                                <CheckCircle2 className="w-6 h-6 text-violet-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 truncate max-w-full">{prescriptionFile.name}</span>
                                            <span className="text-xs text-violet-600 mt-1">فایل با موفقیت انتخاب شد</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Exam selection */}
                    {step === 2 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">خدمات تصویربرداری مورد نیاز</h2>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {mockExams.map((exam) => {
                                    const isSelected = selectedExams.includes(exam.id);
                                    const Icon = exam.icon;
                                    return (
                                        <div
                                            key={exam.id}
                                            onClick={() => toggleExam(exam.id)}
                                            className={`p-4 rounded-3xl cursor-pointer transition-all border-2 flex flex-col h-full ${
                                                isSelected ? "border-violet-500 bg-violet-50/80 shadow-sm" : "border-slate-100 bg-white hover:border-violet-200 shadow-sm"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2.5 rounded-2xl ${isSelected ? "bg-violet-600" : "bg-violet-50"}`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-violet-600"}`} />
                                                </div>
                                                {isSelected ? (
                                                    <CheckCircle2 className="w-5 h-5 text-violet-600" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                                                )}
                                            </div>

                                            <h3 className="text-sm font-bold text-slate-800 mb-1">{exam.name}</h3>
                                            <p className="text-[10px] text-slate-500 mb-4 flex-1">{exam.desc}</p>

                                            <div className="text-left mt-auto">
                                                <span className="text-base font-black text-slate-800">{exam.price.toLocaleString("fa-IR")}</span>
                                                <span className="text-[9px] text-slate-400 mr-1">تومان</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Medical considerations */}
                    {step === 3 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>پاسخ دقیق به این سؤالات برای ایمنی شما در حین تصویربرداری ضروری است.</span>
                            </div>

                            <YesNoQuestion
                                label="آیا باردار هستید؟"
                                value={isPregnant}
                                onChange={setIsPregnant}
                                accent="violet"
                            />

                            {includesMRI && (
                                <YesNoQuestion
                                    label="آیا ایمپلنت فلزی، پیس‌میکر یا شنوایی مصنوعی در بدن دارید؟"
                                    value={hasMetalImplant}
                                    onChange={setHasMetalImplant}
                                    accent="violet"
                                />
                            )}

                            <YesNoQuestion
                                label="سابقه حساسیت به ماده حاجب (کنتراست) دارید؟"
                                value={contrastAllergy}
                                onChange={setContrastAllergy}
                                accent="violet"
                            />

                            <div className="mb-5">
                                <label className="text-xs font-bold text-slate-600 mb-2 px-1 block">توضیحات تکمیلی (اختیاری)</label>
                                <textarea
                                    value={medicalNote}
                                    onChange={(e) => setMedicalNote(e.target.value)}
                                    rows={3}
                                    placeholder="بیماری خاص، داروی مصرفی یا نکته مهم دیگر را بنویسید"
                                    className="w-full rounded-2xl border border-violet-100 bg-white p-4 text-sm shadow-sm resize-none focus:border-violet-500 focus:ring-violet-500 focus:outline-none"
                                />
                            </div>

                            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
                                <MapPin className="h-4 w-4 shrink-0 text-violet-500" />
                                <span>این خدمت نیازمند مراجعه حضوری به مرکز تصویربرداری منتخب است.</span>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Center selection + summary */}
                    {step === 4 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-1">مرکز تصویربرداری را انتخاب کنید</h2>
                            <p className="text-xs text-slate-500 mb-4">لیست مراکز تصویربرداری نزدیک به شما</p>

                            <div className="flex flex-col gap-3 mb-6">
                                {imagingCenters.map((c) => {
                                    const isSelected = selectedCenter === c.id;
                                    return (
                                        <div
                                            key={c.id}
                                            className={`p-4 rounded-3xl transition-all border-2 shadow-sm ${
                                                isSelected ? "border-violet-500 bg-violet-50/80" : "border-slate-100 bg-white hover:border-violet-200"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isSelected ? "bg-violet-600" : "bg-violet-50"}`}>
                                                    <Building2 className={`h-5 w-5 ${isSelected ? "text-white" : "text-violet-600"}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="text-sm font-bold text-slate-800 truncate">{c.name}</h3>
                                                        <div
                                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                                isSelected ? "border-violet-600 bg-violet-600" : "border-slate-200"
                                                            }`}
                                                        >
                                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                    <p className="mt-1 truncate text-[11px] text-slate-500">{c.address}</p>
                                                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                            <span className="font-bold text-slate-700">{c.rating}</span>
                                                            <span>({c.reviews.toLocaleString("fa-IR")})</span>
                                                        </span>
                                                        <span className="text-slate-300">·</span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {c.distanceKm.toLocaleString("fa-IR")} کیلومتر
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                                                <Button
                                                    type="button"
                                                    onClick={() => setSelectedCenter(c.id)}
                                                    className={`h-10 rounded-full text-xs font-bold transition-all ${
                                                        isSelected
                                                            ? "bg-violet-700 text-white shadow-md shadow-violet-200 hover:bg-violet-800"
                                                            : "bg-gradient-to-l from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-200 hover:from-violet-600 hover:to-indigo-700"
                                                    }`}
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <CheckCircle2 className="ml-1.5 h-4 w-4" />
                                                            انتخاب شده
                                                        </>
                                                    ) : (
                                                        "انتخاب مرکز"
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => openCenterDetails(c)}
                                                    className="h-10 rounded-full border-violet-200 bg-white text-xs font-bold text-violet-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                                                >
                                                    <Info className="ml-1.5 h-4 w-4" />
                                                    جزئیات مرکز
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-violet-50 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">تعداد خدمات</span>
                                    <span className="font-bold text-slate-800">{selectedItems.length} مورد</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-sm font-bold text-slate-800">مبلغ قابل پرداخت</span>
                                    <div className="text-left">
                                        <span className="text-2xl font-black text-slate-800 tracking-tight">
                                            {totalPrice.toLocaleString("fa-IR")}
                                        </span>
                                        <span className="text-xs text-slate-500 mr-1">تومان</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                                    زمان دقیق نوبت پس از تأیید درخواست توسط مرکز تصویربرداری برای شما پیامک می‌شود.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="mt-auto sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-white via-white/95 to-transparent z-10">
                    <div className="flex items-center justify-center gap-3">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                className="h-12 w-12 shrink-0 rounded-full border-violet-100 bg-white p-0 text-violet-600 shadow-md shadow-violet-100/80 hover:bg-violet-50 hover:text-violet-700"
                                onClick={() => setStep(step - 1)}
                            >
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-xl hover:shadow-violet-600/40 transition-all"
                                disabled={!isStep1Valid}
                                onClick={() => setStep(2)}
                            >
                                مرحله بعد
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-xl hover:shadow-violet-600/40 transition-all"
                                disabled={selectedExams.length === 0}
                                onClick={() => setStep(3)}
                            >
                                مرحله بعد
                                {selectedExams.length > 0 && ` (${selectedItems.length} مورد)`}
                            </Button>
                        )}

                        {step === 3 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-xl hover:shadow-violet-600/40 transition-all"
                                disabled={!isStep3Valid}
                                onClick={() => setStep(4)}
                            >
                                مرحله بعد
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        )}

                        {step === 4 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-xl hover:shadow-violet-600/40 transition-all"
                                disabled={!isStep4Valid}
                                onClick={() => setSubmitted(true)}
                            >
                                پرداخت و ثبت نهایی
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={centerDetails !== null} onOpenChange={(open) => !open && setCenterDetails(null)}>
                <DialogContent
                    dir="rtl"
                    className="flex max-h-[90dvh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 text-right shadow-2xl [&>button]:left-4 [&>button]:right-auto [&>button]:text-white [&>button]:opacity-100 sm:max-w-md"
                >
                    {centerDetails && (
                        <>
                            <div className="bg-gradient-to-l from-violet-500 to-indigo-600 px-6 py-6 text-white">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <DialogHeader className="text-right sm:text-right">
                                    <DialogTitle className="text-lg font-black leading-7 text-white">
                                        {centerDetails.name}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-white/80">
                                        {centerDetails.address}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
                                <section className="space-y-3">
                                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <Info className="h-4 w-4 text-violet-600" />
                                        اطلاعات مرکز
                                    </h3>
                                    <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-700">توضیحات</p>
                                            <p className="mt-1 text-[11px] leading-5 text-slate-500">{centerDetails.description}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                                            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-700">ساعت کاری</p>
                                                <p className="mt-1 text-[11px] leading-5 text-slate-500">{centerDetails.hours}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                                            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-700">تلفن تماس</p>
                                                <p className="mt-1 text-[11px] leading-5 text-slate-500" dir="ltr">{centerDetails.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                                            <MapPin className="h-3.5 w-3.5 text-violet-600" />
                                            موقعیت روی نقشه
                                        </p>
                                        <LocationMap
                                            lat={centerDetails.lat}
                                            lng={centerDetails.lng}
                                            label={centerDetails.name}
                                        />
                                    </div>
                                </section>

                                <section className="space-y-3 border-t border-slate-100 pt-5">
                                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <ScanLine className="h-4 w-4 text-violet-600" />
                                        خدمات تصویربرداری
                                    </h3>
                                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                                        {(selectedItems.length > 0 ? selectedItems : mockExams).map((service, index, list) => (
                                            <div
                                                key={service.id}
                                                className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                                                    index !== list.length - 1 ? "border-b border-slate-100" : ""
                                                }`}
                                            >
                                                <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-700">
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                                                    {service.name}
                                                </span>
                                                <span className="shrink-0 text-[11px] font-normal text-slate-800">
                                                    {service.price.toLocaleString("fa-IR")}{" "}
                                                    <span className="text-[9px] text-slate-500">تومان</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-3 border-t border-slate-100 pt-5">
                                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <MessageCircleMore className="h-4 w-4 text-violet-600" />
                                        امتیاز کاربران
                                    </h3>
                                    <div className="flex items-center justify-between rounded-3xl bg-gradient-to-l from-amber-50 to-orange-50 p-4 ring-1 ring-amber-100">
                                        <div>
                                            <div className="flex items-end gap-1">
                                                <span className="text-3xl font-black leading-none text-slate-800">
                                                    {centerDetails.rating.toLocaleString("fa-IR")}
                                                </span>
                                                <span className="pb-0.5 text-xs text-slate-400">از ۵</span>
                                            </div>
                                            <p className="mt-2 text-[10px] text-slate-500">
                                                بر اساس {centerDetails.reviews.toLocaleString("fa-IR")} نظر ثبت‌شده
                                            </p>
                                        </div>
                                        <div className="flex gap-1" dir="ltr">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`h-4 w-4 ${
                                                        index < Math.round(centerDetails.rating)
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "fill-white text-amber-200"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        {centerDetails.recentReviews.map((review) => (
                                            <article key={`${review.name}-${review.date}`} className="rounded-2xl bg-slate-50 p-4">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700">{review.name}</p>
                                                        <p className="mt-0.5 text-[10px] text-slate-400">{review.date}</p>
                                                    </div>
                                                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                        {review.rating.toLocaleString("fa-IR")}
                                                    </span>
                                                </div>
                                                <p className="text-xs leading-6 text-slate-500">{review.comment}</p>
                                            </article>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-3 border-t border-slate-100 pt-5">
                                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <MessageCircleMore className="h-4 w-4 text-violet-600" />
                                        ثبت نظر
                                    </h3>
                                    {reviewSubmitted ? (
                                        <div className="flex items-center gap-3 rounded-2xl bg-violet-50 p-4 text-xs font-bold text-violet-700">
                                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                                            نظر شما با موفقیت ثبت شد.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                                <span className="text-xs font-bold text-slate-600">امتیاز شما</span>
                                                <div className="flex gap-0.5" dir="ltr">
                                                    {Array.from({ length: 5 }).map((_, index) => {
                                                        const value = index + 1;
                                                        return (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                onClick={() => setReviewRating(value)}
                                                                aria-label={`امتیاز ${value}`}
                                                                className="rounded-full p-0.5 transition-transform hover:scale-110"
                                                            >
                                                                <Star
                                                                    className={`h-3.5 w-3.5 ${
                                                                        value <= reviewRating
                                                                            ? "fill-amber-400 text-amber-400"
                                                                            : "text-slate-300"
                                                                    }`}
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <textarea
                                                value={reviewText}
                                                onChange={(event) => setReviewText(event.target.value)}
                                                rows={3}
                                                placeholder="نظر خود را درباره خدمات این مرکز بنویسید"
                                                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                                            />
                                            <Button
                                                type="button"
                                                onClick={submitReview}
                                                disabled={reviewRating === 0 || reviewText.trim().length === 0}
                                                className="h-11 w-full rounded-full bg-gradient-to-l from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-violet-200 hover:from-violet-600 hover:to-indigo-700"
                                            >
                                                ثبت نظر
                                            </Button>
                                        </>
                                    )}
                                </section>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function YesNoQuestion({
    label,
    value,
    onChange,
    accent,
}: {
    label: string;
    value: "yes" | "no" | "";
    onChange: (v: "yes" | "no") => void;
    accent: "violet";
}) {
    return (
        <div className="mb-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3 leading-relaxed">{label}</p>
            <div className="flex gap-3">
                <button
                    onClick={() => onChange("yes")}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        value === "yes" ? "border-rose-400 bg-rose-50 text-rose-600" : "border-slate-100 text-slate-500 hover:border-slate-200"
                    }`}
                >
                    بله
                </button>
                <button
                    onClick={() => onChange("no")}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        value === "no" ? "border-emerald-400 bg-emerald-50 text-emerald-600" : "border-slate-100 text-slate-500 hover:border-slate-200"
                    }`}
                >
                    خیر
                </button>
            </div>
        </div>
    );
}
