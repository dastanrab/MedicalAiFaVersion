import { useRef, useState, useEffect } from "react";
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
import {
    UploadCloud,
    FileText,
    Check,
    Bike,
    ShieldCheck,
    MapPin,
    ArrowLeft,
    CheckCircle2,
    X,
    PartyPopper,
    Pill,
    ChevronDown,
    Plus,
    Clock3,
    Smartphone,
    Info,
    MessageCircleMore,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = "http://185.222.163.113:7000";

const stepsData = [
    { id: 1, title: "نسخه", icon: FileText },
    { id: 2, title: "تحویل", icon: Bike },
];

export function PharmacyFlow() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { accessToken, user } = useAuthStore();

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [digitalCode, setDigitalCode] = useState("");
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery");
    const [hasInsurance, setHasInsurance] = useState(false);
    const [note, setNote] = useState("");
    const [drugs, setDrugs] = useState<string[]>([]);
    const [drugInput, setDrugInput] = useState("");

    // آدرس‌های کاربر
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // بخش‌های باز شونده
    const [openSection, setOpenSection] = useState<"code" | "upload" | null>(null);

    // دریافت آدرس‌های کاربر
    useEffect(() => {
        if (!accessToken) return;
        const fetchAddresses = async () => {
            setIsLoadingAddresses(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/user/addresses`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                });
                const json = await res.json();
                if (json?.data?.addresses) {
                    setAddresses(json.data.addresses);
                    if (json.data.addresses.length > 0) {
                        setSelectedAddressId(json.data.addresses[0].id);
                    }
                }
            } catch (err) {
                console.error("خطا در دریافت آدرس‌ها:", err);
            } finally {
                setIsLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, [accessToken]);

    const toggleSection = (section: "code" | "upload") => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    const addDrug = () => {
        const name = drugInput.trim();
        if (!name || drugs.includes(name)) {
            setDrugInput("");
            return;
        }
        setDrugs((prev) => [...prev, name]);
        setDrugInput("");
    };

    const removeDrug = (name: string) => {
        setDrugs((prev) => prev.filter((d) => d !== name));
    };

    const isStep1Valid =
        drugs.length > 0 || digitalCode.trim().length > 0 || !!prescriptionFile;

    const isStep2Valid = () => {
        if (deliveryType === "pickup") return true;
        return !!selectedAddressId;
    };

    // ثبت نهایی درخواست
    const handleSubmit = async () => {
        if (isSubmitting) return;
        setError(null);

        const formData = new FormData();
        // delivery_type: 0 = حضوری, 1 = ارسال
        formData.append("delivery_type", deliveryType === "pickup" ? "0" : "1");
        if (deliveryType === "delivery" && selectedAddressId) {
            formData.append("user_address_id", String(selectedAddressId));
        }
        if (digitalCode.trim()) {
            formData.append("prescription_code", digitalCode.trim());
        }
        if (drugs.length > 0) {
            // ارسال داروها به صورت یک رشته با کاما (یا می‌توانید با \n جدا کنید)
            formData.append("medicines_text", drugs.join("، "));
        }
        formData.append("has_insurance", hasInsurance ? "1" : "0");
        if (note.trim()) {
            formData.append("description", note.trim());
        }
        if (prescriptionFile) {
            formData.append("prescription_image", prescriptionFile);
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/pharmacy-requests`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });
            const json = await response.json();
            if (response.ok && json.status === "success") {
                setSubmitted(true);
            } else {
                setError(json.message || "خطا در ثبت درخواست");
            }
        } catch (err) {
            setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // صفحه‌ی موفقیت
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
                        درخواست شما برای داروخانه‌های اطراف ارسال شد. پس از بررسی توسط داروساز، هزینه نهایی و زمان تحویل برای شما پیامک می‌شود.
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
                {/* Progress Indicator */}
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

                {/* نمایش خطا */}
                {error && (
                    <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                        {error}
                    </div>
                )}

                <div className="flex-1 flex flex-col pb-4">
                    {/* STEP 1: Prescription */}
                    {step === 1 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* کد دیجیتال */}
                            <div className="mb-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("code")}
                                    className="flex w-full items-center gap-2 px-5 py-4"
                                >
                                    <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span className="flex-1 text-right text-sm font-bold text-slate-800">کد دیجیتال نسخه</span>
                                    {digitalCode.trim().length > 0 && (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                    )}
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                                            openSection === "code" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {openSection === "code" && (
                                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Input
                                            value={digitalCode}
                                            onChange={(e) => setDigitalCode(e.target.value)}
                                            className="h-14 rounded-2xl border border-emerald-100 bg-white text-left px-5 text-lg placeholder:text-right placeholder:text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            dir="ltr"
                                            placeholder="کد ملی یا کد رهگیری بیمه"
                                        />
                                        <p className="mt-2 px-2 text-xs text-slate-500 leading-relaxed">
                                            در صورت داشتن نسخه الکترونیک تامین اجتماعی یا بیمه سلامت، کد ملی خود را وارد کنید.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* آپلود عکس نسخه */}
                            <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("upload")}
                                    className="flex w-full items-center gap-2 px-5 py-4"
                                >
                                    <UploadCloud className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span className="flex-1 text-right text-sm font-bold text-slate-800">آپلود عکس نسخه</span>
                                    {prescriptionFile && (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                    )}
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                                            openSection === "upload" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,application/pdf"
                                    className="hidden"
                                    onChange={(e) => setPrescriptionFile(e.target.files?.[0] ?? null)}
                                />
                                {openSection === "upload" && (
                                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {!prescriptionFile ? (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-40 border-2 border-dashed border-emerald-200 bg-white/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors shadow-sm"
                                            >
                                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                                    <UploadCloud className="w-6 h-6 text-emerald-600" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">آپلود تصویر نسخه</span>
                                                <span className="text-xs text-slate-400 mt-1">حداکثر ۵ مگابایت (JPG, PNG, PDF)</span>
                                            </div>
                                        ) : (
                                            <div className="h-40 border-2 border-emerald-200 bg-white rounded-3xl flex flex-col items-center justify-center shadow-sm relative px-6">
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

                            {/* داروهای مورد نیاز */}
                            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
                                <Pill className="h-4 w-4 text-emerald-600" />
                                داروهای مورد نیاز
                            </h2>

                            <div className="mb-3 flex items-center gap-2">
                                <Input
                                    value={drugInput}
                                    onChange={(e) => setDrugInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addDrug();
                                        }
                                    }}
                                    className="h-12 flex-1 rounded-2xl border border-emerald-100 bg-white px-4 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="نام دارو را وارد کنید (مثلاً استامینوفن ۵۰۰)"
                                />
                                <Button
                                    type="button"
                                    onClick={addDrug}
                                    disabled={drugInput.trim().length === 0}
                                    className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-600 p-0 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>

                            {drugs.length > 0 ? (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {drugs.map((drug) => (
                                        <span
                                            key={drug}
                                            className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 py-1.5 pr-3.5 pl-1.5 text-xs font-semibold text-emerald-800"
                                        >
                                            {drug}
                                            <button
                                                type="button"
                                                onClick={() => removeDrug(drug)}
                                                className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600 hover:bg-emerald-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mb-6 px-2 text-xs text-slate-500 leading-relaxed">
                                    داروهای بدون نسخه را اینجا اضافه کنید. اگر نسخه دارید، وارد کردن کد یا عکس نسخه کافی است.
                                </p>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Delivery method + insurance + address */}
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
                                        <MapPin className={`w-5 h-5 ${deliveryType === "pickup" ? "text-white" : "text-emerald-600"}`} />
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
                                    {isLoadingAddresses ? (
                                        <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">در حال بارگیری آدرس‌ها...</div>
                                    ) : addresses.length === 0 ? (
                                        <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-700 ring-1 ring-amber-200">
                                            هیچ آدرسی ثبت نشده است. لطفاً ابتدا در پروفایل خود آدرس اضافه کنید.
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedAddressId || ""}
                                            onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                                            className="w-full rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            {addresses.map((addr) => (
                                                <option key={addr.id} value={addr.id}>
                                                    {addr.title || addr.address}
                                                </option>
                                            ))}
                                        </select>
                                    )}
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

                            {/* خلاصه درخواست */}
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-50 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">نوع نسخه</span>
                                    <span className="font-bold text-slate-800">
                                        {digitalCode.trim().length > 0
                                            ? "کد دیجیتال"
                                            : prescriptionFile
                                                ? "عکس نسخه"
                                                : "بدون نسخه"}
                                    </span>
                                </div>
                                {drugs.length > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">داروهای درخواستی</span>
                                        <span className="font-bold text-slate-800">{drugs.length.toLocaleString("fa-IR")} قلم</span>
                                    </div>
                                )}
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
                                disabled={!isStep2Valid() || isSubmitting}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? "در حال ارسال..." : "ثبت نهایی درخواست"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}