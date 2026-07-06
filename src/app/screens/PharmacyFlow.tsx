import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AppBar } from "../components/AppBar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    UploadCloud,
    FileText,
    Check,
    Store,
    Bike,
    ShieldCheck,
    MapPin,
    ArrowLeft,
    CheckCircle2,
    X,
    PartyPopper,
    Pill,
    Building2,
    Star,
} from "lucide-react";

const pharmacyCenters = [
    { id: 1, name: "داروخانه شبانه‌روزی مرکزی", city: "مشهد", address: "بلوار وکیل‌آباد، نبش وکیل‌آباد ۱۰", rating: 4.8, reviews: 268, distanceKm: 1.4 },
    { id: 2, name: "داروخانه دکتر عبیدی", city: "مشهد", address: "خیابان احمدآباد، پلاک ۸۸", rating: 4.9, reviews: 197, distanceKm: 2.7 },
    { id: 3, name: "داروخانه بزرگ رضوی", city: "مشهد", address: "بلوار سجاد، نبش سجاد ۱۸", rating: 4.6, reviews: 143, distanceKm: 3.9 },
    { id: 4, name: "داروخانه هلال احمر", city: "مشهد", address: "میدان راهنمایی، ابتدای کوهسنگی", rating: 4.7, reviews: 121, distanceKm: 5.1 },
];

const stepsData = [
    { id: 1, title: "نسخه", icon: FileText },
    { id: 2, title: "تحویل", icon: Bike },
    { id: 3, title: "انتخاب داروخانه", icon: Building2 },
];

export function PharmacyFlow() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [prescriptionType, setPrescriptionType] = useState<"digital" | "paper">("digital");
    const [digitalCode, setDigitalCode] = useState("");
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery");
    const [address, setAddress] = useState("");
    const [hasInsurance, setHasInsurance] = useState(false);
    const [note, setNote] = useState("");
    const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);

    const isStep1Valid =
        prescriptionType === "digital" ? digitalCode.trim().length > 0 : !!prescriptionFile;
    const isStep2Valid = deliveryType === "pickup" || address.trim().length > 0;
    const pharmacy = pharmacyCenters.find((p) => p.id === selectedPharmacy) ?? null;

    if (submitted) {
        return (
            <div className="h-[100dvh] bg-gradient-to-b from-emerald-50 to-white text-right font-[YekanBakhFaNum] flex flex-col" dir="rtl">
                <AppBar backTo="/services" />
                <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
                        <PartyPopper className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="mb-2 text-xl font-black text-slate-800">درخواست شما ثبت شد</h1>
                    <p className="mb-8 max-w-sm text-center text-sm text-slate-500 leading-relaxed">
                        نسخه شما برای <span className="font-bold text-slate-700">{pharmacy?.name}</span> ارسال شد. پس از بررسی توسط داروساز، هزینه نهایی و زمان تحویل برای شما پیامک می‌شود.
                    </p>
                    <Button
                        className="rounded-2xl h-12 px-8 bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => navigate("/services")}
                    >
                        بازگشت به خدمات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-emerald-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/services" />

            <div className="relative z-10 px-5 pt-24 pb-4 text-right sm:px-6">
                <div className="mb-8 shrink-0">
                    <div className="mb-6 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 shadow-lg shadow-emerald-200">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                            <Pill className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-lg font-black tracking-tight text-white">سفارش دارو</h1>
                            <p className="mt-0.5 text-[11px] text-white/80">
                                مرحله {step} از {stepsData.length} · {stepsData[step - 1].title}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-black text-white ring-1 ring-white/25">
                            {step}/{stepsData.length}
                        </div>
                    </div>

                    <div className="relative flex justify-between items-center px-2">
                        <div className="absolute top-5 left-6 right-6 -z-10 h-1 overflow-hidden rounded-full bg-emerald-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
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
                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                                                : isCurrent
                                                    ? "scale-110 bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 ring-4 ring-white"
                                                    : "bg-white border-emerald-200 text-emerald-300 ring-4 ring-white"
                                        }`}
                                    >
                                        <StepIcon className={`w-5 h-5 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
                                    </div>
                                    <span
                                        className={`text-[11px] font-bold transition-colors duration-300 ${
                                            isCompleted ? "text-emerald-600" : isCurrent ? "text-emerald-700" : "text-slate-400"
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
                            <div className="flex bg-white shadow-sm p-1.5 rounded-2xl mb-6 border border-emerald-50">
                                <button
                                    onClick={() => setPrescriptionType("digital")}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        prescriptionType === "digital" ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
                                    }`}
                                >
                                    <FileText className="w-4 h-4" />
                                    کد دیجیتال
                                </button>
                                <button
                                    onClick={() => setPrescriptionType("paper")}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        prescriptionType === "paper" ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
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
                                        className="h-14 rounded-2xl border border-emerald-100 bg-white text-left px-5 text-lg placeholder:text-right placeholder:text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                                            className="h-48 border-2 border-dashed border-emerald-200 bg-white/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors shadow-sm"
                                        >
                                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                                <UploadCloud className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">آپلود تصویر نسخه</span>
                                            <span className="text-xs text-slate-400 mt-1">حداکثر ۵ مگابایت (JPG, PNG, PDF)</span>
                                        </div>
                                    ) : (
                                        <div className="h-48 border-2 border-emerald-200 bg-white rounded-3xl flex flex-col items-center justify-center shadow-sm relative px-6">
                                            <button
                                                onClick={() => setPrescriptionFile(null)}
                                                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 truncate max-w-full">{prescriptionFile.name}</span>
                                            <span className="text-xs text-emerald-600 mt-1">فایل با موفقیت انتخاب شد</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Delivery method + insurance */}
                    {step === 2 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">روش تحویل دارو</h2>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <button
                                    onClick={() => setDeliveryType("delivery")}
                                    className={`p-4 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all shadow-sm ${
                                        deliveryType === "delivery" ? "border-emerald-500 bg-emerald-50/80" : "border-slate-100 bg-white hover:border-emerald-200"
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-2xl ${deliveryType === "delivery" ? "bg-emerald-600" : "bg-emerald-50"}`}>
                                        <Bike className={`w-5 h-5 ${deliveryType === "delivery" ? "text-white" : "text-emerald-600"}`} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">ارسال به درب منزل</span>
                                </button>
                                <button
                                    onClick={() => setDeliveryType("pickup")}
                                    className={`p-4 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all shadow-sm ${
                                        deliveryType === "pickup" ? "border-emerald-500 bg-emerald-50/80" : "border-slate-100 bg-white hover:border-emerald-200"
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-2xl ${deliveryType === "pickup" ? "bg-emerald-600" : "bg-emerald-50"}`}>
                                        <Store className={`w-5 h-5 ${deliveryType === "pickup" ? "text-white" : "text-emerald-600"}`} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">دریافت حضوری</span>
                                </button>
                            </div>

                            {deliveryType === "delivery" && (
                                <div className="mb-5">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 px-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        آدرس تحویل
                                    </label>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={3}
                                        placeholder="آدرس کامل، پلاک و واحد را وارد کنید"
                                        className="w-full rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-sm resize-none focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            )}

                            <button
                                onClick={() => setHasInsurance((v) => !v)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 mb-5 transition-all shadow-sm ${
                                    hasInsurance ? "border-emerald-500 bg-emerald-50/80" : "border-slate-100 bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className={`w-5 h-5 ${hasInsurance ? "text-emerald-600" : "text-slate-400"}`} />
                                    <span className="text-sm font-semibold text-slate-700">بیمه پایه دارم</span>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-colors relative ${hasInsurance ? "bg-emerald-500" : "bg-slate-200"}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${hasInsurance ? "right-0.5" : "right-5"}`} />
                                </div>
                            </button>

                            <div className="mb-5">
                                <label className="text-xs font-bold text-slate-600 mb-2 px-1 block">توضیحات برای داروساز (اختیاری)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
                                    placeholder="مثلاً در صورت نبود دارو، جایگزین اعلام شود"
                                    className="w-full rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-sm resize-none focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                        </div>
                    )}

                    {/* STEP 3: Pharmacy selection + summary */}
                    {step === 3 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-1">داروخانه مورد نظر را انتخاب کنید</h2>
                            <p className="text-xs text-slate-500 mb-4">لیست داروخانه‌های نزدیک به آدرس شما</p>

                            <div className="flex flex-col gap-3 mb-6">
                                {pharmacyCenters.map((c) => {
                                    const isSelected = selectedPharmacy === c.id;
                                    return (
                                        <div
                                            key={c.id}
                                            onClick={() => setSelectedPharmacy(c.id)}
                                            className={`p-4 rounded-3xl cursor-pointer transition-all border-2 shadow-sm ${
                                                isSelected ? "border-emerald-500 bg-emerald-50/80" : "border-slate-100 bg-white hover:border-emerald-200"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isSelected ? "bg-emerald-600" : "bg-emerald-50"}`}>
                                                    <Building2 className={`h-5 w-5 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="text-sm font-bold text-slate-800 truncate">{c.name}</h3>
                                                        <div
                                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                                isSelected ? "border-emerald-600 bg-emerald-600" : "border-slate-200"
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
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-50 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">نوع نسخه</span>
                                    <span className="font-bold text-slate-800">{prescriptionType === "digital" ? "کد دیجیتال" : "عکس نسخه"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                    <span className="text-slate-500">بیمه پایه</span>
                                    <span className={`font-bold ${hasInsurance ? "text-emerald-600" : "text-slate-400"}`}>
                                        {hasInsurance ? "دارد" : "ندارد"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                                    {deliveryType === "delivery"
                                        ? "هزینه نهایی و زمان تحویل درب منزل پس از بررسی اقلام نسخه توسط داروساز محاسبه و برای شما پیامک می‌شود."
                                        : "هزینه نهایی و زمان آماده شدن سفارش پس از بررسی اقلام نسخه توسط داروساز برای شما پیامک می‌شود."}
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
                                className="h-12 w-12 shrink-0 rounded-full border-emerald-100 bg-white p-0 text-emerald-600 shadow-md shadow-emerald-100/80 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => setStep(step - 1)}
                            >
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all"
                                disabled={!isStep1Valid}
                                onClick={() => setStep(2)}
                            >
                                مرحله بعد
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all"
                                disabled={!isStep2Valid}
                                onClick={() => setStep(3)}
                            >
                                مرحله بعد
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        )}

                        {step === 3 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all"
                                disabled={selectedPharmacy === null}
                                onClick={() => setSubmitted(true)}
                            >
                                ثبت نهایی درخواست
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
