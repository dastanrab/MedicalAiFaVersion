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
    ArrowLeft,
    CheckCircle2,
    X,
    AlertTriangle,
    PartyPopper,
    ClipboardList,
    MapPin,
    Building2,
    Star,
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
    { id: 1, name: "مرکز تصویربرداری پارسیان", city: "مشهد", address: "بلوار وکیل‌آباد، نبش وکیل‌آباد ۳۰", rating: 4.9, reviews: 289, distanceKm: 2.4 },
    { id: 2, name: "مرکز تصویربرداری نور", city: "مشهد", address: "خیابان احمدآباد، پلاک ۵۵", rating: 4.7, reviews: 198, distanceKm: 3.8 },
    { id: 3, name: "مرکز تصویربرداری رازی", city: "مشهد", address: "بلوار سجاد، نبش سجاد ۹", rating: 4.8, reviews: 176, distanceKm: 5.0 },
    { id: 4, name: "مرکز تصویربرداری کوثر", city: "مشهد", address: "میدان راهنمایی، ابتدای کوهسنگی", rating: 4.6, reviews: 134, distanceKm: 6.5 },
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

    const toggleExam = (id: number) => {
        setSelectedExams((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
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
                                            onClick={() => setSelectedCenter(c.id)}
                                            className={`p-4 rounded-3xl cursor-pointer transition-all border-2 shadow-sm ${
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
                                        <span className="text-2xl font-black text-violet-600 tracking-tight">
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
