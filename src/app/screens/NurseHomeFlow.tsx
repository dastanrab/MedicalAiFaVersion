import { useState } from "react";
import { useNavigate } from "react-router";
import { AppBar } from "../components/AppBar";
import { Button } from "../components/ui/button";
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
} from "lucide-react";

const nurseServices = [
    { id: 1, key: "injection", name: "تزریقات و سرم‌تراپی", desc: "تزریق دارو و سرم در منزل", price: 450000, icon: Syringe },
    { id: 2, key: "wound", name: "پانسمان و مراقبت از زخم", desc: "تعویض و مراقبت پانسمان", price: 380000, icon: Bandage },
    { id: 3, key: "elderly", name: "مراقبت از سالمند", desc: "ویزیت و مراقبت روزانه", price: 600000, icon: UserRound },
    { id: 4, key: "baby", name: "مراقبت از نوزاد", desc: "مراقبت و مانیتورینگ نوزاد", price: 550000, icon: Baby },
    { id: 5, key: "physio", name: "فیزیوتراپی در منزل", desc: "جلسات توانبخشی حرکتی", price: 520000, icon: Dumbbell },
    { id: 6, key: "general", name: "مراقبت عمومی", desc: "کمک در امور روزمره", price: 400000, icon: HeartHandshake },
];

const genderOptions: { value: "any" | "female" | "male"; label: string }[] = [
    { value: "any", label: "فرقی ندارد" },
    { value: "female", label: "پرستار خانم" },
    { value: "male", label: "پرستار آقا" },
];

const stepsData = [
    { id: 1, title: "نوع خدمت", icon: ListChecks },
    { id: 2, title: "اطلاعات بیمار", icon: MapPin },
];

export function NurseHomeFlow() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [genderPref, setGenderPref] = useState<"any" | "female" | "male">("any");
    const [address, setAddress] = useState("");
    const [condition, setCondition] = useState("");
    const [urgent, setUrgent] = useState(false);

    const service = nurseServices.find((s) => s.id === selectedService) ?? null;

    const isStep2Valid = address.trim().length > 0 && condition.trim().length > 0;

    if (submitted) {
        return (
            <div className="h-[100dvh] bg-gradient-to-b from-rose-50 to-white text-right font-[YekanBakhFaNum] flex flex-col" dir="rtl">
                <AppBar backTo="/services" />
                <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-200">
                        <PartyPopper className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="mb-2 text-xl font-black text-slate-800">درخواست شما ثبت شد</h1>
                    <p className="mb-8 max-w-sm text-center text-sm text-slate-500 leading-relaxed">
                        درخواست پرستار در منزل ثبت شد. به‌محض تخصیص پرستار، مشخصات و زمان دقیق مراجعه برای شما پیامک می‌شود.
                    </p>
                    <Button
                        className="rounded-2xl h-12 px-8 bg-rose-600 text-white hover:bg-rose-700"
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

            <div className="relative z-10 px-5 pt-24 pb-4 text-right sm:px-6">
                <div className="mb-8 shrink-0">
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

                    <div className="relative flex justify-between items-center px-2">
                        <div className="absolute top-5 left-6 right-6 -z-10 h-1 overflow-hidden rounded-full bg-rose-100">
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
                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                                                : isCurrent
                                                    ? "scale-110 bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200 ring-4 ring-white"
                                                    : "bg-white border-rose-200 text-rose-300 ring-4 ring-white"
                                        }`}
                                    >
                                        <StepIcon className={`w-5 h-5 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
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

                <div className="flex-1 flex flex-col pb-4">
                    {/* STEP 1: Service type */}
                    {step === 1 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">نوع خدمت مورد نیاز را انتخاب کنید</h2>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {nurseServices.map((svc) => {
                                    const isSelected = selectedService === svc.id;
                                    const Icon = svc.icon;
                                    return (
                                        <div
                                            key={svc.id}
                                            onClick={() => setSelectedService(svc.id)}
                                            className={`p-4 rounded-3xl cursor-pointer transition-all border-2 flex flex-col h-full ${
                                                isSelected ? "border-rose-500 bg-rose-50/80 shadow-sm" : "border-slate-100 bg-white hover:border-rose-200 shadow-sm"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2.5 rounded-2xl ${isSelected ? "bg-rose-600" : "bg-rose-50"}`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-rose-600"}`} />
                                                </div>
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                        isSelected ? "border-rose-600 bg-rose-600" : "border-slate-200"
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                            </div>

                                            <h3 className="text-sm font-bold text-slate-800 mb-1">{svc.name}</h3>
                                            <p className="text-[10px] text-slate-500 mb-4 flex-1">{svc.desc}</p>

                                            <div className="text-left mt-auto">
                                                <span className="text-base font-black text-slate-800">{svc.price.toLocaleString("fa-IR")}</span>
                                                <span className="text-[9px] text-slate-400 mr-1">تومان</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Patient info + address (needs assessment) */}
                    {step === 2 && (
                        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">اطلاعات بیمار و آدرس</h2>

                            <div className="mb-5">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 px-1">
                                    <Users className="w-3.5 h-3.5" />
                                    ترجیح جنسیت پرستار
                                </label>
                                <div className="flex bg-white shadow-sm p-1.5 rounded-2xl border border-rose-50">
                                    {genderOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setGenderPref(opt.value)}
                                            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                                                genderPref === opt.value ? "bg-rose-50 text-rose-700" : "text-slate-500"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2 px-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    آدرس محل مراجعه
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={3}
                                    placeholder="آدرس کامل، پلاک و واحد را وارد کنید"
                                    className="w-full rounded-2xl border border-rose-100 bg-white p-4 text-sm shadow-sm resize-none focus:border-rose-500 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>

                            <div className="mb-5">
                                <label className="text-xs font-bold text-slate-600 mb-2 px-1 block">شرح وضعیت بیمار</label>
                                <textarea
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    rows={3}
                                    placeholder="سن بیمار، شرایط حرکتی و نکات لازم برای پرستار را بنویسید"
                                    className="w-full rounded-2xl border border-rose-100 bg-white p-4 text-sm shadow-sm resize-none focus:border-rose-500 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>

                            <button
                                onClick={() => setUrgent((v) => !v)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 mb-5 transition-all shadow-sm ${
                                    urgent ? "border-rose-500 bg-rose-50/80" : "border-slate-100 bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Zap className={`w-5 h-5 ${urgent ? "text-rose-600" : "text-slate-400"}`} />
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-slate-700 block">درخواست فوری</span>
                                        <span className="text-[11px] text-slate-400">اعزام پرستار در کمتر از ۲ ساعت</span>
                                    </div>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-colors relative ${urgent ? "bg-rose-500" : "bg-slate-200"}`}>
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${urgent ? "right-0.5" : "right-5"}`} />
                                </div>
                            </button>

                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-50 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">نوع خدمت</span>
                                    <span className="font-bold text-slate-800">{service?.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                    <span className="text-slate-500">ترجیح جنسیت</span>
                                    <span className="font-bold text-slate-800">
                                        {genderOptions.find((g) => g.value === genderPref)?.label}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-sm font-bold text-slate-800">مبلغ قابل پرداخت</span>
                                    <div className="text-left">
                                        <span className="text-2xl font-black text-rose-600 tracking-tight">
                                            {(service?.price ?? 0).toLocaleString("fa-IR")}
                                        </span>
                                        <span className="text-xs text-slate-500 mr-1">تومان</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                                    {urgent
                                        ? "پرستار در کمتر از ۲ ساعت به آدرس شما اعزام می‌شود."
                                        : "زمان دقیق مراجعه پرستار پس از تأیید درخواست با شما هماهنگ می‌شود."}
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
                                className="h-12 w-12 shrink-0 rounded-full border-rose-100 bg-white p-0 text-rose-600 shadow-md shadow-rose-100/80 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => setStep(step - 1)}
                            >
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-600/30 hover:shadow-xl hover:shadow-rose-600/40 transition-all"
                                disabled={selectedService === null}
                                onClick={() => setStep(2)}
                            >
                                مرحله بعد
                                <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="rounded-full h-12 px-10 text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-600/30 hover:shadow-xl hover:shadow-rose-600/40 transition-all"
                                disabled={!isStep2Valid}
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
