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
    CalendarDays,
    ArrowLeft,
    CheckCircle2,
    X,
    PartyPopper,
    Pill,
} from "lucide-react";

const timeSlots = [
    { day: "امروز", time: "۱۸ تا ۲۰", val: "امروز عصر" },
    { day: "فردا", time: "۸ تا ۱۰", val: "فردا صبح" },
    { day: "فردا", time: "۱۶ تا ۱۸", val: "فردا عصر" },
    { day: "پس‌فردا", time: "۸ تا ۱۰", val: "پس‌فردا صبح" },
];

const stepsData = [
    { id: 1, title: "نسخه", icon: FileText },
    { id: 2, title: "تحویل", icon: Bike },
    { id: 3, title: "زمان‌بندی", icon: CalendarDays },
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
    const [selectedTime, setSelectedTime] = useState("");

    const isStep1Valid =
        prescriptionType === "digital" ? digitalCode.trim().length > 0 : !!prescriptionFile;
    const isStep2Valid = deliveryType === "pickup" || address.trim().length > 0;

    if (submitted) {
        return (
            <div className="h-[100dvh] bg-gradient-to-b from-emerald-50 to-white text-right font-[YekanBakhFaNum] flex flex-col" dir="rtl">
                <AppBar />
                <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
                        <PartyPopper className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="mb-2 text-xl font-black text-slate-800">درخواست شما ثبت شد</h1>
                    <p className="mb-8 max-w-sm text-center text-sm text-slate-500 leading-relaxed">
                        نسخه شما برای داروخانه ارسال شد. پس از بررسی توسط داروساز، هزینه نهایی و زمان تحویل برای شما پیامک می‌شود.
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
        <div className="h-[100dvh] bg-gradient-to-b from-emerald-50 to-white text-right font-[YekanBakhFaNum] flex flex-col pb-24" dir="rtl">
            <AppBar />

            <div className="flex-1 overflow-y-auto flex flex-col px-5 pt-20 max-w-md mx-auto w-full relative">
                <BackButton to="/services" label="بازگشت به خدمات" className="mb-3 self-start" />
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

                            <div>
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

                    {/* STEP 3: Schedule + summary */}
                    {step === 3 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">
                                {deliveryType === "delivery" ? "زمان تحویل درب منزل" : "زمان مراجعه به داروخانه"}
                            </h2>

                            <div className="flex overflow-x-auto gap-3 pb-6 shrink-0 [-ms-overflow-style:none] [scrollbar-width:none]">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.val}
                                        onClick={() => setSelectedTime(slot.val)}
                                        className={`min-w-[110px] shrink-0 p-4 rounded-3xl transition-all border-2 shadow-sm ${
                                            selectedTime === slot.val ? "border-emerald-500 bg-emerald-50/80" : "border-transparent bg-white hover:border-emerald-200"
                                        }`}
                                    >
                                        <div className={`text-sm font-bold mb-2 ${selectedTime === slot.val ? "text-emerald-700" : "text-slate-700"}`}>
                                            {slot.day}
                                        </div>
                                        <div className={`text-xs ${selectedTime === slot.val ? "text-emerald-600" : "text-slate-500"}`}>
                                            ساعت {slot.time}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-2">
                                <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-50 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">نوع نسخه</span>
                                        <span className="font-bold text-slate-800">{prescriptionType === "digital" ? "کد دیجیتال" : "عکس نسخه"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">روش تحویل</span>
                                        <span className="font-bold text-slate-800">{deliveryType === "delivery" ? "ارسال به درب منزل" : "دریافت حضوری"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                        <span className="text-slate-500">بیمه پایه</span>
                                        <span className={`font-bold ${hasInsurance ? "text-emerald-600" : "text-slate-400"}`}>
                                            {hasInsurance ? "دارد" : "ندارد"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed pt-1">
                                        هزینه نهایی پس از بررسی اقلام نسخه توسط داروساز داروخانه محاسبه و برای تأیید نهایی برای شما پیامک می‌شود.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="mt-auto sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-white via-white to-transparent z-10">
                    <div className="flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-3xl border border-slate-100 shadow-sm">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                className="h-14 rounded-2xl px-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50 bg-white"
                                onClick={() => setStep(step - 1)}
                            >
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-emerald-600/20"
                                disabled={!isStep1Valid}
                                onClick={() => setStep(2)}
                            >
                                مرحله بعد
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-emerald-600/20"
                                disabled={!isStep2Valid}
                                onClick={() => setStep(3)}
                            >
                                مرحله بعد
                            </Button>
                        )}

                        {step === 3 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:bg-slate-200 disabled:text-slate-400"
                                disabled={!selectedTime}
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
