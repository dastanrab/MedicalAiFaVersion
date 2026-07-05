import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AppBar } from "../components/AppBar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
    CalendarDays,
    ArrowLeft,
    CheckCircle2,
    X,
    AlertTriangle,
    PartyPopper,
    ClipboardList,
    MapPin,
} from "lucide-react";

const mockExams = [
    { id: 1, name: "رادیوگرافی ساده", desc: "عکس‌برداری ساده (X-Ray)", price: 180000, icon: Radiation },
    { id: 2, name: "سونوگرافی", desc: "تصویربرداری با امواج صوتی", price: 320000, icon: Waves },
    { id: 3, name: "سی‌تی‌اسکن", desc: "برش‌نگاری کامپیوتری (CT)", price: 950000, icon: ScanLine },
    { id: 4, name: "ام‌آر‌آی (MRI)", desc: "تصویربرداری رزونانس مغناطیسی", price: 1850000, icon: Brain },
    { id: 5, name: "ماموگرافی", desc: "بررسی تخصصی سینه", price: 480000, icon: Camera },
    { id: 6, name: "دانسیتومتری استخوان", desc: "سنجش تراکم استخوان", price: 550000, icon: Bone },
];

const timeSlots = [
    { day: "امروز", time: "۱۸ تا ۲۰", val: "امروز عصر" },
    { day: "فردا", time: "۸ تا ۱۰", val: "فردا صبح" },
    { day: "فردا", time: "۱۶ تا ۱۸", val: "فردا عصر" },
    { day: "پس‌فردا", time: "۸ تا ۱۰", val: "پس‌فردا صبح" },
];

const stepsData = [
    { id: 1, title: "نسخه", icon: FileText },
    { id: 2, title: "خدمات", icon: ScanLine },
    { id: 3, title: "ملاحظات", icon: ClipboardList },
    { id: 4, title: "زمان‌بندی", icon: CalendarDays },
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

    const [selectedTime, setSelectedTime] = useState("");

    const toggleExam = (id: number) => {
        setSelectedExams((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    };

    const selectedItems = mockExams.filter((t) => selectedExams.includes(t.id));
    const totalPrice = selectedItems.reduce((sum, t) => sum + t.price, 0);
    const includesMRI = selectedItems.some((t) => t.name.includes("ام‌آر‌آی"));

    const isStep1Valid = prescriptionType === "digital" ? digitalCode.trim().length > 0 : !!prescriptionFile;
    const isStep3Valid = isPregnant !== "" && contrastAllergy !== "" && (!includesMRI || hasMetalImplant !== "");

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
                        درخواست تصویربرداری شما دریافت شد. آدرس مرکز و یادآوری نوبت پیش از موعد برای شما پیامک می‌شود.
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
        <div className="h-[100dvh] bg-gradient-to-b from-violet-50 to-white text-right font-[YekanBakhFaNum] flex flex-col pb-24" dir="rtl">
            <AppBar backTo="/services" />

            <div className="flex-1 overflow-y-auto flex flex-col px-5 pt-20 max-w-md mx-auto w-full relative">
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
                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                                                : isCurrent
                                                    ? "scale-110 bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 ring-4 ring-white"
                                                    : "bg-white border-violet-200 text-violet-300 ring-4 ring-white"
                                        }`}
                                    >
                                        <StepIcon className={`w-4 h-4 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold transition-colors duration-300 ${
                                            isCompleted ? "text-emerald-600" : isCurrent ? "text-violet-700" : "text-slate-400"
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

                            <div className="mt-1">
                                <label className="text-xs font-bold text-slate-600 mb-2 px-1 block">توضیحات تکمیلی (اختیاری)</label>
                                <textarea
                                    value={medicalNote}
                                    onChange={(e) => setMedicalNote(e.target.value)}
                                    rows={3}
                                    placeholder="بیماری خاص، داروی مصرفی یا نکته مهم دیگر را بنویسید"
                                    className="w-full rounded-2xl border border-violet-100 bg-white p-4 text-sm shadow-sm resize-none focus:border-violet-500 focus:ring-violet-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Time & checkout */}
                    {step === 4 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">زمان مراجعه به مرکز تصویربرداری</h2>

                            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
                                <MapPin className="h-4 w-4 shrink-0 text-violet-500" />
                                <span>این خدمت نیازمند مراجعه حضوری به مرکز تصویربرداری منتخب است.</span>
                            </div>

                            <div className="flex overflow-x-auto gap-3 pb-6 shrink-0 [-ms-overflow-style:none] [scrollbar-width:none]">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.val}
                                        onClick={() => setSelectedTime(slot.val)}
                                        className={`min-w-[110px] shrink-0 p-4 rounded-3xl transition-all border-2 shadow-sm ${
                                            selectedTime === slot.val ? "border-violet-500 bg-violet-50/80" : "border-transparent bg-white hover:border-violet-200"
                                        }`}
                                    >
                                        <div className={`text-sm font-bold mb-2 ${selectedTime === slot.val ? "text-violet-700" : "text-slate-700"}`}>
                                            {slot.day}
                                        </div>
                                        <div className={`text-xs ${selectedTime === slot.val ? "text-violet-600" : "text-slate-500"}`}>
                                            ساعت {slot.time}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-2">
                                <div className="bg-white rounded-3xl p-5 shadow-sm border border-violet-50 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">تعداد خدمات</span>
                                        <span className="font-bold text-slate-800">{selectedItems.length} مورد</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-4">
                                        <span className="text-slate-500">هزینه مراجعه</span>
                                        <span className="font-bold text-emerald-600">رایگان</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-sm font-bold text-slate-800">مبلغ قابل پرداخت</span>
                                        <div className="text-left">
                                            <span className="text-2xl font-black text-violet-600 tracking-tight">
                                                {totalPrice.toLocaleString("fa-IR")}
                                            </span>
                                            <span className="text-xs text-slate-500 mr-1">تومان</span>
                                        </div>
                                    </div>
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
                                className="h-14 rounded-2xl px-4 border-violet-200 text-violet-600 hover:bg-violet-50 bg-white"
                                onClick={() => setStep(step - 1)}
                            >
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-violet-600/20"
                                disabled={!isStep1Valid}
                                onClick={() => setStep(2)}
                            >
                                مرحله بعد
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-violet-600/20"
                                disabled={selectedExams.length === 0}
                                onClick={() => setStep(3)}
                            >
                                مرحله بعد
                                {selectedExams.length > 0 && ` (${selectedItems.length} مورد)`}
                            </Button>
                        )}

                        {step === 3 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-violet-600/20"
                                disabled={!isStep3Valid}
                                onClick={() => setStep(4)}
                            >
                                مرحله بعد
                            </Button>
                        )}

                        {step === 4 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20 disabled:bg-slate-200 disabled:text-slate-400"
                                disabled={!selectedTime}
                                onClick={() => setSubmitted(true)}
                            >
                                پرداخت و ثبت نهایی
                            </Button>
                        )}
                    </div>
                </div>
            </div>
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
