import { useState } from "react";
import { useNavigate } from "react-router";
import { AppBar } from "../components/AppBar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    UploadCloud,
    TestTube,
    Activity,
    Syringe,
    CheckCircle2,
    ArrowLeft,
    FileText,
    Check,
    PartyPopper,
} from "lucide-react";

const mockTests = [
    { id: 1, name: "آزمایش خون", desc: "بررسی کلی (CBC)", price: 120000, icon: Syringe },
    { id: 2, name: "قند خون", desc: "بررسی دیابت (FBS)", price: 80000, icon: Activity },
    { id: 3, name: "چربی خون", desc: "کلسترول و تری‌گلیسیرید", price: 150000, icon: TestTube },
    { id: 4, name: "تیروئید", desc: "عملکرد غده (TSH)", price: 170000, icon: Activity },
    { id: 5, name: "ویتامین D3", desc: "بررسی سطح ویتامین", price: 210000, icon: TestTube },
    { id: 6, name: "آهن خون", desc: "بررسی کم‌خونی", price: 110000, icon: Syringe },
];

const stepsData = [
    { id: 1, title: "نسخه", icon: FileText },
    { id: 2, title: "آزمایش‌ها", icon: TestTube },
];

export function LabsFlow() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [prescriptionType, setPrescriptionType] = useState<"digital" | "paper">("digital");
    const [selectedTests, setSelectedTests] = useState<number[]>([]);

    const toggleTest = (id: number) => {
        setSelectedTests((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const selectedItems = mockTests.filter((t) => selectedTests.includes(t.id));
    const totalPrice = selectedItems.reduce((sum, t) => sum + t.price, 0);

    if (submitted) {
        return (
            <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white text-right font-[YekanBakhFaNum]" dir="rtl">
                <AppBar backTo="/services" />
                <div className="flex min-h-[calc(100%-1px)] flex-col items-center justify-center px-6 pt-24">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-200">
                        <PartyPopper className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="mb-2 text-xl font-black text-slate-800">درخواست شما ثبت شد</h1>
                    <p className="mb-8 max-w-sm text-center text-sm text-slate-500 leading-relaxed">
                        درخواست آزمایش شما ثبت شد. زمان مراجعه نمونه‌گیر به آدرس شما پس از تأیید آزمایشگاه پیامک می‌شود.
                    </p>
                    <Button
                        className="rounded-2xl h-12 px-8 bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => navigate("/services")}
                    >
                        بازگشت به خدمات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/services" />

            <div className="relative z-10 px-5 pt-24 pb-4 text-right sm:px-6">

                {/* Header & Stepper */}
                <div className="mb-8 shrink-0">
                    <div className="mb-6 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 shadow-lg shadow-blue-200">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                            <TestTube className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-lg font-black tracking-tight text-white">درخواست آزمایش</h1>
                            <p className="mt-0.5 text-[11px] text-white/80">
                                مرحله {step} از {stepsData.length} · {stepsData[step - 1].title}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-black text-white ring-1 ring-white/25">
                            {step}/{stepsData.length}
                        </div>
                    </div>

                    <div className="relative flex justify-between items-center px-2">
                        <div className="absolute top-5 left-6 right-6 -z-10 h-1 overflow-hidden rounded-full bg-blue-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-l from-sky-500 to-blue-600 transition-all duration-500 ease-out"
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
                                                    ? "scale-110 bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-white"
                                                    : "bg-white border-blue-200 text-blue-300 ring-4 ring-white"
                                        }`}
                                    >
                                        <StepIcon className={`h-5 w-5 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
                                    </div>
                                    <span
                                        className={`text-[11px] font-bold transition-colors duration-300 ${
                                            isCompleted
                                                ? "text-emerald-600"
                                                : isCurrent
                                                    ? "text-blue-700"
                                                    : "text-slate-400"
                                        }`}
                                    >
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col pb-4">
                    {/* STEP 1: Prescription */}
                    {step === 1 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex bg-white shadow-sm p-1.5 rounded-2xl mb-6 border border-blue-50">
                                <button
                                    onClick={() => setPrescriptionType("digital")}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        prescriptionType === "digital" ? "bg-blue-50 text-blue-700" : "text-slate-500"
                                    }`}
                                >
                                    <FileText className="w-4 h-4" />
                                    کد دیجیتال
                                </button>
                                <button
                                    onClick={() => setPrescriptionType("paper")}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        prescriptionType === "paper" ? "bg-blue-50 text-blue-700" : "text-slate-500"
                                    }`}
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    عکس نسخه
                                </button>
                            </div>

                            {prescriptionType === "digital" ? (
                                <div className="space-y-4">
                                    <Input
                                        className="h-14 rounded-2xl border border-blue-100 bg-white text-left px-5 text-lg placeholder:text-right placeholder:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        dir="ltr"
                                        placeholder="کد ملی یا کد رهگیری بیمه"
                                    />
                                    <p className="text-xs text-slate-500 leading-relaxed px-2">
                                        در صورت داشتن نسخه الکترونیک تامین اجتماعی یا بیمه سلامت، کد ملی خود را وارد کنید.
                                    </p>
                                </div>
                            ) : (
                                <div className="h-48 border-2 border-dashed border-blue-200 bg-white/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors shadow-sm">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                        <UploadCloud className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">آپلود تصویر نسخه</span>
                                    <span className="text-xs text-slate-400 mt-1">حداکثر ۵ مگابایت (JPG, PNG)</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Test selection + summary */}
                    {step === 2 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">آزمایش‌های مورد نیاز</h2>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {mockTests.map((test) => {
                                    const isSelected = selectedTests.includes(test.id);
                                    const Icon = test.icon;
                                    return (
                                        <div
                                            key={test.id}
                                            onClick={() => toggleTest(test.id)}
                                            className={`p-4 rounded-3xl cursor-pointer transition-all border-2 flex flex-col h-full ${
                                                isSelected
                                                    ? "border-blue-500 bg-blue-50/80 shadow-sm"
                                                    : "border-slate-100 bg-white hover:border-blue-200 shadow-sm"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2.5 rounded-2xl ${isSelected ? "bg-blue-600" : "bg-blue-50"}`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-blue-600"}`} />
                                                </div>
                                                {isSelected ? (
                                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                                                )}
                                            </div>

                                            <h3 className="text-sm font-bold text-slate-800 mb-1">{test.name}</h3>
                                            <p className="text-[10px] text-slate-500 mb-4 flex-1">{test.desc}</p>

                                            <div className="text-left mt-auto">
                                                <span className="text-base font-black text-slate-800">
                                                    {test.price.toLocaleString("fa-IR")}
                                                </span>
                                                <span className="text-[9px] text-slate-400 mr-1">تومان</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedItems.length > 0 && (
                                <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">تعداد آزمایش‌ها</span>
                                        <span className="font-bold text-slate-800">{selectedItems.length} مورد</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-4">
                                        <span className="text-slate-500">هزینه نمونه‌گیری در محل</span>
                                        <span className="font-bold text-emerald-600">رایگان</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-sm font-bold text-slate-800">مبلغ قابل پرداخت</span>
                                        <div className="text-left">
                                            <span className="text-2xl font-black text-blue-600 tracking-tight">
                                                {totalPrice.toLocaleString("fa-IR")}
                                            </span>
                                            <span className="text-xs text-slate-500 mr-1">تومان</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed pt-1">
                                        زمان مراجعه نمونه‌گیر پس از تأیید درخواست توسط آزمایشگاه با شما هماهنگ می‌شود.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* دکمه‌های مستقل شده */}
                <div className="mt-auto sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-white via-white/95 to-transparent z-10">
                    <div className="flex items-center justify-center gap-3">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                className="h-12 w-12 shrink-0 rounded-full border-blue-100 bg-white p-0 text-blue-600 shadow-md shadow-blue-100/80 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => setStep(step - 1)}
                            >
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
                                onClick={() => setStep(2)}
                            >
                                مرحله بعد
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
                                disabled={selectedTests.length === 0}
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
