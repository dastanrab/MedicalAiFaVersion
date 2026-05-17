import { useState } from "react";
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
    CalendarDays
} from "lucide-react";

const mockTests = [
    { id: 1, name: "آزمایش خون", desc: "بررسی کلی (CBC)", price: 120000, icon: Syringe },
    { id: 2, name: "قند خون", desc: "بررسی دیابت (FBS)", price: 80000, icon: Activity },
    { id: 3, name: "چربی خون", desc: "کلسترول و تری‌گلیسیرید", price: 150000, icon: TestTube },
    { id: 4, name: "تیروئید", desc: "عملکرد غده (TSH)", price: 170000, icon: Activity },
    { id: 5, name: "ویتامین D3", desc: "بررسی سطح ویتامین", price: 210000, icon: TestTube },
    { id: 6, name: "آهن خون", desc: "بررسی کم‌خونی", price: 110000, icon: Syringe },
];

const timeSlots = [
    { day: "امروز", time: "۱۸ تا ۲۰", val: "امروز عصر" },
    { day: "فردا", time: "۸ تا ۱۰", val: "فردا صبح" },
    { day: "فردا", time: "۱۶ تا ۱۸", val: "فردا عصر" },
    { day: "پس‌فردا", time: "۸ تا ۱۰", val: "پس‌فردا صبح" },
];

const stepsData = [
    { id: 1, title: "نسخه", icon: FileText },
    { id: 2, title: "آزمایش‌ها", icon: TestTube },
    { id: 3, title: "زمان‌بندی", icon: CalendarDays },
];

export function LabsFlow() {
    const [step, setStep] = useState(1);
    const [prescriptionType, setPrescriptionType] = useState<"digital" | "paper">("digital");
    const [selectedTests, setSelectedTests] = useState<number[]>([]);
    const [selectedTime, setSelectedTime] = useState("");

    const toggleTest = (id: number) => {
        setSelectedTests((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const selectedItems = mockTests.filter((t) => selectedTests.includes(t.id));
    const totalPrice = selectedItems.reduce((sum, t) => sum + t.price, 0);

    return (
        <div className="h-[100dvh] bg-gradient-to-b from-blue-50 to-white text-right font-[YekanBakhFaNum] flex flex-col pb-24" dir="rtl">
            <AppBar />

            <div className="flex-1 overflow-y-auto flex flex-col px-5 pt-20 max-w-md mx-auto w-full relative">

                {/* Header & New Stepper */}
                <div className="mb-8 shrink-0">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center mb-6">درخواست آزمایش</h1>

                    <div className="relative flex justify-between items-center px-2">
                        {/* خط پس‌زمینه بین مراحل */}
                        <div className="absolute top-5 left-6 right-6 h-[2px] bg-blue-100 -z-10" />

                        {stepsData.map((s) => {
                            const isCompleted = step > s.id;
                            const isCurrent = step === s.id;
                            const StepIcon = isCompleted ? Check : s.icon;

                            return (
                                <div key={s.id} className="flex flex-col items-center gap-2 bg-transparent z-10">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                            isCompleted
                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                                                : isCurrent
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-white"
                                                    : "bg-white border-blue-200 text-blue-300 ring-4 ring-white"
                                        }`}
                                    >
                                        <StepIcon className={`w-5 h-5 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
                                    </div>
                                    <span
                                        className={`text-[11px] font-bold transition-colors duration-300 bg-white/80 px-1 rounded ${
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

                    {/* STEP 2: Grid Tests Selection */}
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
                        </div>
                    )}

                    {/* STEP 3: Time & Checkout */}
                    {step === 3 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">زمان نمونه‌گیری</h2>

                            <div className="flex overflow-x-auto gap-3 pb-6 shrink-0 [-ms-overflow-style:none] [scrollbar-width:none]">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.val}
                                        onClick={() => setSelectedTime(slot.val)}
                                        className={`min-w-[110px] shrink-0 p-4 rounded-3xl transition-all border-2 shadow-sm ${
                                            selectedTime === slot.val
                                                ? "border-blue-500 bg-blue-50/80"
                                                : "border-transparent bg-white hover:border-blue-200"
                                        }`}
                                    >
                                        <div className={`text-sm font-bold mb-2 ${selectedTime === slot.val ? "text-blue-700" : "text-slate-700"}`}>
                                            {slot.day}
                                        </div>
                                        <div className={`text-xs ${selectedTime === slot.val ? "text-blue-600" : "text-slate-500"}`}>
                                            ساعت {slot.time}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-2">
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
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* دکمه‌های مستقل شده */}
                <div className="mt-auto sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-white via-white to-transparent z-10">
                    <div className="flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-3xl border border-slate-100 shadow-sm">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                className="h-14 rounded-2xl px-4 border-blue-200 text-blue-600 hover:bg-blue-50 bg-white"
                                onClick={() => setStep(step - 1)}
                            >
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button className="flex-1 rounded-2xl h-14 text-base font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20" onClick={() => setStep(2)}>
                                مرحله بعد
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-blue-600/20"
                                disabled={selectedTests.length === 0}
                                onClick={() => setStep(3)}
                            >
                                مرحله بعد
                                {selectedTests.length > 0 && ` (${selectedItems.length} مورد)`}
                            </Button>
                        )}

                        {step === 3 && (
                            <Button
                                className="flex-1 rounded-2xl h-14 text-base font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:bg-slate-200 disabled:text-slate-400"
                                disabled={!selectedTime}
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
